import { test, expect } from '@jest/globals';
import { resolveLanguage, translate } from './core';
import { cardMessages } from './cardMessages';
import { messages } from './messages';
import { cards } from '../data/cards';
test('device preference, fallback, regional tags and explicit override', () => {
  expect(resolveLanguage('auto', ['de-AT', 'en-US'])).toBe('de');
  expect(resolveLanguage('auto', ['fr-FR', 'hu-HU'])).toBe('hu');
  expect(resolveLanguage('auto', ['ja-JP'])).toBe('en');
  expect(resolveLanguage('hu', ['de-DE'])).toBe('hu');
});
test('all cards have complete non-empty translations', () => {
  for (const card of cards) for (const language of ['en', 'de']) {
    expect(translate(card.text, language)).not.toBe(card.text);
    expect(translate(card.text, language).trim()).not.toBe('');
  }
  for (const row of [...messages, ...cardMessages]) expect(row.every(v => typeof v === 'string' && v.trim())).toBe(true);
});
test('interpolation, whitespace and unknown user-authored text', () => {
  expect(translate('2/3 KÖR', 'en')).toBe('ROUND 2/3');
  expect(translate('Játékos 2', 'de')).toBe('Person 2');
  expect(translate('  Kész ✓ ', 'en')).toBe('  Done ✓ ');
  expect(translate('Ági', 'en')).toBe('Ági');
});
