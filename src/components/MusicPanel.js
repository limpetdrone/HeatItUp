import { Text } from "../i18n/ui";
import React, { useState } from 'react';
import { View, Linking } from 'react-native';
import { selectTrack } from '../music/selectTrack';
import YouTubePlayer from './YouTubePlayer';
import ActionButton from './ActionButton';
import { ui, colors } from '../theme';
export default function MusicPanel({
  music,
  catalog,
  cardId,
  requestKey,
  onUserPause
}) {
  const [offset, setOffset] = useState(0);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const selectionKey = music.mode === 'manual' ? 'manual' : requestKey;
  const track = selectTrack(catalog, cardId, music, selectionKey, offset, recent);
  if (music.mode === 'off') return null;
  return <View style={{
    padding: 12,
    gap: 8,
    backgroundColor: colors.surface,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center'
  }}>
    {!track ? <Text style={ui.muted}>Ehhez még nincs jóváhagyott dal. A Zene beállításainál társíthatsz egyet.</Text> : <>
      <Text numberOfLines={2} style={ui.text}><Text verbatim>{track.title}</Text> · {track.kind === 'lyric_joke' ? 'Dalszövegi poén' : 'Hangulat'}</Text>
      {!!track.reason && <Text numberOfLines={2} style={ui.muted} verbatim>{track.reason}</Text>}
      {music.provider === 'youtube' ? <YouTubePlayer key={`${track.id}:${selectionKey}`} videoId={track.videoId} autoStart={music.autoStart && !manuallyPaused} onPause={() => {
        setManuallyPaused(true);
        onUserPause?.();
      }} /> : <ActionButton title="Megnyitás YouTube Musicban" onPress={() => Linking.openURL(`https://music.youtube.com/watch?v=${track.videoId}`).catch(() => setError('Nem sikerült megnyitni a szolgáltatót.'))} />}
      <ActionButton title="Másik ajánlat" secondary onPress={() => {
        setRecent(value => [...value.slice(-4), track.id]);
        setOffset(value => value + 1);
      }} />
      {!!error && <Text style={ui.error}>{error}</Text>}
    </>}
  </View>;
}
