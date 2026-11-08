import config from './config.json';

export const feedbackConfigured = Boolean(config.projectId);
export const newFeedbackId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

export function cardFingerprint(card) {
  let hash = 2166136261;
  const value = JSON.stringify([card.id, card.text, card.translations, card.interaction]);
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

export function feedbackPayload({ type, message = '', card, language, kind, level }) {
  const text = message.trim();
  if (!['report', 'suggestion'].includes(type) || !['hu', 'en', 'de'].includes(language) || text.length > 2000 || (type === 'suggestion' && !text)) throw Error('Érvénytelen visszajelzés.');
  if (type === 'report' && !card?.id) throw Error('Érvénytelen visszajelzés.');
  const cardKind = type === 'report' ? card.kind : kind;
  const intensity = type === 'report' ? card.intensity : level;
  if (!['question', 'challenge'].includes(cardKind) || ![1, 2, 3, 4, 5].includes(intensity)) throw Error('Érvénytelen visszajelzés.');
  return {
    schemaVersion: 1, type, message: text, language, kind: cardKind, level: intensity,
    cardId: type === 'report' ? card.id : '',
    cardFingerprint: type === 'report' ? cardFingerprint(card) : '',
    appVersion: '1.0.0'
  };
}

export async function sendFeedback(id, payload, { fetchImpl = fetch, configuration = config, now = () => new Date(), timeoutMs = 15000 } = {}) {
  if (!configuration.projectId) throw Error('Az online visszajelzés még nincs beállítva.');
  if (!/^[a-zA-Z0-9_-]{10,100}$/.test(id)) throw Error('Érvénytelen visszajelzés.');
  const fields = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key,
    typeof value === 'number' ? { integerValue: String(value) } : { stringValue: value }
  ]));
  fields.createdAt = { timestampValue: now().toISOString() };
  const project = encodeURIComponent(configuration.projectId);
  const database = encodeURIComponent(configuration.databaseId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`https://firestore.googleapis.com/v1/projects/${project}/databases/${database}/documents/submissions?documentId=${encodeURIComponent(id)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }), signal: controller.signal
    });
    // A retry after a lost acknowledgement uses the same ID, so it cannot create a duplicate.
    if (response.status === 409) return;
    if (!response.ok) throw Error('A beküldés nem sikerült. Próbáld újra; a szöveg megmaradt.');
  } catch (error) {
    if (error.name === 'AbortError') throw Error('A beküldés nem sikerült. Próbáld újra; a szöveg megmaradt.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
