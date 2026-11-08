import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../src/feedback/config.json', import.meta.url), 'utf8'));
if (!config.projectId) throw Error('Run setup-feedback.mjs first.');
const credentials = process.env.GOOGLE_OAUTH_ACCESS_TOKEN || spawnSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).stdout?.trim();
if (!credentials) throw Error('Sign in with gcloud auth login, or provide GOOGLE_OAUTH_ACCESS_TOKEN to this process.');
const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/${encodeURIComponent(config.databaseId)}/documents/submissions`;
let pageToken = '';
do {
  const url = new URL(base);
  url.searchParams.set('pageSize', '100');
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${credentials}` } });
  if (!response.ok) throw Error(`Feedback read failed (${response.status}). Firestore IAM read access is required.`);
  const page = await response.json();
  for (const document of page.documents || []) {
    const fields = Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, value.stringValue ?? value.timestampValue ?? (value.integerValue !== undefined ? Number(value.integerValue) : null)]));
    console.log(JSON.stringify({ id: document.name.split('/').at(-1), ...fields }));
  }
  pageToken = page.nextPageToken || '';
} while (pageToken);
