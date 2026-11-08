import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const projectId = process.argv[2];
const databaseId = 'heatitup-feedback';
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId || '')) throw Error('Usage: node scripts/setup-feedback.mjs FIREBASE_PROJECT_ID');
function firebase(args, json = false) {
  const result = spawnSync('firebase', [...args, '--project', projectId, ...(json ? ['--json'] : [])], { cwd: root, encoding: 'utf8', stdio: json ? 'pipe' : 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error('Firebase command failed. Check firebase login and project access, then retry.');
  return json ? JSON.parse(result.stdout).result : null;
}
const databases = firebase(['firestore:databases:list'], true);
if (!databases.some(database => database.name.endsWith('/' + databaseId))) firebase(['firestore:databases:create', databaseId, '--location', 'europe-west3']);
firebase(['deploy', '--only', 'firestore:rules', '--config', 'firebase.json']);
writeFileSync(new URL('../src/feedback/config.json', import.meta.url), JSON.stringify({ projectId, databaseId }, null, 2) + '\n');
console.log('Feedback configured. Rebuild/export the app to include this configuration.');
