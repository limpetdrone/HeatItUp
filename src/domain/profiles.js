export const genders = [null, 'male', 'female', 'nonbinary'];
export const activityDefaults = { oral: true, penetration: true, anal: false, fetish: false, femaleSameGender: true, maleSameGender: false };
export const activityCategories = ['oral', 'penetration', 'anal', 'fetish'];
export const clothingTypes = ['shirt', 'trousers', 'skirt', 'dress', 'bra', 'underwear', 'socks', 'shoes', 'other'];
export const fetishTypes = ['blindfold', 'roleplay', 'feet'];
export function defaultPreferences() {
  return { genderActivities: {femaleSameGender:null,maleSameGender:null}, blockedIds: [], activities: Object.fromEntries(activityCategories.map(key => [key, { give: true, receive: true, givePolicy: 'all', receivePolicy: 'all', giveIds: [], receiveIds: [], giveBlockedIds: [], receiveBlockedIds: [] }])), fetishes: [] };
}
export function normalizeProfile(profile) {
  const defaults = defaultPreferences();
  const preferences = profile.preferences ? JSON.parse(JSON.stringify(profile.preferences)) : {};
  return { id: profile.id, name: profile.name, gender: profile.gender ?? null, partnerId: profile.partnerId ?? null,
    preferences: { ...defaults, ...preferences, genderActivities: {...defaults.genderActivities,...preferences.genderActivities}, activities: Object.fromEntries(activityCategories.map(key => [key, { ...defaults.activities[key], ...preferences.activities?.[key] }])) },
    wardrobe: Array.isArray(profile.wardrobe) ? profile.wardrobe.map(item => ({ ...item })) : [] };
}
export function profileErrors(input) {
  const errors = []; const ids = new Set(input.map(p => p?.id));
  if (ids.size !== input.length || input.some(p => !p || typeof p.id !== 'string' || !p.id)) return ['Hibás játékosazonosító.'];
  for (const raw of input) {
    const p = normalizeProfile(raw);
    if (!genders.includes(p.gender)) errors.push('Érvénytelen profilbeállítás.');
    if (p.partnerId && (p.partnerId === p.id || !ids.has(p.partnerId) || input.find(q => q.id === p.partnerId)?.partnerId !== p.id)) errors.push('A párkapcsolatnak kölcsönösnek kell lennie.');
    const validIds = list => Array.isArray(list) && new Set(list).size === list.length && list.every(id => id !== p.id && ids.has(id));
    if (!validIds(p.preferences.blockedIds) || !Array.isArray(p.preferences.fetishes) || p.preferences.fetishes.some(id => !fetishTypes.includes(id))) errors.push('Érvénytelen profilbeállítás.');
    if(Object.values(p.preferences.genderActivities).some(value=>value!==null&&typeof value!=='boolean'))errors.push('Érvénytelen profilbeállítás.');
    for (const rule of Object.values(p.preferences.activities)) {
      if (typeof rule.give !== 'boolean' || typeof rule.receive !== 'boolean' || !['all','partner','selected'].includes(rule.givePolicy) || !['all','partner','selected'].includes(rule.receivePolicy) || !validIds(rule.giveIds) || !validIds(rule.receiveIds) || !validIds(rule.giveBlockedIds) || !validIds(rule.receiveBlockedIds)) errors.push('Érvénytelen profilbeállítás.');
    }
    if (new Set(p.wardrobe.map(item => item.id)).size !== p.wardrobe.length || p.wardrobe.some(item => !item.id || !clothingTypes.includes(item.type) || typeof item.worn !== 'boolean')) errors.push('Érvénytelen ruházati lista.');
  }
  return [...new Set(errors)];
}
export function pairProfiles(profiles, id, partnerId) {
  if (id === partnerId || !profiles.some(p => p.id === id) || partnerId && !profiles.some(p => p.id === partnerId)) return profiles;
  return profiles.map(p => ({ ...p, partnerId: p.id === id ? partnerId : p.id === partnerId ? id : p.partnerId === id || partnerId && p.partnerId === partnerId ? null : p.partnerId }));
}
export function removeProfile(profiles, id) {
  return profiles.filter(p => p.id !== id).map(raw => {
    const p = normalizeProfile(raw);
    return { ...p, partnerId: p.partnerId === id ? null : p.partnerId, preferences: { ...p.preferences, blockedIds: p.preferences.blockedIds.filter(x => x !== id), activities: Object.fromEntries(Object.entries(p.preferences.activities).map(([key,r]) => [key,{...r,giveIds:r.giveIds.filter(x=>x!==id),receiveIds:r.receiveIds.filter(x=>x!==id),giveBlockedIds:r.giveBlockedIds.filter(x=>x!==id),receiveBlockedIds:r.receiveBlockedIds.filter(x=>x!==id)}])) } };
  });
}
export function rekeyProfiles(profiles, makeId) {
  const map = new Map(profiles.map(p => [p.id, makeId()]));
  return profiles.map(raw => {
    const p = normalizeProfile(raw);
    return { ...p, id: map.get(p.id), partnerId: map.get(p.partnerId) || null, preferences: { ...p.preferences, blockedIds: p.preferences.blockedIds.map(id => map.get(id)).filter(Boolean), activities: Object.fromEntries(Object.entries(p.preferences.activities).map(([key,r])=>[key,{...r,giveIds:r.giveIds.map(id=>map.get(id)).filter(Boolean),receiveIds:r.receiveIds.map(id=>map.get(id)).filter(Boolean),giveBlockedIds:r.giveBlockedIds.map(id=>map.get(id)).filter(Boolean),receiveBlockedIds:r.receiveBlockedIds.map(id=>map.get(id)).filter(Boolean)}])) } };
  });
}
export function canInteract(actor, recipient, category, settings, fetishId) {
  if (actor.id === recipient.id || actor.status === 'removed' || actor.status === 'paused' || recipient.status === 'removed' || recipient.status === 'paused') return false;
  const complete=p=>p.preferences?.genderActivities&&p.preferences?.activities?.oral?.giveBlockedIds;
  const a = complete(actor)?actor:normalizeProfile(actor), b = complete(recipient)?recipient:normalizeProfile(recipient);
  if (a.preferences.blockedIds.includes(b.id) || b.preferences.blockedIds.includes(a.id)) return false;
  const global = { ...activityDefaults, ...settings.activities };
  // Same-gender switches cover every partner task: physical cards in all categories are sexual in this game.
  if ((a.gender === 'female' && b.gender === 'female' && (!global.femaleSameGender||a.preferences.genderActivities.femaleSameGender===false||b.preferences.genderActivities.femaleSameGender===false) || a.gender === 'male' && b.gender === 'male' && (!global.maleSameGender||a.preferences.genderActivities.maleSameGender===false||b.preferences.genderActivities.maleSameGender===false))) return false;
  if (!activityCategories.includes(category)) return true;
  if (!global[category]) return false;
  if (category === 'anal' && a.gender === 'female') return false;
  const ar = a.preferences.activities[category], br = b.preferences.activities[category];
  const permits = (profile, rule, role, target) => rule[role] && !rule[role+'BlockedIds'].includes(target.id) && (rule[role+'Policy'] === 'all' || rule[role+'Policy'] === 'partner' && profile.partnerId === target.id || rule[role+'Policy'] === 'selected' && rule[role+'Ids'].includes(target.id));
  if (!permits(a,ar,'give',b) || !permits(b,br,'receive',a)) return false;
  return category !== 'fetish' || Boolean(fetishId && settings.fetishes?.includes(fetishId) && a.preferences.fetishes.includes(fetishId) && b.preferences.fetishes.includes(fetishId));
}
