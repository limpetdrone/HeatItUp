export function inflectHu(name, form) {
  if (!name) return name;
  const back = /[aáoóuúAÁOÓUÚ]/;
  const frontRound = /[öőüűÖŐÜŰ]/;
  const frontUnround = /[eéiíEÉIÍ]/;

  let harmony = 'back';
  let hasBack = false;
  let lastType = null;
  for (let i = name.length - 1; i >= 0; i--) {
    const ch = name[i];
    if (back.test(ch)) { hasBack = true; if (!lastType) lastType = 'back'; }
    else if (frontRound.test(ch)) { if (!lastType) lastType = 'frontRound'; }
    else if (frontUnround.test(ch)) { if (!lastType) lastType = 'frontUnround'; }
  }
  harmony = hasBack ? 'back' : (lastType || 'back');

  const lastChar = name[name.length - 1];
  const stem = name.slice(0, -1);

  if (form === 't') {
    if (lastChar === 'a') return stem + 'át';
    if (lastChar === 'A') return stem + 'Át';
    if (lastChar === 'e') return stem + 'ét';
    if (lastChar === 'E') return stem + 'Ét';
    if (/[ioóuúöőüűIOÓUÚÖŐÜŰ]/.test(lastChar)) return name + 't';
    if (/[rlnszjRLNSZJ]/.test(lastChar)) return name + 't';
    if (harmony === 'frontRound') return name + 'öt';
    if (harmony === 'frontUnround') return name + 'et';
    return name + (/[dtkpbDTKPB]/.test(lastChar) ? 'ot' : 'at');
  }

  if (form === 'val') {
    if (lastChar === 'a') return stem + 'ával';
    if (lastChar === 'A') return stem + 'Ával';
    if (lastChar === 'e') return stem + 'ével';
    if (lastChar === 'E') return stem + 'Ével';
    const v = harmony === 'back' ? 'al' : 'el';
    if (/[ioóuúöőüűIOÓUÚÖŐÜŰ]/.test(lastChar)) return name + (harmony === 'back' ? 'val' : 'vel');
    const lower = name.toLowerCase();
    if (lower.endsWith('sz')) return name.slice(0, -2) + 'ssz' + v;
    if (lower.endsWith('zs')) return name.slice(0, -2) + 'zzs' + v;
    if (lower.endsWith('cs')) return name.slice(0, -2) + 'ccs' + v;
    if (lower.endsWith('gy')) return name.slice(0, -2) + 'ggy' + v;
    if (lower.endsWith('ny')) return name.slice(0, -2) + 'nny' + v;
    if (lower.endsWith('ty')) return name.slice(0, -2) + 'tty' + v;
    return name + lastChar.toLowerCase() + v;
  }

  if (form === 'nak') {
    if (lastChar === 'a') return stem + 'ának';
    if (lastChar === 'A') return stem + 'Ának';
    if (lastChar === 'e') return stem + 'ének';
    if (lastChar === 'E') return stem + 'Ének';
    return name + (harmony === 'back' ? 'nak' : 'nek');
  }

  if (form === 'hoz') {
    if (lastChar === 'a') return stem + 'ához';
    if (lastChar === 'A') return stem + 'Ához';
    if (lastChar === 'e') return stem + 'éhez';
    if (lastChar === 'E') return stem + 'Éhez';
    if (harmony === 'back') return name + 'hoz';
    if (harmony === 'frontRound') return name + 'höz';
    return name + 'hez';
  }

  if (form === 'ra') {
    if (lastChar === 'a') return stem + 'ára';
    if (lastChar === 'A') return stem + 'Ára';
    if (lastChar === 'e') return stem + 'ére';
    if (lastChar === 'E') return stem + 'Ére';
    return name + (harmony === 'back' ? 'ra' : 're');
  }

  if (form === 'on') {
    if (lastChar === 'a') return stem + 'án';
    if (lastChar === 'A') return stem + 'Án';
    if (lastChar === 'e') return stem + 'én';
    if (lastChar === 'E') return stem + 'Én';
    if (/[ioóuúöőüűIOÓUÚÖŐÜŰ]/.test(lastChar)) return name + 'n';
    if (harmony === 'back') return name + 'on';
    if (harmony === 'frontRound') return name + 'ön';
    return name + 'en';
  }

  return name;
}

export function insertPartnerName(text, target) {
  if (!target || typeof text !== 'string') return text;
  let res = text;
  // EN
  res = res.replace(/(?:the|a)\s+(?:selected|chosen)\s+player[\'’]s/gi, target + "'s");
  res = res.replace(/(?:the|a)\s+other\s+player[\'’]s/gi, target + "'s");
  res = res.replace(/(?:the|a)\s+(?:selected|chosen)\s+player/gi, target);
  res = res.replace(/(?:the|a)\s+other\s+player/gi, target);

  // DE
  res = res.replace(/der\s+gewählten\s+Person/gi, target);
  res = res.replace(/die\s+gewählte\s+Person/gi, target);

  // HU
  res = res.replace(/(?:a\s+)?kijelölt\s+játékost/gi, inflectHu(target, 't'));
  res = res.replace(/(?:a\s+)?kijelölt\s+játékossal/gi, inflectHu(target, 'val'));
  res = res.replace(/(?:a\s+)?kijelölt\s+játékosnak/gi, inflectHu(target, 'nak'));
  res = res.replace(/(?:a\s+)?kijelölt\s+játékoshoz/gi, inflectHu(target, 'hoz'));
  res = res.replace(/(?:a\s+)?kijelölt\s+játékosra/gi, inflectHu(target, 'ra'));
  res = res.replace(/(?:a\s+)?kijelölt\s+játékoson/gi, inflectHu(target, 'on'));
  res = res.replace(/(?:a\s+)?kijelölt\s+játékos/gi, target);
  res = res.replace(/(?:egy\s+)?választott\s+játékost/gi, inflectHu(target, 't'));
  res = res.replace(/(?:egy\s+)?választott\s+játékos/gi, target);

  return res;
}

export function resolveIntimateTerms(text, actorProfile, targetProfile) {
  if (!text || typeof text !== 'string') return text;
  let res = text;
  const targetGender = targetProfile?.gender;
  const actorGender = actorProfile?.gender;

  // Actor's own intimate parts (1st person: 'részedet', 'pontodra', etc.)
  if (actorGender === 'female') {
    res = res.replace(/(?:az\s+)?intim\s+részedet/gi, 'a vaginádat');
    res = res.replace(/(?:az\s+)?intim\s+részeden/gi, 'a vaginádon');
    res = res.replace(/(?:az\s+)?intim\s+részedhez/gi, 'a vaginádhoz');
    res = res.replace(/intim\s+helyen\s+érint\b/gi, 'a vaginádon érint');
    res = res.replace(/legérzékenyebb\s+intim\s+pontodra/gi, 'csiklódra');
    res = res.replace(/your\s+intimate\s+area/gi, 'your vagina');
    res = res.replace(/deinem\s+Intimbereich/gi, 'deiner Vagina');
    res = res.replace(/deinen\s+Intimbereich/gi, 'deine Vagina');
  } else if (actorGender === 'male') {
    res = res.replace(/(?:az\s+)?intim\s+részedet/gi, 'a péniszedet');
    res = res.replace(/(?:az\s+)?intim\s+részeden/gi, 'a péniszeden');
    res = res.replace(/(?:az\s+)?intim\s+részedhez/gi, 'a péniszedhez');
    res = res.replace(/intim\s+helyen\s+érint\b/gi, 'a péniszeden érint');
    res = res.replace(/legérzékenyebb\s+intim\s+pontodra/gi, 'péniszedre');
    res = res.replace(/your\s+intimate\s+area/gi, 'your penis');
    res = res.replace(/deinem\s+Intimbereich/gi, 'deinem Penis');
    res = res.replace(/deinen\s+Intimbereich/gi, 'deinen Penis');
  }

  // Target's intimate parts (3rd person: 'részét', 'részén', etc.)
  if (targetGender === 'female') {
    res = res.replace(/(?:az\s+)?intim\s+részét\s+is/gi, 'a vagináját is');
    res = res.replace(/(?:az\s+)?intim\s+részét/gi, 'vagináját');
    res = res.replace(/(?:az\s+)?intim\s+részén/gi, 'vagináján');
    res = res.replace(/(?:az\s+)?intim\s+részéhez/gi, 'vaginájához');
    res = res.replace(/(?:az\s+)?intim\s+része\s+fölé/gi, 'vaginája fölé');
    res = res.replace(/(?:az\s+)?intim\s+része\b/gi, 'vaginája');
    res = res.replace(/(?:az\s+)?intim\s+zónáját/gi, 'vagináját');
    res = res.replace(/érintsd\s+meg\s+intim\s+helyen/gi, 'érintsd meg a vagináján');
    res = res.replace(/legintimebb\s+pontján/gi, 'vagináján');
    res = res.replace(/(?:their|the)\s+intimate\s+area/gi, 'her vagina');
    res = res.replace(/ihrem\s+Intimbereich/gi, 'ihrer Vagina');
    res = res.replace(/ihren\s+Intimbereich/gi, 'ihre Vagina');
    res = res.replace(/ihre\s+intimste\s+Stelle/gi, 'ihre Vagina');
  } else if (targetGender === 'male') {
    res = res.replace(/(?:az\s+)?intim\s+részét\s+is/gi, 'a péniszét is');
    res = res.replace(/(?:az\s+)?intim\s+részét/gi, 'péniszét');
    res = res.replace(/(?:az\s+)?intim\s+részén/gi, 'péniszén');
    res = res.replace(/(?:az\s+)?intim\s+részéhez/gi, 'péniszéhez');
    res = res.replace(/(?:az\s+)?intim\s+része\s+fölé/gi, 'pénisze fölé');
    res = res.replace(/(?:az\s+)?intim\s+része\b/gi, 'pénisze');
    res = res.replace(/(?:az\s+)?intim\s+zónáját/gi, 'péniszét');
    res = res.replace(/érintsd\s+meg\s+intim\s+helyen/gi, 'érintsd meg a péniszén');
    res = res.replace(/legintimebb\s+pontján/gi, 'péniszén');
    res = res.replace(/(?:their|the)\s+intimate\s+area/gi, 'his penis');
    res = res.replace(/ihrem\s+Intimbereich/gi, 'seinem Penis');
    res = res.replace(/ihren\s+Intimbereich/gi, 'seinen Penis');
    res = res.replace(/ihre\s+intimste\s+Stelle/gi, 'seinen Penis');
  }

  return res;
}

export function renderCard(template, group, roster, bodyPart = '') {
  const name = id => roster.find(p => p.id === id)?.name || '';
  const receivers = (group?.receiverIds || []).map(name).filter(Boolean);
  const givers = (group?.giverIds || []).map(name).filter(Boolean);

  const targetId = (group?.receiverIds || []).find(id => id !== group?.actorId)
    || (group?.giverIds || []).find(id => id !== group?.actorId)
    || (group?.playerIds || []).find(id => id !== group?.actorId);
  const targetProfile = roster.find(p => p.id === targetId);
  const actorProfile = roster.find(p => p.id === group?.actorId);

  // Dynamic resolution for bodyPart on roulette wheel if it's the intimate organ
  let resolvedBodyPart = bodyPart;
  if (/^(nemi szervek|genitals|genitalien|intim zóna|intimate area|intimzone)$/i.test(bodyPart.trim())) {
    const bodyLanguage = /^(nemi szervek|intim zóna)$/i.test(bodyPart.trim()) ? 'hu'
      : /^(genitalien|intimzone)$/i.test(bodyPart.trim()) ? 'de' : 'en';
    if (targetProfile?.gender === 'female') {
      resolvedBodyPart = bodyLanguage === 'de' ? 'Vagina' : 'vagina';
    } else if (targetProfile?.gender === 'male') {
      resolvedBodyPart = { hu: 'pénisz', en: 'penis', de: 'Penis' }[bodyLanguage];
    }
  }

  const values = {
    actor: name(group?.actorId),
    givers: givers.join(', '),
    receivers: receivers.join(', '),
    bodyPart: resolvedBodyPart
  };

  let rendered = template.replace(/\{(actor|givers|receivers|bodyPart)\}/g, (_, key) => values[key]);

  // Insert target player name
  let targetIds = (group?.receiverIds || []).filter(id => id !== group?.actorId);
  if (targetIds.length === 0) {
    targetIds = (group?.giverIds || []).filter(id => id !== group?.actorId);
  }
  if (targetIds.length === 0) {
    targetIds = (group?.playerIds || []).filter(id => id !== group?.actorId);
  }
  const targetNames = targetIds.map(name).filter(Boolean);
  if (targetNames.length > 0) {
    rendered = insertPartnerName(rendered, targetNames.join(', '));
  }

  // Dynamically resolve intimate terms based on actor and target gender
  rendered = resolveIntimateTerms(rendered, actorProfile, targetProfile);

  return rendered;
}

export function formatParallelInvitation(otherGroups, roster, language = 'hu') {
  if (!otherGroups || otherGroups.length === 0) return null;
  const nameOf = id => roster.find(p => p.id === id)?.name || '';

  const groupPairNames = otherGroups.map(g => {
    const rawIds = [...(g.giverIds || []), ...(g.receiverIds || []), ...(g.playerIds || [])];
    const uniqueIds = rawIds.filter((id, index) => rawIds.indexOf(id) === index);
    const memberNames = uniqueIds.map(nameOf).filter(Boolean);
    if (memberNames.length === 0) return '';
    if (memberNames.length === 1) return memberNames[0];

    const joiner = language === 'de' ? ' und ' : language === 'en' ? ' and ' : ' és ';
    return memberNames.slice(0, -1).join(', ') + joiner + memberNames[memberNames.length - 1];
  }).filter(Boolean);

  if (groupPairNames.length === 0) return null;

  if (language === 'de') {
    const combined = groupPairNames.length === 1
      ? groupPairNames[0]
      : groupPairNames.slice(0, -1).join(', ') + ' sowie ' + groupPairNames[groupPairNames.length - 1];
    const isSingle = groupPairNames.length === 1 && (otherGroups[0]?.playerIds || []).length <= 1;
    return isSingle
      ? `${combined} kann es auch machen, wenn sie möchte.`
      : `${combined} können es auch machen, wenn sie möchten.`;
  }

  if (language === 'en') {
    const combined = groupPairNames.length === 1
      ? groupPairNames[0]
      : groupPairNames.slice(0, -1).join(', ') + ', as well as ' + groupPairNames[groupPairNames.length - 1];
    return `${combined} can also do it if they want.`;
  }

  // hu:
  const combined = groupPairNames.length === 1
    ? groupPairNames[0]
    : groupPairNames.slice(0, -1).join(', ') + ', valamint ' + groupPairNames[groupPairNames.length - 1];
  return `${combined} is csinálhatja, ha szeretné.`;
}
