import { expect, test } from '@jest/globals';
import { normalizeProfile } from './profiles';
import { assignmentChoices, eligibleBodyParts } from './assignments';
import { startSession, chooseCardKind, currentTurn, spinAssignment, resolveTurn, timerAction, changePlayerStatus, isValidSession, migrateSession, updateWardrobe } from './session';

const roster = count => Array.from({ length: count }, (_, i) => normalizeProfile({ id: String(i), name: `Player ${i}` }));
const card = { id: 'review', familyId: 'review', text: 'Test {bodyPart}', kind: 'challenge', intensity: 1, minPlayers: 2, interaction: { partnerCount: 1, bodyParts: true, parallelSafe: true, durationSeconds: 60 } };
const start = (people = roster(2), options = {}, deck = [card], extra = {}) => startSession('review', { rounds: 3, maxIntensity: 1, options, ...extra }, people, deck, null, () => 0).session;
const choose = (session, deck = [card]) => chooseCardKind(session, { turnId: currentTurn(session).id, kind: deck[0].kind }, deck, () => 0).session;
const resolve = (session, deck = [card], outcome = 'passed') => resolveTurn(session, { turnId: currentTurn(session).id, cardRevision: session.cardRevision, outcome }, deck, () => 0).session;
const timer = (session, action, now, deltaSeconds) => timerAction(session, { turnId: currentTurn(session).id, revision: session.cardRevision, action, now, deltaSeconds });

test('all excluded body parts produce no legal card instead of relaxing restrictions', () => {
  const people = roster(2);
  people[1].preferences.blockedBodyParts = ['hand', 'arm', 'cheek'];
  expect(eligibleBodyParts(1, people)).toEqual([]);
  expect(choose(start(people)).phase).toBe('waiting');
});

test('body restrictions include givers on receiving-role cards', () => {
  const people = roster(2);
  people[1].preferences.blockedBodyParts = ['hand', 'arm'];
  const deck = [{ ...card, interaction: { ...card.interaction, role: 'receive' } }];
  let session = choose(start(people, { bodyWheel: true }, deck), deck);
  session = spinAssignment(session, 'body', deck, () => 0, 0).session;
  expect(currentTurn(session).assignment.bodyPartId).toBe('cheek');
});

test('automatic body selection is recomputed for the partner wheel result', () => {
  const people = roster(3);
  people[1].preferences.blockedBodyParts = ['arm', 'cheek'];
  people[2].preferences.blockedBodyParts = ['hand', 'cheek'];
  let session = choose(start(people, { partnerWheel: true, bodyWheel: false }));
  const index = currentTurn(session).assignment.wheelOptions.findIndex(option => option.playerIds.includes('2'));
  session = spinAssignment(session, 'partner', [card], () => 0, index).session;
  expect(currentTurn(session).assignment.bodyPartId).toBe('arm');
});

test('parallel groups share a body choice allowed by every participant', () => {
  const people = roster(4);
  people[2].preferences.blockedBodyParts = ['hand', 'arm'];
  const session = choose(start(people, { parallel: true, bodyWheel: false }));
  expect(currentTurn(session).assignment.playerIds).toHaveLength(4);
  expect(currentTurn(session).assignment.bodyPartId).toBe('cheek');
});

test('parallel packing considers reversed roles when only that direction is permitted', () => {
  const people = roster(4);
  people[0].preferences.activities.oral.giveIds = ['1'];
  people[0].preferences.activities.oral.givePolicy = 'selected';
  people[2].preferences.activities.oral.give = false;
  const deck = [{ ...card, interaction: { ...card.interaction, category: 'oral', bodyParts: false } }];
  const choices = assignmentChoices(start(people, { parallel: true }, deck), deck[0], '0');
  expect(choices).not.toHaveLength(0);
  expect(choices.every(option => option.playerIds.length === 4)).toBe(true);
});

test('passing a card before spinning still prevents repeats for the current player', () => {
  const first = choose(start(roster(2), { partnerWheel: true }));
  let session = resolve(first);
  session = choose(session);
  if (session.phase === 'playing') session = resolve(session);
  session = choose(session);
  expect(session.phase).toBe('waiting');
  expect(session.history.some(item => item.playerIds.includes('0') && item.status === 'passed')).toBe(true);
});

test('timer adjustment updates idle, running and paused timers and rejects stale changes', () => {
  let session = choose(start(roster(2), { bodyWheel: false }));
  const original = JSON.stringify(session);
  let next = timer(session, 'adjust', 1000, 30).session;
  expect(currentTurn(next).durationSeconds).toBe(90);
  expect(JSON.stringify(session)).toBe(original);
  session = timer(next, 'start', 1000).session;
  next = timer(session, 'adjust', 11000, 30).session;
  expect(currentTurn(next).timer.deadline).toBe(121000);
  session = timer(next, 'pause', 21000).session;
  next = timer(session, 'adjust', 22000, -30).session;
  expect(currentTurn(next).timer.remainingMs).toBe(70000);
  expect(currentTurn(next).timer.deadline).toBeNull();
  expect(timerAction(next, { turnId: 'stale', revision: next.cardRevision, action: 'adjust', now: 23000, deltaSeconds: 30 }).session).toBe(next);
  expect(timer(next, 'adjust', 23000, NaN).ok).toBe(false);
});

test('open-ended sessions remain restorable after extending rounds with a removed player', () => {
  const deck = Array.from({ length: 30 }, (_, i) => ({ ...card, id: `q${i}`, familyId: `q${i}`, kind: 'question', interaction: {} }));
  let session = start(roster(3), {}, deck, { openEnded: true });
  session = changePlayerStatus(session, '2', 'removed', deck, () => 0).session;
  for (let i = 0; i < 6; i++) session = resolve(choose(session, deck), deck);
  expect(currentTurn(session).round).toBe(4);
  expect(isValidSession(session, deck)).toBe(true);
  expect(migrateSession(session, deck)).not.toBeNull();
});

test('a wardrobe change invalidates the actual group even if another grouping is available', () => {
  const people = roster(4).map(p => ({ ...p, wardrobe: [{ id: `shirt-${p.id}`, type: 'shirt', worn: true }] }));
  const deck = [{ ...card, interaction: { ...card.interaction, bodyParts: false, clothingType: 'shirt' } }];
  const session = choose(start(people, { parallel: true, trackWardrobe: true }, deck), deck);
  const secondaryActor = currentTurn(session).assignment.groups[1].actorId;
  const changed = updateWardrobe(session, secondaryActor, [], deck).session;
  expect(changed.phase === 'waiting' || changed.cardRevision > session.cardRevision).toBe(true);
  if (changed.phase === 'playing') expect(currentTurn(changed).assignment.groups.every(group => group.actorId !== secondaryActor)).toBe(true);
});

test('saved assignments are rechecked against restrictions introduced before an update', () => {
  const session = choose(start(roster(2), { bodyWheel: false }));
  session.roster[1].preferences.blockedBodyParts = ['hand', 'arm', 'cheek'];
  const restored = migrateSession(session, [card]);
  expect(restored.phase).toBe('choosing');
  expect(restored.currentCardId).toBeNull();
  expect(currentTurn(restored).assignment).toBeUndefined();
});

test('malformed saved history is rejected without throwing or breaking the next draw', () => {
  const session = choose(start());
  expect(migrateSession({ ...session, history: [null] }, [card])).toBeNull();
  expect(migrateSession({ ...session, history: {} }, [card])).toBeNull();
  expect(migrateSession({ ...session, roster: null }, [card])).toBeNull();
});

test('parallel body tasks reduce participation when no shared body choice exists', () => {
  const people = roster(4);
  people[0].preferences.blockedBodyParts = ['arm', 'cheek'];
  people[1].preferences.blockedBodyParts = ['arm', 'cheek'];
  people[2].preferences.blockedBodyParts = ['hand', 'cheek'];
  people[3].preferences.blockedBodyParts = ['hand', 'cheek'];
  const session = choose(start(people, { parallel: true, bodyWheel: false }));
  expect(currentTurn(session).assignment.playerIds).toEqual(['0', '1']);
  expect(currentTurn(session).assignment.bodyPartId).toBe('hand');
});

test('open-ended games wait if everyone pauses at the end of the planned turns', () => {
  const deck = Array.from({ length: 20 }, (_, i) => ({ ...card, id: `q${i}`, familyId: `q${i}`, kind: 'question', interaction: {} }));
  let session = start(roster(2), {}, deck, { openEnded: true });
  for (let i = 0; i < 5; i++) session = resolve(choose(session, deck), deck);
  session = changePlayerStatus(session, '0', 'paused', deck).session;
  session = changePlayerStatus(session, '1', 'paused', deck).session;
  expect(session.phase).toBe('waiting');
  session = changePlayerStatus(session, '0', 'active', deck).session;
  expect(currentTurn(session).round).toBe(4);
  expect(isValidSession(session, deck)).toBe(true);
});
