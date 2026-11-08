import { optionErrors } from './options';
import { profileErrors, normalizeProfile } from './profiles';
/** @param {import('./types').Settings} input @returns {import('./types').SetupResult} */
export function validateSettings(input, {
  minimumPlayers = 2
} = {}) {
  const errors = [];
  const names = Array.isArray(input?.players) ? input.players : [];
  if (names.length < minimumPlayers || names.length > 8) errors.push('Adj meg 2–8 játékost.');
  const players = names.map(name => typeof name === 'string' ? name.trim().normalize('NFC') : '');
  const seen = new Set();
  players.forEach((name, index) => {
    if (!name || Array.from(name).length > 20) errors.push(`${index + 1}. játékos: a név 1–20 karakter legyen.`);
    const key = name.toLocaleLowerCase('hu-HU');
    if (name && seen.has(key)) errors.push(`${index + 1}. játékos: ez a név már szerepel.`);
    seen.add(key);
  });
  if (![1, 2, 3, 4, 5].includes(input?.maxIntensity)) errors.push('Válassz intenzitást 1 és 5 között.');
  if (input?.options !== undefined) errors.push(...optionErrors(input.options));
  if (input?.profiles) {
    if (!Array.isArray(input.profiles) || input.profiles.length !== names.length) errors.push('Érvénytelen profilbeállítás.');
    else errors.push(...profileErrors(input.profiles));
  }
  const rounds = input?.rounds !== undefined ? input.rounds : 50;
  if (![3, 5, 10, 20, 50].includes(rounds)) errors.push('A körszám 3, 5, 10, 20 vagy 50 lehet.');
  return errors.length ? {
    ok: false,
    errors
  } : {
    ok: true,
    settings: {
      players,
      maxIntensity: input.maxIntensity,
      rounds,
      ...(input.profiles ? {profiles: input.profiles.map((p,i) => ({...normalizeProfile(p), name: players[i]}))} : {}),
      ...(input.options ? {options: JSON.parse(JSON.stringify(input.options))} : {})
    }
  };
}
