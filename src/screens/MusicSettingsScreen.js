import { Text, TextInput, Switch } from "../i18n/ui";
import React, { useState } from 'react';
import { View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { videoIdFromUrl } from '../music/selectTrack';
import { ui, colors } from '../theme';
export default function MusicSettingsScreen({
  music,
  onMusic,
  catalog,
  onCatalog,
  cardId,
  cards,
  makeId,
  onBack
}) {
  const [selected, setSelected] = useState(Math.max(0, cards.findIndex(c => c.id === cardId)));
  const [form, setForm] = useState({
    title: '',
    url: '',
    reason: '',
    kind: 'mood',
    explicit: false,
    reviewed: false
  });
  const [error, setError] = useState('');
  const change = patch => setForm(value => ({
    ...value,
    ...patch
  }));
  const field = (key, placeholder) => <TextInput maxLength={key === 'url' ? 500 : 120} accessibilityLabel={placeholder} placeholder={placeholder} placeholderTextColor={colors.muted} value={form[key]} onChangeText={text => change({
    [key]: text
  })} style={{
    color: colors.text,
    borderColor: colors.muted,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12
  }} />;
  async function add() {
    if (catalog.length >= 1000) {
      setError('Legfeljebb 1000 társítás menthető.');
      return;
    }
    const videoId = videoIdFromUrl(form.url);
    if (!videoId || !form.title.trim() || !form.reason.trim() || !form.reviewed) {
      setError('Adj meg HTTPS YouTube/Music dal-linket, címet, indoklást és igazold a meghallgatást.');
      return;
    }
    const success = await onCatalog([...catalog, {
      id: makeId(),
      title: form.title.trim(),
      reason: form.reason.trim(),
      cardId: cards[selected].id,
      videoId,
      kind: form.kind,
      explicit: form.explicit,
      reviewed: true
    }]);
    if (success) {
      change({
        title: '',
        url: '',
        reason: '',
        reviewed: false
      });
      setError('');
    }
  }
  return <ScreenShell label="ZENE"><Text style={ui.title}>Hangold hozzá.</Text>
    <Text style={ui.heading}>Mód</Text><View style={ui.row}>{[['off', 'Kikapcsolva'], ['manual', 'Kézi'], ['task', 'Feladathoz']].map(([value, label]) => <ActionButton key={value} title={label} secondary selected={music.mode === value} onPress={() => onMusic({
        ...music,
        mode: value
      })} />)}</View>
    <View style={ui.row}>{[['mood', 'Hangulat'], ['lyric_joke', 'Dalszövegi poén'], ['mixed', 'Vegyes']].map(([value, label]) => <ActionButton key={value} title={label} secondary selected={music.matchStyle === value} onPress={() => onMusic({
        ...music,
        matchStyle: value
      })} />)}</View>
    <View style={ui.row}>{[['youtube', 'YouTube-lejátszó'], ['youtube_music', 'YouTube Music: külső megnyitás']].map(([value, label]) => <ActionButton key={value} title={label} secondary selected={music.provider === value} onPress={() => onMusic({
        ...music,
        provider: value
      })} />)}</View>
    <Text style={ui.muted}>A YouTube Music külső appja itt nem távirányítható. A Spotify-integráció jelenleg nem elérhető.</Text>
    <Text style={ui.text}>Automatikus indítás</Text><Switch accessibilityLabel="Automatikus indítás" value={music.autoStart} onValueChange={value => onMusic({
      ...music,
      autoStart: value
    })} />
    <Text style={ui.text}>Explicit zenék engedélyezése</Text><Switch accessibilityLabel="Explicit zenék engedélyezése" value={music.allowExplicitTracks} onValueChange={value => onMusic({
      ...music,
      allowExplicitTracks: value
    })} />
    <View style={ui.panel}><Text style={ui.heading}>Dal társítása egy feladathoz</Text><Text style={ui.text}>{selected + 1}/{cards.length} · {cards[selected].text}</Text><View style={ui.row}><ActionButton title="Előző feladat" secondary disabled={selected === 0} onPress={() => setSelected(selected - 1)} /><ActionButton title="Következő feladat" secondary disabled={selected === cards.length - 1} onPress={() => setSelected(selected + 1)} /></View>
    {field('title', 'Dal és előadó')}{field('url', 'YouTube vagy YouTube Music HTTPS-link')}{field('reason', 'Miért illik a feladathoz?')}
    <View style={ui.row}>{[['mood', 'Hangulat'], ['lyric_joke', 'Dalszövegi poén']].map(([value, label]) => <ActionButton key={value} title={label} secondary selected={form.kind === value} onPress={() => change({
          kind: value
        })} />)}</View>
    <Text style={ui.text}>Explicit dal</Text><Switch accessibilityLabel="Explicit dal" value={form.explicit} onValueChange={value => change({
        explicit: value
      })} />
    <Text style={ui.text}>Meghallgattam; a lejátszás és a kapcsolat ellenőrzött.</Text><Switch accessibilityLabel="Dal ellenőrizve" value={form.reviewed} onValueChange={value => change({
        reviewed: value
      })} />
    {!!error && <Text style={ui.error}>{error}</Text>}<ActionButton title="Dal mentése" onPress={add} /></View>
    <Text style={ui.heading}>Saját társítások ({catalog.length})</Text>{catalog.map(t => <View key={t.id} style={ui.panel}><Text style={ui.text}><Text verbatim>{t.title}</Text> · {t.kind === 'mood' ? 'Hangulat' : 'Dalszövegi poén'}</Text><ActionButton title="Társítás törlése" secondary onPress={() => onCatalog(catalog.filter(item => item.id !== t.id))} /></View>)}
    <ActionButton title="Vissza" onPress={onBack} /></ScreenShell>;
}
