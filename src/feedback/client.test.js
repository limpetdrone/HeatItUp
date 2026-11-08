import { test, expect, jest } from '@jest/globals';
import { feedbackPayload, sendFeedback, cardFingerprint } from './client';
const card = { id: 'test-card', text: 'Neutral test', kind: 'question', intensity: 2 };
const configuration = { projectId: 'test-project', databaseId: 'heatitup-feedback' };
const payload = feedbackPayload({ type: 'report', card, language: 'hu' });
test('reports allow an empty description and whitelist metadata without player data', () => {
  const data = feedbackPayload({ type: 'report', card: { ...card, players: ['Private name'] }, language: 'hu', players: ['Private name'] });
  expect(data.message).toBe('');
  expect(JSON.stringify(data)).not.toContain('Private name');
  expect(data.cardFingerprint).toBe(cardFingerprint(card));
  expect(cardFingerprint({ ...card, text: 'Revised neutral text' })).not.toBe(data.cardFingerprint);
});
test('suggestions require text, a valid kind and a level; descriptions are bounded', () => {
  expect(() => feedbackPayload({ type: 'suggestion', language: 'en', message: ' ', kind: 'question', level: 1 })).toThrow();
  const data = feedbackPayload({ type: 'suggestion', language: 'de', message: ' New idea ', kind: 'challenge', level: 3 });
  expect(data.message).toBe('New idea');
  expect(data.cardId).toBe('');
  expect(() => feedbackPayload({ type: 'report', card, language: 'hu', message: 'x'.repeat(2001) })).toThrow();
});
test('REST writes target the dedicated database; retry conflicts are idempotent', async () => {
  const fetchImpl = jest.fn().mockResolvedValue({ ok: true, status: 200 });
  await sendFeedback('feedback-test-1', payload, { configuration, fetchImpl });
  expect(fetchImpl.mock.calls[0][0]).toContain('/databases/heatitup-feedback/documents/submissions?documentId=feedback-test-1');
  const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
  expect(body.fields.message).toEqual({ stringValue: '' });
  fetchImpl.mockResolvedValue({ ok: false, status: 409 });
  await expect(sendFeedback('feedback-test-1', payload, { configuration, fetchImpl })).resolves.toBeUndefined();
});
test('missing configuration and rejected writes never report success', async () => {
  const fetchImpl = jest.fn().mockResolvedValue({ ok: false, status: 403 });
  await expect(sendFeedback('feedback-test-1', payload, { configuration: { projectId: '' }, fetchImpl })).rejects.toThrow();
  expect(fetchImpl).not.toHaveBeenCalled();
  await expect(sendFeedback('feedback-test-1', payload, { configuration, fetchImpl })).rejects.toThrow();
});
