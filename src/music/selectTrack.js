export const musicDefaults = {
  mode: 'off',
  matchStyle: 'mixed',
  provider: 'youtube',
  autoStart: false,
  allowExplicitTracks: false
};
export function validMusic(m) {
  return !!m && ['off', 'manual', 'task'].includes(m.mode) && ['mood', 'lyric_joke', 'mixed'].includes(m.matchStyle) && ['youtube', 'youtube_music'].includes(m.provider) && typeof m.autoStart === 'boolean' && typeof m.allowExplicitTracks === 'boolean';
}
export function videoIdFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const id = host === 'youtu.be' ? u.pathname.slice(1) : ['youtube.com', 'www.youtube.com', 'music.youtube.com', 'm.youtube.com'].includes(host) ? u.searchParams.get('v') : null;
    return /^[\w-]{11}$/.test(id || '') && u.protocol === 'https:' ? id : null;
  } catch {
    return null;
  }
}
export function validCatalog(list) {
  return Array.isArray(list) && list.length <= 1000 && new Set(list.map(t => t?.id)).size === list.length && list.every(t => typeof t.id === 'string' && typeof t.title === 'string' && t.title.length <= 120 && typeof t.reason === 'string' && t.reason.length <= 120 && typeof t.cardId === 'string' && /^[\w-]{11}$/.test(t.videoId) && ['mood', 'lyric_joke'].includes(t.kind) && typeof t.explicit === 'boolean' && typeof t.reviewed === 'boolean');
}
export function selectTrack(catalog, cardId, options, key, offset = 0, recent = []) {
  if (options.mode === 'off') return null;
  const available = catalog.filter(t => t.reviewed && (options.allowExplicitTracks || !t.explicit) && (options.mode === 'manual' || t.cardId === cardId));
  const desired = options.matchStyle === 'mixed' ? (Number(key.split(':').pop()) + offset) % 2 ? 'lyric_joke' : 'mood' : options.matchStyle;
  const matching = available.filter(t => t.kind === desired);
  const pool = matching.length ? matching : available.filter(t => t.kind === 'mood');
  const fresh = pool.filter(t => !recent.includes(t.id));
  const choices = fresh.length ? fresh : pool;
  let hash = 0;
  for (const char of key) hash = Math.imul(hash, 31) + char.charCodeAt(0) >>> 0;
  return choices.length ? choices[(hash + offset) % choices.length] : null;
}
