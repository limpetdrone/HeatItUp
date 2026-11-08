import { test, expect } from '@jest/globals';
import { renderCard, insertPartnerName, inflectHu, formatParallelInvitation } from './renderCard';

test('body labels retain the selected language after substitution', () => {
  const roster = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B', gender: 'male' }];
  const group = { actorId: 'a', giverIds: ['a'], receiverIds: ['b'], playerIds: ['a', 'b'] };
  expect(renderCard('{bodyPart}', group, roster, 'Intimate area')).toBe('penis');
  expect(renderCard('{bodyPart}', group, roster, 'Intimzone')).toBe('Penis');
  roster[1].gender = null;
  expect(renderCard('{bodyPart}', group, roster, 'Intimate area')).toBe('Intimate area');
  expect(renderCard('{bodyPart}', group, roster, 'Intimzone')).toBe('Intimzone');
});

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

test('formatParallelInvitation generates natural invitation notes for parallel pairs', () => {
  const roster = [
    { id: '1', name: 'Dávid' },
    { id: '2', name: 'Gabi' },
    { id: '3', name: 'Kriszta' },
    { id: '4', name: 'Viktor' },
    { id: '5', name: 'Anna' },
    { id: '6', name: 'Balázs' },
    { id: '7', name: 'Nóri' },
    { id: '8', name: 'Tomi' }
  ];

  const group2 = { actorId: '3', giverIds: ['3'], receiverIds: ['4'], playerIds: ['3', '4'] };
  const group3 = { actorId: '5', giverIds: ['5'], receiverIds: ['6'], playerIds: ['5', '6'] };
  const group4 = { actorId: '7', giverIds: ['7'], receiverIds: ['8'], playerIds: ['7', '8'] };

  // 1 extra pair (Hungarian)
  expect(formatParallelInvitation([group2], roster, 'hu')).toBe(
    'Kriszta és Viktor is csinálhatja, ha szeretné.'
  );

  // 2 extra pairs (Hungarian)
  expect(formatParallelInvitation([group2, group3], roster, 'hu')).toBe(
    'Kriszta és Viktor, valamint Anna és Balázs is csinálhatja, ha szeretné.'
  );

  // 3 extra pairs (Hungarian)
  expect(formatParallelInvitation([group2, group3, group4], roster, 'hu')).toBe(
    'Kriszta és Viktor, Anna és Balázs, valamint Nóri és Tomi is csinálhatja, ha szeretné.'
  );

  // English
  expect(formatParallelInvitation([group2], roster, 'en')).toBe(
    'Kriszta and Viktor can also do it if they want.'
  );
  expect(formatParallelInvitation([group2, group3], roster, 'en')).toBe(
    'Kriszta and Viktor, as well as Anna and Balázs can also do it if they want.'
  );

  // German
  expect(formatParallelInvitation([group2], roster, 'de')).toBe(
    'Kriszta und Viktor können es auch machen, wenn sie möchten.'
  );
  expect(formatParallelInvitation([group2, group3], roster, 'de')).toBe(
    'Kriszta und Viktor sowie Anna und Balázs können es auch machen, wenn sie möchten.'
  );

  // Null on empty
  expect(formatParallelInvitation([], roster, 'hu')).toBeNull();
  expect(formatParallelInvitation(null, roster, 'hu')).toBeNull();
});
