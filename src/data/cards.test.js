import { test, expect } from '@jest/globals';
import { cards } from './cards';

const levels = [1, 2, 3, 4, 5];

test('every level has at least 30 questions and 30 challenges', () => {
  for (const intensity of levels) for (const kind of ['question', 'challenge']) {
    expect(cards.filter(card => card.intensity === intensity && card.kind === kind).length).toBeGreaterThanOrEqual(30);
  }
});

test('cards are unique and fully translated', () => {
  expect(new Set(cards.map(card => card.id)).size).toBe(cards.length);
  for (const card of cards) for (const language of ['en', 'hu', 'de']) {
    expect(card.translations[language].trim().length).toBeGreaterThan(0);
  }
});

test('explicit categories only appear from level 4 and body-wheel cards use the placeholder', () => {
  const explicit = cards.filter(card => ['oral', 'penetration'].includes(card.interaction.category));
  expect(explicit.length).toBeGreaterThan(0);
  expect(explicit.every(card => card.intensity >= 4)).toBe(true);
  const bodyCards = cards.filter(card => card.interaction.bodyParts);
  expect(bodyCards.length).toBeGreaterThanOrEqual(levels.length);
  expect(bodyCards.every(card => Object.values(card.translations).every(text => text.includes('{bodyPart}')))).toBe(true);
});
