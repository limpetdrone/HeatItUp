import { createPrivateKey } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseArguments(args) {
  const [mode = 'check', ...rest] = args;
  if (!['check', 'build', 'submit', 'release'].includes(mode)) throw Error('Use check, build, submit or release.');
  const options = { mode };
  for (let i = 0; i < rest.length; i += 2) {
    const flag = rest[i];
    if (!['--path', '--id'].includes(flag) || !rest[i + 1] || rest[i + 1].startsWith('--') || options[flag.slice(2)]) throw Error('Use --path FILE.aab or --id EAS_BUILD_ID.');
    options[flag.slice(2)] = rest[i + 1];
  }
  if (mode === 'submit' ? Boolean(options.path) === Boolean(options.id) : options.path || options.id) throw Error('Only submit accepts exactly one of --path or --id.');
  if (options.id && !uuid.test(options.id)) throw Error('Invalid EAS build ID.');
  return options;
}

export function validateConfiguration(eas, app) {
  const android = eas.submit?.production?.android;
  if (!app.expo?.android?.package || !uuid.test(app.expo?.extra?.eas?.projectId || '')) throw Error('Android package and EAS project ID are required.');
  if (eas.build?.production?.android?.buildType !== 'app-bundle' || eas.build.production.autoIncrement !== true || eas.cli?.appVersionSource !== 'remote') throw Error('Production must build an AAB with remote auto-incremented version codes.');
  if (android?.track !== 'alpha' || android?.releaseStatus !== 'draft') throw Error('This uploader expects an alpha draft release. Review track/status changes explicitly.');
  if (android.serviceAccountKeyPath !== '$GOOGLE_SERVICE_ACCOUNT_KEY_PATH') throw Error('Use $GOOGLE_SERVICE_ACCOUNT_KEY_PATH in eas.json.');
}

export function readCredentials(keyPath, workspace = root) {
  const path = resolve(keyPath);
  const inside = relative(workspace, path);
  if (inside === '' || (!inside.startsWith('..' + sep) && inside !== '..' && !isAbsolute(inside))) throw Error('Keep the service account key outside the repository.');
  if (!existsSync(path)) throw Error('Service account key not found. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH to its JSON file.');
  let key;
  try {
    key = JSON.parse(readFileSync(path, 'utf8'));
    if (key.type !== 'service_account' || typeof key.client_email !== 'string' || !key.client_email.endsWith('.iam.gserviceaccount.com') || !key.project_id || createPrivateKey(key.private_key).asymmetricKeyType !== 'rsa') throw Error('invalid');
  } catch {
    throw Error('Invalid Google Play service account JSON/RSA key.');
  }
  return path;
}

export function finishedBuild(output, projectId) {
  let builds;
  try { builds = JSON.parse(output); } catch { throw Error('EAS did not return valid build JSON; nothing was submitted.'); }
  if (!Array.isArray(builds) || builds.length !== 1) throw Error('Expected exactly one Android build; nothing was submitted.');
  const build = builds[0];
  if (!uuid.test(build.id || '') || build.platform !== 'ANDROID' || build.status !== 'FINISHED' || (build.project?.id && build.project.id !== projectId)) throw Error('Build was not a finished Android build for this project; nothing was submitted.');
  return build.id;
}

export function runCommand(command, args, { capture = false, env = process.env } = {}) {
  const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit', maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw Error(`Cannot start ${command}: ${result.error.message}`);
  if (result.status !== 0) throw Error(`${command} failed (${result.signal || result.status}). The release pipeline stopped.`);
  return result.stdout || '';
}

export function releasePipeline(options, { run = runCommand, env = process.env, workspace = root } = {}) {
  const eas = JSON.parse(readFileSync(resolve(workspace, 'eas.json'), 'utf8'));
  const app = JSON.parse(readFileSync(resolve(workspace, 'app.json'), 'utf8'));
  validateConfiguration(eas, app);
  const keyPath = readCredentials(env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || resolve(homedir(), '.private_keys/google-play-key.json'), workspace);
  const childEnv = { ...env, GOOGLE_SERVICE_ACCOUNT_KEY_PATH: keyPath };
  const exec = (command, args, capture = false) => run(command, args, { capture, env: childEnv });
  console.log(`Android: ${app.expo.android.package}; target: alpha / draft.`);
  if (options.mode === 'check') {
    console.log('Local configuration and RSA key are valid. Play Console permissions and Expo login require an online run.');
    return;
  }
  if (options.path) {
    const artifact = resolve(options.path);
    if (!artifact.toLowerCase().endsWith('.aab') || !statSync(artifact).isFile() || statSync(artifact).size === 0) throw Error('Specify an existing non-empty .aab file.');
    const entries = exec('unzip', ['-Z1', artifact], true).split(/\r?\n/);
    if (!entries.includes('BundleConfig.pb') || !entries.includes('base/manifest/AndroidManifest.xml')) throw Error('The supplied archive is not an Android App Bundle.');
  }
  // Fail before starting a paid build if Expo authentication/network access is unavailable.
  exec('eas', ['whoami']);
  let id = options.id;
  if (options.mode === 'build' || options.mode === 'release') {
    exec('npm', ['test']);
    exec('npm', ['run', 'lint']);
    const output = exec('eas', ['build', '--platform', 'android', '--profile', 'production', '--non-interactive', '--wait', '--json', '--freeze-credentials'], true);
    id = finishedBuild(output, app.expo.extra.eas.projectId);
    console.log(`Finished Android build: ${id}`);
  }
  if (options.mode === 'build') return id;
  if (options.id) {
    const output = exec('eas', ['build:view', options.id, '--json'], true);
    finishedBuild(JSON.stringify([JSON.parse(output)]), app.expo.extra.eas.projectId);
  }
  exec('eas', ['submit', '--platform', 'android', '--profile', 'production', ...(options.path ? ['--path', resolve(options.path)] : ['--id', id]), '--non-interactive', '--wait']);
  console.log('Google Play submission completed (alpha draft).');
  return id;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { releasePipeline(parseArguments(process.argv.slice(2))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
