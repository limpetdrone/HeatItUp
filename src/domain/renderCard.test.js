import { test, expect } from '@jest/globals';
import { renderCard, insertPartnerName, inflectHu } from './renderCard';

test('inflectHu produces correct Hungarian noun endings for names', () => {
  expect(inflectHu('Kriszta', 't')).toBe('Krisztát');
  expect(inflectHu('Kriszta', 'val')).toBe('Krisztával');
  expect(inflectHu('Kriszta', 'nak')).toBe('Krisztának');
  expect(inflectHu('Kriszta', 'hoz')).toBe('Krisztához');
  expect(inflectHu('Kriszta', 'ra')).toBe('Krisztára');

  expect(inflectHu('Dávid', 't')).toBe('Dávidot');
  expect(inflectHu('Dávid', 'val')).toBe('Dáviddal');
  expect(inflectHu('Dávid', 'nak')).toBe('Dávidnak');

  expect(inflectHu('Péter', 't')).toBe('Pétert');
  expect(inflectHu('Péter', 'val')).toBe('Péterrel');
  expect(inflectHu('Péter', 'nak')).toBe('Péternek');

  expect(inflectHu('Anna', 't')).toBe('Annát');
  expect(inflectHu('Anna', 'val')).toBe('Annával');

  expect(inflectHu('Gergő', 't')).toBe('Gergőt');
  expect(inflectHu('Gergő', 'val')).toBe('Gergővel');

  expect(inflectHu('Balázs', 'val')).toBe('Balázzsal');
});

test('insertPartnerName replaces player placeholders in English and Hungarian', () => {
  const en = 'Pull the selected player onto the couch in a spooning position, slide your hand inside their underwear from behind, and stroke them slowly for 30 seconds.';
  expect(insertPartnerName(en, 'Kriszta')).toBe(
    'Pull Kriszta onto the couch in a spooning position, slide your hand inside their underwear from behind, and stroke them slowly for 30 seconds.'
  );

  const hu1 = 'Húzd a kijelölt játékost a kanapéra kanál pózban!';
  expect(insertPartnerName(hu1, 'Kriszta')).toBe('Húzd Krisztát a kanapéra kanál pózban!');

  const hu2 = 'Állj a kijelölt játékos mögé és csókold meg a nyakát!';
  expect(insertPartnerName(hu2, 'Kriszta')).toBe('Állj Kriszta mögé és csókold meg a nyakát!');

  const hu3 = 'Csókolózz a kijelölt játékossal 20 másodpercig!';
  expect(insertPartnerName(hu3, 'Dávid')).toBe('Csókolózz Dáviddal 20 másodpercig!');
});

test('renderCard substitutes placeholders and inserts target player name', () => {
  const roster = [
    { id: '1', name: 'David' },
    { id: '2', name: 'Kriszta' }
  ];
  const group = { actorId: '1', giverIds: ['1'], receiverIds: ['2'], playerIds: ['1', '2'] };

  const templateEn = 'Pull the selected player onto the couch and touch here: {bodyPart}';
  expect(renderCard(templateEn, group, roster, 'neck')).toBe(
    'Pull Kriszta onto the couch and touch here: neck'
  );

  const templateHu = 'Húzd a kijelölt játékost a kanapéra, és érintsd meg itt: {bodyPart}';
  expect(renderCard(templateHu, group, roster, 'nyak')).toBe(
    'Húzd Krisztát a kanapéra, és érintsd meg itt: nyak'
  );
});
