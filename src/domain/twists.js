/**
 * Small twists shown when a card family comes up again in the same game,
 * so repeated cards feel different. Texts are Hungarian keys; translations
 * live in i18n/featureMessages.js.
 */
export const twists = [
  { id: 'eyes-closed', kind: 'challenge', text: 'Csavar: csukott szemmel csináljátok.' },
  { id: 'slow-motion', kind: 'challenge', text: 'Csavar: lassított felvételként, a lehető leglassabban.' },
  { id: 'whisper-compliment', kind: 'challenge', text: 'Csavar: közben súgj egy bókot a fülébe.' },
  { id: 'countdown', kind: 'challenge', text: 'Csavar: a többiek halkan visszaszámolnak.' },
  { id: 'eye-contact', kind: 'challenge', text: 'Csavar: végig nézzetek egymás szemébe.' },
  { id: 'finish-kiss', kind: 'challenge', text: 'Csavar: a végén egy csókkal zárd.' },
  { id: 'group-guesses', kind: 'question', text: 'Csavar: előbb a többiek tippelnek, aztán válaszolsz.' },
  { id: 'eye-contact-answer', kind: 'question', text: 'Csavar: válaszolj, miközben valakinek a szemébe nézel.' },
  { id: 'whisper-relay', kind: 'question', text: 'Csavar: súgd a választ a jobb oldali szomszédod fülébe, ő mondja el hangosan.' },
  { id: 'secret-detail', kind: 'question', text: 'Csavar: mondj el egy részletet, amit még senkinek nem meséltél.' }
];

/** Picks a twist for a card kind, preferring ones not yet used in this game. */
export function pickTwist(kind, usedTwistIds, rng) {
  const options = twists.filter(twist => twist.kind === kind);
  const fresh = options.filter(twist => !usedTwistIds.includes(twist.id));
  const pool = fresh.length ? fresh : options;
  return pool[Math.floor(rng() * pool.length)]?.id ?? null;
}

export function twistText(twistId) {
  return twists.find(twist => twist.id === twistId)?.text ?? null;
}
