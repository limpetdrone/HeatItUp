import { test, expect } from '@jest/globals';
import { eligibleCards, startGame, resolveTurn, stopGame } from './engine';
const settings = {
  players: ['Anna', 'Béla'],
  maxIntensity: 1,
  rounds: 3
};
const cards = [{
  id: 'a',
  text: 'A',
  kind: 'question',
  minPlayers: 1,
  intensity: 1
}, {
  id: 'b',
  text: 'B',
  kind: 'challenge',
  minPlayers: 1,
  intensity: 1
}, {
  id: 'c',
  text: 'C',
  kind: 'question',
  minPlayers: 2,
  intensity: 2
}, {
  id: 'd',
  text: 'D',
  kind: 'challenge',
  minPlayers: 2,
  intensity: 3
}];
const unchangedOrder = () => 0.999;
const begin = (options = settings, deck = cards) => startGame(options, deck, unchangedOrder).game;
function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
test('szűrés egyedül és csoportban', () => {
  expect(eligibleCards(cards, settings).map(c => c.id)).toEqual(['a', 'b']);
  expect(eligibleCards(cards, {
    ...settings,
    players: ['A', 'B'],
    maxIntensity: 2
  }).map(c => c.id)).toEqual(['a', 'b', 'c']);
});
test.each([2, 8])('%i fő pontos körszámmal és lezárt állapottal', count => {
  let game = begin({
    ...settings,
    players: Array.from({
      length: count
    }, (_, i) => `${i}`)
  });
  for (let i = 0; i < count * 3; i++) {
    expect(game.endReason).toBeNull();
    game = resolveTurn(game, i % 2 ? 'passed' : 'completed', cards, unchangedOrder);
  }
  expect(game.resolvedTurns).toBe(count * 3);
  expect(game.completed + game.passed).toBe(count * 3);
  expect(game.endReason).toBe('rounds');
  expect(game.currentCardId).toBeNull();
  expect(resolveTurn(game, 'completed', cards)).toBe(game);
  expect(stopGame(game)).toBe(game);
});
test('kész és passz külön számolódik, körváltás helyes', () => {
  let game = begin({
    ...settings,
    players: ['A', 'B']
  });
  const positions = [];
  for (const outcome of ['completed', 'passed', 'completed']) {
    positions.push([game.resolvedTurns % 2, Math.floor(game.resolvedTurns / 2) + 1]);
    game = resolveTurn(game, outcome, cards, unchangedOrder);
  }
  expect(positions).toEqual([[0, 1], [1, 1], [0, 2]]);
  expect([game.completed, game.passed]).toEqual([2, 1]);
});
test('üres pakli és hibás beállítás hiba', () => {
  expect(startGame(settings, []).ok).toBe(false);
  expect(startGame({
    ...settings,
    players: []
  }, cards).ok).toBe(false);
});
test('kimerülés után az előző első helyre keverése javítva', () => {
  let game = begin(); // a, b
  game = resolveTurn(game, 'completed', cards, unchangedOrder); // b
  expect(game.currentCardId).toBe('b');
  game = resolveTurn(game, 'passed', cards, () => 0); // shuffled b,a -> swapped a,b
  expect(game.currentCardId).toBe('a');
});
test('egy lap újrahúzható', () => {
  const game = resolveTurn(begin(settings, [cards[0]]), 'passed', [cards[0]], unchangedOrder);
  expect(game.currentCardId).toBe('a');
});
test('megszakítás nem számolja a nyitott kártyát', () => {
  const game = stopGame(begin());
  expect([game.resolvedTurns, game.completed, game.passed]).toEqual([0, 0, 0]);
  expect(game.endReason).toBe('stopped');
  expect(game.currentCardId).toBeNull();
  expect(resolveTurn(game, 'passed', cards)).toBe(game);
});
test('nem módosít bemenetet', () => {
  const deck = freeze(cards.map(card => ({
    ...card
  })));
  const options = freeze({
    ...settings,
    players: [...settings.players]
  });
  const game = freeze(begin(options, deck));
  expect(() => resolveTurn(game, 'completed', deck, unchangedOrder)).not.toThrow();
  expect(game.resolvedTurns).toBe(0);
  expect(game.remainingCardIds).toEqual(['b']);
});
