import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sdk = resolve(root, 'node_modules/expo-observe/package.json');
const adapter = resolve(root, 'src/monitoring/observe.native.js');
const eas = JSON.parse(readFileSync(resolve(root, 'eas.json'), 'utf8'));
if (!existsSync(sdk) || !existsSync(adapter) || eas.build?.production?.uploadSourceMaps !== true) {
  console.error('Crash reporting is NOT active. Run npm run setup:crash-reporting with network access.');
  process.exitCode = 1;
} else {
  console.log(`Expo Observe ${JSON.parse(readFileSync(sdk, 'utf8')).version} configured for native builds. Online delivery still requires a new build and a verified test event.`);
}
