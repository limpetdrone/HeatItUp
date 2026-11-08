import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArguments, validateConfiguration, readCredentials, finishedBuild, releasePipeline } from './android-release.mjs';
const workspace = mkdtempSync(join(tmpdir(), 'heatitup-release-test-'));
const secretDir = mkdtempSync(join(tmpdir(), 'heatitup-play-test-'));
const projectId = '11111111-1111-4111-8111-111111111111';
const buildId = '22222222-2222-4222-8222-222222222222';
const eas = { cli: { appVersionSource: 'remote' }, build: { production: { autoIncrement: true, android: { buildType: 'app-bundle' } } }, submit: { production: { android: { track: 'alpha', releaseStatus: 'draft', serviceAccountKeyPath: '$GOOGLE_SERVICE_ACCOUNT_KEY_PATH' } } } };
const app = { expo: { android: { package: 'com.example.test' }, extra: { eas: { projectId } } } };
const build = { id: buildId, status: 'FINISHED', platform: 'ANDROID', project: { id: projectId } };
writeFileSync(join(workspace, 'eas.json'), JSON.stringify(eas));
writeFileSync(join(workspace, 'app.json'), JSON.stringify(app));
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const keyPath = join(secretDir, 'key.json');
writeFileSync(keyPath, JSON.stringify({ type: 'service_account', project_id: 'test-project', client_email: 'test@test-project.iam.gserviceaccount.com', private_key: privateKey.export({ format: 'pem', type: 'pkcs8' }) }), { mode: 0o600 });
after(() => { rmSync(workspace, { recursive: true }); rmSync(secretDir, { recursive: true }); });
function fakeRunner({ buildOutput = JSON.stringify([build]), failAt } = {}) {
  const calls = [];
  const run = (command, args, options) => {
    calls.push({ command, args, options });
    if (failAt?.(command, args)) throw Error('intentional command failure');
    if (command === 'unzip') return 'BundleConfig.pb\nbase/manifest/AndroidManifest.xml\n';
    if (args[0] === 'build') return buildOutput;
    if (args[0] === 'build:view') return JSON.stringify(build);
    return '';
  };
  return { run, calls, workspace, env: { GOOGLE_SERVICE_ACCOUNT_KEY_PATH: keyPath } };
}
test('submit requires an explicit unambiguous artifact or build UUID', () => {
  assert.deepEqual(parseArguments(['submit', '--id', buildId]), { mode: 'submit', id: buildId });
  for (const args of [['submit'], ['submit', '--latest'], ['submit', '--id', 'bad'], ['submit', '--id', buildId, '--path', 'a.aab'], ['release', '--id', buildId], ['submit', '--path']]) assert.throws(() => parseArguments(args));
});
test('release guard rejects changed distribution target and non-AAB version configuration', () => {
  validateConfiguration(eas, app);
  const changed = structuredClone(eas);
  changed.submit.production.android.releaseStatus = 'completed';
  assert.throws(() => validateConfiguration(changed, app));
  changed.submit.production.android.releaseStatus = 'draft';
  changed.build.production.autoIncrement = false;
  assert.throws(() => validateConfiguration(changed, app));
});
test('malformed keys and credentials inside the repository are rejected', () => {
  assert.equal(readCredentials(keyPath, workspace), keyPath);
  assert.throws(() => readCredentials(join(workspace, 'key.json'), workspace), /outside/);
  const badPath = join(secretDir, 'bad.json');
  writeFileSync(badPath, '{"type":"service_account"}');
  assert.throws(() => readCredentials(badPath, workspace), /Invalid/);
});
test('only a single successful Android build from this project can be submitted', () => {
  assert.equal(finishedBuild(JSON.stringify([build]), projectId), buildId);
  for (const data of [[], [build, build], [{ ...build, status: 'ERRORED' }], [{ ...build, platform: 'IOS' }], [{ ...build, project: { id: buildId } }]]) assert.throws(() => finishedBuild(JSON.stringify(data), projectId));
  assert.throws(() => finishedBuild('not JSON', projectId));
});
test('full release submits exactly its own finished build and waits for submission', () => {
  const runner = fakeRunner();
  releasePipeline({ mode: 'release' }, runner);
  const commands = runner.calls.map(c => [c.command, ...c.args]);
  assert.deepEqual(commands.slice(0, 3), [['eas', 'whoami'], ['npm', 'test'], ['npm', 'run', 'lint']]);
  assert.deepEqual(commands.at(-1), ['eas', 'submit', '--platform', 'android', '--profile', 'production', '--id', buildId, '--non-interactive', '--wait']);
  assert.ok(runner.calls.every(call => call.options.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH === keyPath));
});
test('failed authentication, tests, lint or build stops submission', () => {
  for (const failure of [(c, a) => a[0] === 'whoami', (c, a) => c === 'npm' && a[0] === 'test', (c, a) => c === 'npm' && a[1] === 'lint', (c, a) => a[0] === 'build']) {
    const runner = fakeRunner({ failAt: failure });
    assert.throws(() => releasePipeline({ mode: 'release' }, runner));
    assert.ok(!runner.calls.some(c => c.args[0] === 'submit'));
  }
});
test('invalid build output stops submission', () => {
  const runner = fakeRunner({ buildOutput: '[]' });
  assert.throws(() => releasePipeline({ mode: 'release' }, runner));
  assert.ok(!runner.calls.some(c => c.args[0] === 'submit'));
});
test('existing build is checked before submission and does not start a new build', () => {
  const runner = fakeRunner();
  releasePipeline({ mode: 'submit', id: buildId }, runner);
  assert.deepEqual(runner.calls.map(c => c.args[0]), ['whoami', 'build:view', 'submit']);
});
test('local AAB can be uploaded without starting a new build', () => {
  const artifact = join(workspace, 'test.aab');
  writeFileSync(artifact, 'test bundle fixture');
  const runner = fakeRunner();
  releasePipeline({ mode: 'submit', path: artifact }, runner);
  assert.deepEqual(runner.calls.map(c => c.command), ['unzip', 'eas', 'eas']);
  assert.ok(runner.calls.at(-1).args.includes(artifact));
});
test('local check makes no network calls and build-only never submits', () => {
  const checker = fakeRunner();
  releasePipeline({ mode: 'check' }, checker);
  assert.equal(checker.calls.length, 0);
  const builder = fakeRunner();
  assert.equal(releasePipeline({ mode: 'build' }, builder), buildId);
  assert.ok(!builder.calls.some(c => c.args[0] === 'submit'));
});
