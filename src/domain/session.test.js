import { test, expect } from '@jest/globals';
import { cards as builtinCards } from '../data/cards';
import { startSession, chooseCardKind, currentTurn, resolveTurn, changePlayerStatus, getSessionSummary, isValidSession, migrateSession, stopSession, spinAssignment } from './session';
import { eligibleBodyParts } from './assignments';
import { createPresetSnapshot, validatePreset } from './presets';
// Solo cards keep the single-active-player paths testable; built-in content needs two players.
const soloCards = [1, 2, 3, 4].flatMap(n => [
  { id: `solo-question-${n}`, text: `Egyéni tesztkérdés ${n}`, kind: 'question', intensity: 1, minPlayers: 1 },
  { id: `solo-challenge-${n}`, text: `Egyéni tesztfeladat ${n}`, kind: 'challenge', intensity: 1, minPlayers: 1 }
]);
const cards = [...builtinCards, ...soloCards];
const input = {
  rounds: 3,
  maxIntensity: 1
};
const roster = ['A', 'B', 'C'].map(id => ({
  id,
  name: id
}));
const openChoice = (s, deck = cards) => s.phase === 'choosing' ? chooseCardKind(s, {
  turnId: currentTurn(s).id,
  kind: deck[0].kind
}, deck, () => .99).session : s;
const begin = (players = roster, deck = cards) => openChoice(startSession('session', input, players, deck, null, () => .99).session, deck);
const resolve = s => openChoice(resolveTurn(s, {
  turnId: currentTurn(s)?.id,
  cardRevision: s.cardRevision,
  outcome: 'completed'
}, cards, () => .99).session);
const status = (s, id, value) => openChoice(changePlayerStatus(s, id, value, cards, () => .99).session);
test.each([2, 8])('%i fő, teljes körök, mentés invariáns', count => {
  let s = begin(Array.from({
    length: count
  }, (_, i) => ({
    id: `${i}`,
    name: `N${i}`
  })));
  for (let i = 0; i < count * 3; i++) {
    expect(isValidSession(s, cards)).toBe(true);
    s = resolve(s);
  }
  expect(s.phase).toBe('finished');
  expect(getSessionSummary(s).completed).toBe(count * 3);
  expect(isValidSession(s, cards)).toBe(true);
});
test('szünetelő kimarad, visszatérve nem kap visszamenőleges lépést', () => {
  let s = status(begin(), 'B', 'paused');
  s = resolve(s);
  expect(currentTurn(s).playerId).toBe('C');
  expect(s.turns[1].status).toBe('omitted');
  s = status(s, 'B', 'active');
  s = resolve(resolve(s));
  expect(currentTurn(s).playerId).toBe('B');
  expect(currentTurn(s).round).toBe(2);
});
test('mindenki szünetel, majd visszajön; mindenki removed', () => {
  let s = begin();
  for (const p of roster) s = status(s, p.id, 'paused');
  expect(s.phase).toBe('waiting');
  s = status(s, 'A', 'active');
  expect(s.phase).toBe('playing');
  for (const p of roster) s = status(s, p.id, 'removed');
  expect(s.phase).toBe('finished');
  expect(s.endReason).toBe('no_players');
});
test('csak szünetelőnek maradt lépése: várakozik, nem zár le', () => {
  let s = status(begin(roster.slice(0, 2)), 'B', 'paused');
  s = resolve(resolve(resolve(s)));
  expect(s.phase).toBe('waiting');
  s = status(s, 'B', 'active');
  expect(s.phase).toBe('playing');
  expect(currentTurn(s).round).toBe(3);
});
test('páros lap egy főre csökkenéskor cserélődik ugyanazon turnön', () => {
  const pair = {
    id: 'pair',
    text: 'Pár',
    minPlayers: 2,
    intensity: 1,
    kind: 'challenge'
  };
  let s = begin(roster.slice(0, 2), [pair, ...cards]);
  expect(s.currentCardId).toBe('pair');
  const id = currentTurn(s).id;
  s = status(s, 'B', 'paused');
  expect(currentTurn(s).id).toBe(id);
  expect(s.currentCardId).not.toBe('pair');
  expect(getSessionSummary(s).completed).toBe(0);
});
test('duplikált esemény és tiltott státuszváltás', () => {
  let s = begin();
  const event = {
    turnId: currentTurn(s).id,
    cardRevision: s.cardRevision,
    outcome: 'passed'
  };
  s = resolveTurn(s, event, cards).session;
  expect(resolveTurn(s, event, cards).session).toBe(s);
  s = status(s, 'B', 'removed');
  expect(changePlayerStatus(s, 'B', 'active', cards).ok).toBe(false);
  expect(changePlayerStatus(s, 'unknown', 'paused', cards).ok).toBe(false);
});
test('preset és session mélyen független', () => {
  const preset = {
    id: 'p',
    name: 'Barátok',
    members: [{
      id: 'a',
      name: 'Anna'
    }, {
      id: 'b',
      name: 'Béla'
    }],
    defaults: {
      ...input,
      music: {
        mode: 'off'
      }
    }
  };
  expect(validatePreset(preset).ok).toBe(true);
  const snap = createPresetSnapshot(preset, (() => {
    let n = 0;
    return () => 's' + ++n;
  })());
  snap.settings.music.mode = 'task';
  expect(preset.defaults.music.mode).toBe('off');
  const original = JSON.stringify(preset);
  let s = startSession('s', snap.settings, snap.roster, cards, preset.id).session;
  s = status(s, 's1', 'paused');
  expect(s.roster[0].status).toBe('paused');
  expect(JSON.stringify(preset)).toBe(original);
  expect(validatePreset({
    ...preset,
    id: 'other'
  }, [preset]).ok).toBe(false);
  expect(validatePreset({
    ...preset,
    members: []
  }).ok).toBe(false);
});
test('sérült mentést elutasít, megszakítás nem ad kész eredményt', () => {
  const s = begin();
  expect(isValidSession({
    ...s,
    currentCardId: 'missing'
  }, cards)).toBe(false);
  expect(isValidSession({
    ...s,
    schemaVersion: 100
  }, cards)).toBe(false);
  expect(getSessionSummary(stopSession(s)).completed).toBe(0);
});
test('new turn waits for a choice and only draws the selected kind', () => {
  // Body-wheel cards block completion until spun, so this flow uses cards without a wheel.
  const deck = cards.filter(c => !c.interaction?.bodyParts);
  const s = startSession('choose', input, roster, deck).session;
  expect(s.phase).toBe('choosing');
  expect(s.currentCardId).toBeNull();
  expect(isValidSession(s, deck)).toBe(true);
  const chosen = chooseCardKind(s, {
    turnId: currentTurn(s).id,
    kind: 'challenge'
  }, deck).session;
  expect(deck.find(c => c.id === chosen.currentCardId).kind).toBe('challenge');
  expect(chooseCardKind(chosen, {
    turnId: currentTurn(chosen).id,
    kind: 'question'
  }, deck).session).toBe(chosen);
  const next = resolveTurn(chosen, {
    turnId: currentTurn(chosen).id,
    cardRevision: chosen.cardRevision,
    outcome: 'completed'
  }, deck).session;
  expect(next.phase).toBe('choosing');
  expect(next.currentCardId).toBeNull();
});
test('legacy single-player preset remains editable but cannot start a new game', () => {
  const preset = {
    id: 'legacy',
    name: 'Old group',
    members: [{
      id: 'a',
      name: 'Anna'
    }],
    defaults: input
  };
  expect(validatePreset(preset).ok).toBe(false);
  expect(validatePreset(preset, [], {
    allowLegacySinglePlayer: true
  }).ok).toBe(true);
  expect(startSession('old', input, [{
    id: 'a',
    name: 'Anna'
  }], cards).ok).toBe(false);
});

test('legacy active cards migrate to a fresh choice without discarding the roster',()=>{
 const old=begin();old.schemaVersion=2;delete currentTurn(old).assignment;delete old.history;
 const migrated=migrateSession(old,cards);expect(migrated.schemaVersion).toBe(3);expect(migrated.phase).toBe('choosing');expect(migrated.roster.map(p=>p.name)).toEqual(old.roster.map(p=>p.name));expect(migrated.history).toHaveLength(1);
});
test.each([1, 2, 3, 4, 5])('level %i draws a question and a challenge for a mixed group of four', level => {
  const group = [['a', 'female'], ['b', 'male'], ['c', 'female'], ['d', 'male']].map(([id, gender]) => ({ id, name: id.toUpperCase(), gender }));
  const started = startSession(`level-${level}`, { rounds: 3, maxIntensity: level }, group, builtinCards, null, () => .5).session;
  for (const kind of ['question', 'challenge']) {
    const chosen = chooseCardKind(started, { turnId: currentTurn(started).id, kind }, builtinCards, () => .5).session;
    expect(chosen.phase).toBe('playing');
    const card = builtinCards.find(c => c.id === chosen.currentCardId);
    expect(card.intensity).toBe(level);
    expect(card.kind).toBe(kind);
  }
});

test('switching between question and challenge preserves cards of the other kind in remainingCardIds', () => {
  const group = [['a', 'female'], ['b', 'male']].map(([id, gender]) => ({ id, name: id.toUpperCase(), gender }));
  const s = startSession('test-preserve', { rounds: 5, maxIntensity: 1 }, group, builtinCards, null, Math.random).session;
  expect(s.remainingCardIds.length).toBeGreaterThan(0);
  const initialChallenges = s.remainingCardIds.filter(id => builtinCards.find(c => c.id === id).kind === 'challenge');
  expect(initialChallenges.length).toBeGreaterThan(0);

  const qChosen = chooseCardKind(s, { turnId: currentTurn(s).id, kind: 'question' }, builtinCards, Math.random).session;
  const challengesAfterQuestion = qChosen.remainingCardIds.filter(id => builtinCards.find(c => c.id === id).kind === 'challenge');
  expect(challengesAfterQuestion.length).toBe(initialChallenges.length);

  const resolved = resolveTurn(qChosen, { turnId: currentTurn(qChosen).id, cardRevision: qChosen.cardRevision, outcome: 'completed' }, builtinCards, Math.random).session;
  expect(resolved.phase).toBe('choosing');
  const cChosen = chooseCardKind(resolved, { turnId: currentTurn(resolved).id, kind: 'challenge' }, builtinCards, Math.random).session;
  expect(builtinCards.find(c => c.id === cChosen.currentCardId).kind).toBe('challenge');
});

test('two male players can draw challenges at level 1 without getting no_cards', () => {
  const malePair = [['m1', 'male'], ['m2', 'male']].map(([id, gender]) => ({ id, name: id.toUpperCase(), gender }));
  const s = startSession('test-males', { rounds: 5, maxIntensity: 1, options: { activities: {} } }, malePair, builtinCards, null, Math.random).session;
  expect(s.settings.options.activities.maleSameGender).toBe(true);
  const cChosen = chooseCardKind(s, { turnId: currentTurn(s).id, kind: 'challenge' }, builtinCards, Math.random).session;
  expect(cChosen.phase).toBe('playing');
  expect(cChosen.waitReason).toBeNull();
  expect(cChosen.currentCardId).toBeTruthy();
});

test('blockedBodyParts excludes body parts from eligibleBodyParts and spinAssignment', () => {
  const p1 = { id: 'p1', name: 'P1', preferences: { blockedBodyParts: ['hand', 'neck'] } };
  const p2 = { id: 'p2', name: 'P2', preferences: { blockedBodyParts: ['cheek'] } };
  const eligible = eligibleBodyParts(1, [p1, p2]);
  const ids = eligible.map(p => p.id);
  expect(ids).not.toContain('hand');
  expect(ids).not.toContain('neck');
  expect(ids).not.toContain('cheek');
  expect(ids.length).toBeGreaterThan(0);
});
