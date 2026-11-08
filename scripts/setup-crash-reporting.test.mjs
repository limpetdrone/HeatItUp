import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function fixture(mode) {
  const dir = mkdtempSync(join(tmpdir(), 'heatitup-observe-'));
  for (const name of ['scripts/templates', 'src/monitoring', 'bin']) mkdirSync(join(dir, name), { recursive: true });
  copyFileSync(resolve('scripts/setup-crash-reporting.mjs'), join(dir, 'scripts/setup-crash-reporting.mjs'));
  copyFileSync(resolve('scripts/templates/observe.native.js'), join(dir, 'scripts/templates/observe.native.js'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { expo: '~57.0.32' }, scripts: { keep: 'original' } }));
  writeFileSync(join(dir, 'app.json'), JSON.stringify({ expo: { extra: { eas: { projectId: 'test-project' } } } }));
  writeFileSync(join(dir, 'eas.json'), JSON.stringify({ cli: { version: '>=16.0.0' }, build: { production: { autoIncrement: true } }, submit: { production: { android: { track: 'alpha' } } } }));
  const fake = `#!${process.execPath}\nif(!process.argv.includes('--legacy-peer-deps')){console.error('Missing optional-peer workaround');process.exit(42);}const fs=require('node:fs'); const p=JSON.parse(fs.readFileSync('package.json'));p.dependencies['expo-observe']='~57.0.27';p.scripts.otherAgent='preserved';fs.writeFileSync('package.json',JSON.stringify(p));` + (mode === 'fail' ? 'process.exit(1);' : `fs.mkdirSync('node_modules/expo-observe',{recursive:true});fs.writeFileSync('node_modules/expo-observe/package.json',JSON.stringify({version:'57.0.27'}));`);
  writeFileSync(join(dir, 'bin/npx'), fake, { mode: 0o755 });
  return { dir, run: () => spawnSync(process.execPath, ['scripts/setup-crash-reporting.mjs'], { cwd: dir, encoding: 'utf8', env: { ...process.env, PATH: join(dir, 'bin') + ':' + process.env.PATH } }) };
}

test('installer failure rolls back only its dependency and never activates reporting', () => {
  const { dir, run } = fixture('fail');
  try {
    const result = run();
    assert.equal(result.status, 1);
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    assert.equal(pkg.dependencies['expo-observe'], undefined);
    assert.equal(pkg.scripts.otherAgent, 'preserved');
    assert.ok(!existsSync(join(dir, 'src/monitoring/observe.native.js')));
    assert.equal(JSON.parse(readFileSync(join(dir, 'eas.json'), 'utf8')).build.production.uploadSourceMaps, undefined);
  } finally { rmSync(dir, { recursive: true }); }
});

test('successful setup activates the adapter and source maps while preserving existing configuration', () => {
  const { dir, run } = fixture('success');
  try {
    const result = run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(join(dir, 'src/monitoring/observe.native.js'), 'utf8'), readFileSync(resolve('scripts/templates/observe.native.js'), 'utf8'));
    const eas = JSON.parse(readFileSync(join(dir, 'eas.json'), 'utf8'));
    assert.equal(eas.build.production.uploadSourceMaps, true);
    assert.equal(eas.build.production.autoIncrement, true);
    assert.equal(eas.submit.production.android.track, 'alpha');
    assert.equal(run().status, 0);
  } finally { rmSync(dir, { recursive: true }); }
});

test('setup refuses to overwrite a manually customized native adapter', () => {
  const { dir, run } = fixture('success');
  try {
    writeFileSync(join(dir, 'src/monitoring/observe.native.js'), '// keep this custom adapter');
    assert.equal(run().status, 1);
    assert.equal(readFileSync(join(dir, 'src/monitoring/observe.native.js'), 'utf8'), '// keep this custom adapter');
  } finally { rmSync(dir, { recursive: true }); }
});
