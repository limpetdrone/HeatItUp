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

export function renderCard(template, group, roster, bodyPart = '') {
  const name = id => roster.find(p => p.id === id)?.name || '';
  const receivers = (group?.receiverIds || []).map(name).filter(Boolean);
  const givers = (group?.giverIds || []).map(name).filter(Boolean);

  const values = {
    actor: name(group?.actorId),
    givers: givers.join(', '),
    receivers: receivers.join(', '),
    bodyPart
  };

  let rendered = template.replace(/\{(actor|givers|receivers|bodyPart)\}/g, (_, key) => values[key]);

  // Determine partner / target name to replace generic 'selected player' references
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

  return rendered;
}
