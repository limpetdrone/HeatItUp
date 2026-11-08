import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageFile = resolve(root, 'package.json');
const before = JSON.parse(readFileSync(packageFile, 'utf8'));
const project = JSON.parse(readFileSync(resolve(root, 'app.json'), 'utf8'));
if (!project.expo.extra?.eas?.projectId) throw Error('Configure the existing EAS project ID first.');
if (!/^~?57\./.test(before.dependencies.expo)) throw Error('This integration targets Expo SDK 57.');

// npm 11 resolves this optional Router peer to SDK 58 even in an SDK 57 app.
// Router integrations are unused here; SDK selection still comes from expo install.
const install = spawnSync('npx', ['expo', 'install', 'expo-observe', '--npm', '--', '--legacy-peer-deps'], { cwd: root, stdio: 'inherit' });
if (install.error || install.status !== 0) {
  // Expo changes package.json before npm resolves the dependency; undo only that field.
  const current = JSON.parse(readFileSync(packageFile, 'utf8'));
  if (before.dependencies['expo-observe']) current.dependencies['expo-observe'] = before.dependencies['expo-observe'];
  else delete current.dependencies['expo-observe'];
  writeFileSync(packageFile, JSON.stringify(current, null, 2) + '\n');
  console.error('SDK installation failed; crash reporting was not activated. See the npm error above; retry after resolving it.');
  process.exitCode = 1;
} else {
  const installed = JSON.parse(readFileSync(resolve(root, 'node_modules/expo-observe/package.json'), 'utf8'));
  const [major, minor, patch] = installed.version.split('.').map(Number);
  if (major !== 57 || minor !== 0 || patch < 21) throw Error('expo-observe 57.0.21 or newer within SDK 57 is required for native crashes.');
  const native = resolve(root, 'src/monitoring/observe.native.js');
  const template = resolve(root, 'scripts/templates/observe.native.js');
  if (existsSync(native) && readFileSync(native, 'utf8') !== readFileSync(template, 'utf8')) throw Error('The native adapter has custom edits. Review it before replacing it.');
  copyFileSync(template, native);
  const easFile = resolve(root, 'eas.json');
  const eas = JSON.parse(readFileSync(easFile, 'utf8'));
  eas.cli.version = '>= 22.2.0';
  eas.build.production.uploadSourceMaps = true;
  writeFileSync(easFile, JSON.stringify(eas, null, 2) + '\n');
  console.log('Expo Observe activated. Now run npm test, npm run lint and npm run export, then create a new native build.');
}
