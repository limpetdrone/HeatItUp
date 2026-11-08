import { rekeyProfiles, normalizeProfile } from './profiles';
import { validateSettings } from './validation';
export const copy = value => JSON.parse(JSON.stringify(value));
export function validatePreset(preset, others = [], {
  allowLegacySinglePlayer = false
} = {}) {
  const name = typeof preset?.name === 'string' ? preset.name.trim() : '';
  const errors = [];
  if (!name || Array.from(name).length > 40) errors.push('A preset neve 1–40 karakter legyen.');
  if (others.some(p => p.id !== preset.id && p.name.toLocaleLowerCase('hu-HU') === name.toLocaleLowerCase('hu-HU'))) errors.push('Ilyen nevű preset már létezik.');
  const members = Array.isArray(preset?.members) ? preset.members : [];
  const result = validateSettings({
    ...preset?.defaults,
    players: members.map(m => m.name),
    profiles: members
  }, {
    minimumPlayers: allowLegacySinglePlayer ? 1 : 2
  });
  if (!result.ok) errors.push(...result.errors);
  if (!preset?.id || members.some(m => !m.id) || new Set(members.map(m => m.id)).size !== members.length) errors.push('Hibás presetazonosítók.');
  return errors.length ? {
    ok: false,
    error: errors.join(' ')
  } : {
    ok: true,
    preset: {
      ...copy(preset),
      name,
      members: members.map((m, i) => ({
        ...normalizeProfile(m),
        name: result.settings.players[i]
      }))
    }
  };
}
export function createPresetSnapshot(preset, makeId) {
  return {
    sourcePresetId: preset.id,
    settings: copy(preset.defaults),
    roster: rekeyProfiles(preset.members, makeId).map((p,i) => ({...p, sourceMemberId: preset.members[i].id, status: 'active'}))
  };
}
