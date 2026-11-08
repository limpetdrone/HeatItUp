/** @typedef {1 | 2 | 3 | 4 | 5} Intensity */
/** @typedef {'question' | 'challenge'} CardKind */
/**
 * @typedef {Object} Card
 * @property {string} id Stabil, egyedi, pl. spark-q-solo-01
 * @property {string} text Magyar, legfeljebb 240 kódpont
 * @property {CardKind} kind
 * @property {Intensity} intensity
 * @property {1 | 2} minPlayers 1 = egyedül és csoportban is használható
 */
/**
 * @typedef {Object} Settings
 * @property {string[]} players Normalizált nevek a validáció után
 * @property {Intensity} maxIntensity
 * @property {3 | 5 | 10 | 20} rounds
 */
/** @typedef {{ok: true, settings: Settings} | {ok: false, errors: string[]}} SetupResult */
/** @typedef {'completed' | 'passed'} Outcome */
/**
 * @typedef {Object} Game
 * @property {Settings} settings
 * @property {number} resolvedTurns Mindig completed + passed
 * @property {number} completed
 * @property {number} passed
 * @property {string | null} currentCardId
 * @property {string[]} remainingCardIds
 * @property {null | 'rounds' | 'stopped'} endReason
 */
/** @typedef {{ok: true, game: Game} | {ok: false, error: string}} StartResult */
/** @typedef {() => number} Rng 0 <= érték < 1 */
/** @typedef {{screen: 'welcome'} | {screen: 'setup', draft: Settings} | {screen: 'game', game: Game} | {screen: 'summary', game: Game}} AppState */
export {};
