import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { iosRelease, validateSigning } from './ios-release.mjs';
const team = '6Z45F3A37G';
function fixture({ signing = true, exportFailure = false, sceneMissing = false } = {}) {
  const workspace = mkdtempSync(join(tmpdir(), 'heatitup-ios-release-'));
  mkdirSync(join(workspace, 'ios'), { recursive: true });
  writeFileSync(join(workspace, 'app.json'), JSON.stringify({ expo: { version: '1.0.0', ios: { bundleIdentifier: 'com.limpetdrone.heatitup', buildNumber: '7', appleTeamId: team } } }));
  const calls = [];
  const run = (command, args, options) => {
    calls.push({ command, args, options });
    if (command === 'security') return signing ? `1) ABC "Apple Distribution: Test (${team})"\n1 valid identities found` : '0 valid identities found';
    if (command === 'pod') writeFileSync(join(workspace, 'ios/Podfile.lock'), 'ExpoAppMetrics');
    if (command.endsWith('PlistBuddy')) return { 'Print :CFBundleIdentifier': 'com.limpetdrone.heatitup', 'Print :CFBundleVersion': '7', 'Print :CFBundleShortVersionString': '1.0.0', 'Print :UIApplicationSceneManifest:UISceneConfigurations:UIWindowSceneSessionRoleApplication:0:UISceneDelegateClassName': sceneMissing ? '' : 'EXExpoAppSceneDelegate' }[args[1]];
    if (command === 'xcodebuild' && args.includes('-exportArchive')) {
      if (exportFailure) throw Error('export failed');
      const output = args[args.indexOf('-exportPath') + 1];
      mkdirSync(output, { recursive: true });
      writeFileSync(join(output, 'HeatItUp.ipa'), 'new IPA fixture');
    }
    return '';
  };
  return { workspace, calls, run, now: () => new Date('2026-11-08T21:30:00.000Z') };
}

test('signing requires the correct valid distribution identity', () => {
  validateSigning(`Apple Distribution: Person (${team})`, team);
  assert.throws(() => validateSigning('0 valid identities found', team));
  assert.throws(() => validateSigning('Apple Development: Person (' + team + ')', team));
  assert.throws(() => validateSigning('Apple Distribution: Person (' + team + ') REVOKED', team));
});
test('missing signing access stops before prebuild and upload', () => {
  const f = fixture({ signing: false });
  try {
    assert.throws(() => iosRelease('release', f), /No valid Apple Distribution/);
    assert.ok(!f.calls.some(c => c.command === 'npx' || c.command === 'eas'));
  } finally { rmSync(f.workspace, { recursive: true }); }
});
test('local release archives and exports before submitting that exact IPA through Expo', () => {
  const f = fixture();
  try {
    const record = iosRelease('release', f);
    const submit = f.calls.at(-1);
    assert.equal(submit.command, 'eas');
    assert.deepEqual(submit.args, ['submit', '--platform', 'ios', '--profile', 'production', '--path', record.ipa, '--non-interactive', '--wait']);
    assert.ok(f.calls.some(c => c.command === 'pod'));
    assert.ok(f.calls.some(c => c.args.includes('archive') && c.options.env.SOURCEMAP_FILE.endsWith('.map')));
    assert.equal(JSON.parse(readFileSync(join(f.workspace, 'build/ios/latest.json'))).sha256, record.sha256);
    assert.ok(record.ipa.includes('1.0.0-7-'));
  } finally { rmSync(f.workspace, { recursive: true }); }
});
test('failed export never submits or records a completed build', () => {
  const f = fixture({ exportFailure: true });
  try {
    assert.throws(() => iosRelease('release', f), /export failed/);
    assert.ok(!f.calls.some(c => c.command === 'eas'));
    assert.ok(!existsSync(join(f.workspace, 'build/ios/latest.json')));
  } finally { rmSync(f.workspace, { recursive: true }); }
});
test('submit-only reuses the verified artifact and rejects a modified IPA', () => {
  const f = fixture();
  try {
    const record = iosRelease('build', f);
    f.calls.length = 0;
    iosRelease('submit', f);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].command, 'eas');
    writeFileSync(record.ipa, 'modified');
    assert.throws(() => iosRelease('submit', f), /verified local IPA/);
  } finally { rmSync(f.workspace, { recursive: true }); }
});
test('submit never silently selects the old legacy IPA', () => {
  const f = fixture();
  try {
    mkdirSync(join(f.workspace, 'dist-ios'), { recursive: true });
    writeFileSync(join(f.workspace, 'dist-ios/HeatItUp.ipa'), 'old build 6');
    assert.throws(() => iosRelease('submit', f), /old dist-ios/);
    assert.ok(!f.calls.some(c => c.command === 'eas'));
  } finally { rmSync(f.workspace, { recursive: true }); }
});

test('an archive missing the scene lifecycle cannot be exported or submitted', () => {
  const f = fixture({ sceneMissing: true });
  try {
    assert.throws(() => iosRelease('release', f), /Scene lifecycle configuration is missing/);
    assert.ok(!f.calls.some(c => c.command === 'eas' || c.args.includes('-exportArchive')));
  } finally { rmSync(f.workspace, { recursive: true }); }
});
