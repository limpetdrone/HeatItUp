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

test('renderCard dynamically resolves intimate terms and bodyPart based on gender', () => {
  const roster = [
    { id: '1', name: 'David', gender: 'male' },
    { id: '2', name: 'Kriszta', gender: 'female' }
  ];

  // Actor: David (male), Target: Kriszta (female)
  const group1 = { actorId: '1', giverIds: ['1'], receiverIds: ['2'], playerIds: ['1', '2'] };
  const cardFemaleTarget = 'Simogasd lassan a kezeddel a kijelölt játékos intim részét 45 másodpercig.';
  expect(renderCard(cardFemaleTarget, group1, roster)).toBe(
    'Simogasd lassan a kezeddel Kriszta vagináját 45 másodpercig.'
  );

  const cardWheelFemale = 'Simogasd gyengéden a kijelölt játékost 20 másodpercig itt: {bodyPart}.';
  expect(renderCard(cardWheelFemale, group1, roster, 'Intim zóna')).toBe(
    'Simogasd gyengéden Krisztát 20 másodpercig itt: vagina.'
  );

  // Actor: Kriszta (female), Target: David (male)
  const group2 = { actorId: '2', giverIds: ['2'], receiverIds: ['1'], playerIds: ['1', '2'] };
  const cardMaleTarget = 'Simogasd lassan a kezeddel a kijelölt játékos intim részét 45 másodpercig.';
  expect(renderCard(cardMaleTarget, group2, roster)).toBe(
    'Simogasd lassan a kezeddel David péniszét 45 másodpercig.'
  );

  const cardWheelMale = 'Simogasd gyengéden a kijelölt játékost 20 másodpercig itt: {bodyPart}.';
  expect(renderCard(cardWheelMale, group2, roster, 'Intim zóna')).toBe(
    'Simogasd gyengéden Davidot 20 másodpercig itt: pénisz.'
  );

  // 1st person tasks (actor's own intimate part)
  const cardActorFemale = 'Hagyd, hogy a kijelölt játékos 45 másodpercig lassan simogassa a kezével az intim részedet.';
  expect(renderCard(cardActorFemale, group2, roster)).toBe(
    'Hagyd, hogy David 45 másodpercig lassan simogassa a kezével a vaginádat.'
  );

  const cardActorMale = 'Hagyd, hogy a kijelölt játékos 45 másodpercig lassan simogassa a kezével az intim részedet.';
  expect(renderCard(cardActorMale, group1, roster)).toBe(
    'Hagyd, hogy Kriszta 45 másodpercig lassan simogassa a kezével a péniszedet.'
  );
});
