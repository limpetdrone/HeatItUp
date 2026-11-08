import { validateSettings } from './validation';

/** @param {readonly import('./types').Card[]} cards @param {import('./types').Settings} settings */
export function eligibleCards(cards, settings) {
  return cards.filter(card => card.intensity <= settings.maxIntensity && card.minPlayers <= settings.players.length);
}
function shuffled(ids, rng) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function draw(game, cards, rng) {
  let deck = [...game.remainingCardIds];
  if (!deck.length) {
    deck = shuffled(eligibleCards(cards, game.settings).map(card => card.id), rng);
    if (deck.length > 1 && deck[0] === game.currentCardId) [deck[0], deck[1]] = [deck[1], deck[0]];
  }
  return {
    ...game,
    currentCardId: deck[0],
    remainingCardIds: deck.slice(1)
  };
}

/** @param {import('./types').Settings} settings @param {readonly import('./types').Card[]} cards @param {import('./types').Rng} rng @returns {import('./types').StartResult} */
export function startGame(settings, cards, rng = Math.random) {
  const result = validateSettings(settings);
  if (!result.ok) return {
    ok: false,
    error: result.errors.join(' ')
  };
  if (!eligibleCards(cards, result.settings).length) return {
    ok: false,
    error: 'Ezekhez a beállításokhoz nincs elérhető kártya.'
  };
  return {
    ok: true,
    game: draw({
      settings: result.settings,
      resolvedTurns: 0,
      completed: 0,
      passed: 0,
      currentCardId: null,
      remainingCardIds: [],
      endReason: null
    }, cards, rng)
  };
}

/** @param {import('./types').Game} game @param {import('./types').Outcome} outcome @param {readonly import('./types').Card[]} cards @param {import('./types').Rng} rng @returns {import('./types').Game} */
export function resolveTurn(game, outcome, cards, rng = Math.random) {
  if (game.endReason) return game;
  if (!['completed', 'passed'].includes(outcome)) throw new Error('Ismeretlen lépéseredmény.');
  const next = {
    ...game,
    resolvedTurns: game.resolvedTurns + 1,
    [outcome]: game[outcome] + 1
  };
  if (next.resolvedTurns >= game.settings.players.length * game.settings.rounds) return {
    ...next,
    currentCardId: null,
    endReason: 'rounds'
  };
  return draw(next, cards, rng);
}

/** @param {import('./types').Game} game @returns {import('./types').Game} */
export function stopGame(game) {
  return game.endReason ? game : {
    ...game,
    currentCardId: null,
    endReason: 'stopped'
  };
}
