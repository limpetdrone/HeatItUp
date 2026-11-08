import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');
export function runCommand(command, args, { cwd = root, env = process.env, capture = false } = {}) {
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit', maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw Error(`Cannot start ${command}: ${result.error.message}`);
  if (result.status !== 0) throw Error(`${command} failed (${result.signal || result.status}). No further release steps were run.`);
  return result.stdout || '';
}
export function validateSigning(identities, teamId) {
  if (!identities.split('\n').some(line => line.includes('Apple Distribution:') && line.includes(`(${teamId})`) && !line.includes('REVOKED'))) {
    throw Error(`No valid Apple Distribution identity for team ${teamId} is visible to this process. Run from the Mac terminal with access to the signing Keychain.`);
  }
}
export function verifyArtifact(record, expectedPackage) {
  if (!record || record.package !== expectedPackage || !record.ipa || !existsSync(record.ipa) || sha256(record.ipa) !== record.sha256) throw Error('No matching verified local IPA. Run npm run build:ios:local first.');
  return record.ipa;
}
export function iosRelease(mode, { workspace = root, run = runCommand, now = () => new Date(), env = process.env } = {}) {
  if (!['build', 'submit', 'release'].includes(mode)) throw Error('Use build, submit or release.');
  const config = JSON.parse(readFileSync(join(workspace, 'app.json'), 'utf8')).expo;
  const { bundleIdentifier, appleTeamId, buildNumber } = config.ios;
  if (!bundleIdentifier || !/^[A-Z0-9]{10}$/.test(appleTeamId || '') || !/^\d+$/.test(buildNumber || '')) throw Error('Configure the iOS package, Apple team and numeric buildNumber.');
  const pointer = join(workspace, 'build/ios/latest.json');
  const exec = (command, args, capture = false, childEnv = env) => run(command, args, { cwd: workspace, env: childEnv, capture });
  let record;
  if (mode !== 'submit') {
    exec('node', ['scripts/check-crash-reporting.mjs']);
    validateSigning(exec('security', ['find-identity', '-v', '-p', 'codesigning'], true), appleTeamId);
    exec('xcodebuild', ['-version']);
    const stamp = now().toISOString().replace(/[^0-9TZ]/g, '');
    const label = `${config.version}-${buildNumber}-${stamp}`;
    const output = join(workspace, 'dist-ios', label);
    const archive = join(workspace, 'build/ios', label + '.xcarchive');
    const sourceMap = join(workspace, 'build/ios', label + '.jsbundle.map');
    mkdirSync(dirname(archive), { recursive: true });
    exec('npx', ['expo', 'prebuild', '--platform', 'ios', '--no-install']);
    exec('pod', ['install', '--project-directory=ios', '--no-repo-update']);
    if (!readFileSync(join(workspace, 'ios/Podfile.lock'), 'utf8').includes('ExpoAppMetrics')) throw Error('The crash-reporting native pod is missing. Archive stopped.');
    const childEnv = { ...env, SOURCEMAP_FILE: sourceMap };
    exec('xcodebuild', ['-workspace', 'ios/HeatItUp.xcworkspace', '-scheme', 'HeatItUp', '-configuration', 'Release', '-destination', 'generic/platform=iOS', '-derivedDataPath', join(workspace, 'build/ios/DerivedData'), '-archivePath', archive, `DEVELOPMENT_TEAM=${appleTeamId}`, 'CODE_SIGN_STYLE=Manual', 'CODE_SIGN_IDENTITY=Apple Distribution', 'PROVISIONING_PROFILE_SPECIFIER=com.limpetdrone.heatitup AppStore', 'archive'], false, childEnv);
    const info = join(archive, 'Products/Applications/HeatItUp.app/Info.plist');
    const field = name => exec('/usr/libexec/PlistBuddy', ['-c', 'Print :' + name, info], true).trim();
    if (field('CFBundleIdentifier') !== bundleIdentifier || field('CFBundleVersion') !== buildNumber || field('CFBundleShortVersionString') !== config.version) throw Error('The archive package/version does not match app.json. Export stopped.');
    const sceneDelegate = field('UIApplicationSceneManifest:UISceneConfigurations:UIWindowSceneSessionRoleApplication:0:UISceneDelegateClassName');
    if (sceneDelegate !== 'EXExpoAppSceneDelegate') throw Error('Scene lifecycle configuration is missing; this build would fail on iOS 27. Export stopped.');
    exec('xcodebuild', ['-exportArchive', '-archivePath', archive, '-exportPath', output, '-exportOptionsPlist', 'exportOptions.plist']);
    const ipa = join(output, 'HeatItUp.ipa');
    if (!existsSync(ipa)) throw Error('Xcode did not produce the expected IPA. Nothing will be submitted.');
    record = { package: bundleIdentifier, version: config.version, buildNumber, ipa, archive, sourceMap: existsSync(sourceMap) ? sourceMap : null, sha256: sha256(ipa), createdAt: now().toISOString() };
    writeFileSync(pointer, JSON.stringify(record, null, 2) + '\n');
    console.log(`Verified local IPA: ${ipa}`);
  } else {
    if (!existsSync(pointer)) throw Error('No new local build is recorded. The old dist-ios/HeatItUp.ipa is not selected automatically.');
    record = JSON.parse(readFileSync(pointer, 'utf8'));
    if (record.buildNumber !== buildNumber || record.version !== config.version) throw Error('The recorded IPA does not match the current app version/buildNumber. Rebuild or explicitly review the intended build.');
  }
  const ipa = verifyArtifact(record, bundleIdentifier);
  if (mode !== 'build') {
    exec('eas', ['submit', '--platform', 'ios', '--profile', 'production', '--path', ipa, '--non-interactive', '--wait']);
    console.log(`Uploaded ${record.version} (${record.buildNumber}) through Expo Submit. Apple processing/tester availability must be checked in TestFlight.`);
  }
  return record;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { iosRelease(process.argv[2] || 'release'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
