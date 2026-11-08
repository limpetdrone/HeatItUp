import { Text, TextInput } from '../i18n/ui';
import React, { useState } from 'react';
import { View } from 'react-native';
import { validateSettings } from '../domain/validation';
import { normalizeProfile, pairProfiles, removeProfile } from '../domain/profiles';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import ProfileEditor from '../components/ProfileEditor';
import GameOptionsEditor, { defaultGameOptions } from '../components/GameOptionsEditor';
import { useTranslation } from '../i18n/context';
import { colors, ui, levels } from '../theme';

let nextProfileId = 0;
const localId = () => `draft-${Date.now().toString(36)}-${++nextProfileId}`;

export default function SetupScreen({
  draft,
  onStart,
  onBack,
  startError,
  onSavePreset,
  initialPresetName = '',
  editing = false,
  onSettings
}) {
  const t = useTranslation();
  const [profiles, setProfiles] = useState(() => {
    if (draft.profiles?.length) {
      return draft.profiles.map(p => ({
        ...normalizeProfile(p),
        name: (/^(játékos|player)\s*\d+$/i.test(p.name?.trim() || '')) ? '' : p.name
      }));
    }
    if (draft.players?.length) {
      return draft.players.map((name, i) => normalizeProfile({
        id: localId(),
        name: (/^(játékos|player)\s*\d+$/i.test(name?.trim() || '')) ? '' : name
      }));
    }
    return [
      normalizeProfile({ id: localId(), name: '' }),
      normalizeProfile({ id: localId(), name: '' })
    ];
  });
  const [settings, setSettings] = useState(() => ({
    ...draft,
    options: { ...defaultGameOptions, ...draft.options }
  }));
  const [submitted, setSubmitted] = useState(false);
  const [presetName, setPresetName] = useState(initialPresetName);
  const [cardIndex, setCardIndex] = useState(0); // 0: general settings card, 1..N: player cards

  const result = validateSettings({ ...settings, profiles, players: profiles.map(p => p.name) });

  function patchProfile(profile) {
    setProfiles(previous => previous.map(p => p.id === profile.id ? profile : p));
  }

  function pair(id, partnerId) {
    setProfiles(previous => pairProfiles(previous, id, partnerId));
  }

  function add() {
    if (profiles.length >= 8) return;
    const newP = normalizeProfile({ id: localId(), name: '' });
    setProfiles(previous => [...previous, newP]);
    return newP;
  }

  function remove(id) {
    setProfiles(previous => {
      const next = removeProfile(previous, id);
      setCardIndex(value => Math.max(0, Math.min(value, next.length)));
      return next;
    });
  }

  function submit(save = false) {
    setSubmitted(true);
    const resolvedProfiles = profiles.map((p, i) => ({
      ...p,
      name: p.name.trim() || t(`Játékos ${i + 1}`)
    }));
    const maleOnly = resolvedProfiles.length >= 2 && resolvedProfiles.every(p => p.gender === 'male');
    const adjustedSettings = {
      ...settings,
      options: {
        ...settings.options,
        activities: {
          ...settings.options?.activities,
          ...(maleOnly && settings.options?.activities?.maleSameGender !== false ? { maleSameGender: true } : {})
        }
      }
    };
    const validated = validateSettings({
      ...adjustedSettings,
      profiles: resolvedProfiles,
      players: resolvedProfiles.map(p => p.name)
    });
    if (validated.ok) {
      if (save) onSavePreset(validated.settings, presetName);
      else onStart(validated.settings);
    }
  }

  const errors = submitted && !result.ok && (
    <View accessibilityRole="alert">
      {result.errors.map(error => <Text key={error} style={ui.error}>{error}</Text>)}
    </View>
  );

  // CARD 0: General Game Settings
  if (cardIndex === 0) {
    return (
      <ScreenShell onSettings={onSettings} label="1. LÉPÉS: ÁLTALÁNOS BEÁLLÍTÁSOK">
        <Text style={ui.title} accessibilityRole="header">Játék beállításai</Text>

        <View style={[ui.panel, { borderColor: colors.accent, borderWidth: 1, backgroundColor: 'rgba(255, 122, 144, 0.08)' }]}>
          <Text style={[ui.text, { color: colors.text }]}>
            💡 {t('Ezek az általános beállítások, amelyeket a következő kártyákon játékosonként egyénileg is felül lehet bírálni.')}
          </Text>
        </View>

        <Text style={ui.heading}>Kezdő szint</Text>
        <View style={ui.row}>
          {[1, 2, 3, 4, 5].map(level => (
            <ActionButton
              key={level}
              title={`${level} · ${t(levels[level])}`}
              secondary
              selected={settings.maxIntensity === level}
              onPress={() => setSettings(previous => ({ ...previous, maxIntensity: level }))}
            />
          ))}
        </View>

        <GameOptionsEditor
          options={settings.options}
          onChange={options => setSettings(previous => ({ ...previous, options }))}
        />

        <View style={ui.panel}>
          <Text style={ui.heading}>Játékosok létszáma ({profiles.length})</Text>
          <View style={ui.row}>
            <ActionButton
              title="−"
              accessibilityLabel="Utolsó hely törlése"
              secondary
              disabled={profiles.length <= 2}
              onPress={() => remove(profiles[profiles.length - 1].id)}
            />
            <ActionButton
              title="+ Játékos hozzáadása"
              secondary
              disabled={profiles.length >= 8}
              onPress={add}
            />
          </View>
        </View>

        {/* Save Lineup (Összeállítás) */}
        {!!onSavePreset && (
          <View style={ui.panel}>
            <Text style={ui.heading}>Mentés összeállításként</Text>
            <TextInput
              accessibilityLabel="Összeállítás neve"
              value={presetName}
              onChangeText={setPresetName}
              style={{
                color: colors.text,
                borderColor: colors.muted,
                borderWidth: 1,
                padding: 12,
                borderRadius: 12
              }}
            />
            <ActionButton title="Összeállítás mentése" secondary onPress={() => submit(true)} />
          </View>
        )}

        {errors}
        {!!startError && <Text accessibilityRole="alert" style={ui.error}>{startError}</Text>}

        <ActionButton
          title="Tovább a játékosokhoz →"
          onPress={() => setCardIndex(1)}
        />
        <ActionButton title="Vissza" secondary onPress={onBack} />
      </ScreenShell>
    );
  }

  // CARD 1..N: Individual Player Cards
  const playerIdx = cardIndex - 1;
  const currentProfile = profiles[playerIdx] || profiles[0];

  return (
    <ScreenShell key={`card-${cardIndex}`} onSettings={onSettings} label={`JÁTÉKOSOK BEÁLLÍTÁSA (${playerIdx + 1}/${profiles.length})`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={ui.title} accessibilityRole="header">
          {playerIdx + 1}. {t('játékos')}
        </Text>
        <Text style={[ui.eyebrow, { color: colors.focus }]}>
          {playerIdx + 1} / {profiles.length}
        </Text>
      </View>

      <View style={ui.panel}>
        <ProfileEditor
          globalActivities={settings.options.activities}
          key={currentProfile.id}
          profile={currentProfile}
          profiles={profiles}
          onChange={patchProfile}
          onPair={partnerId => pair(currentProfile.id, partnerId)}
          makeId={localId}
        />
      </View>

      {/* Navigation between cards */}
      <View style={ui.row}>
        <ActionButton
          title="← Előző"
          secondary
          onPress={() => setCardIndex(cardIndex - 1)}
        />
        {playerIdx < profiles.length - 1 ? (
          <ActionButton
            title="Következő játékos →"
            onPress={() => setCardIndex(cardIndex + 1)}
          />
        ) : (
          <ActionButton
            title="+ Játékos hozzáadása"
            secondary
            disabled={profiles.length >= 8}
            onPress={() => {
              add();
              setCardIndex(profiles.length + 1);
            }}
          />
        )}
      </View>

      {profiles.length > 2 && (
        <ActionButton
          title="Játékos törlése"
          accessibilityLabel="Utolsó hely törlése"
          secondary
          onPress={() => remove(currentProfile.id)}
        />
      )}

      {/* Save Lineup (Összeállítás) */}
      {!!onSavePreset && (
        <View style={ui.panel}>
          <Text style={ui.heading}>Mentés összeállításként</Text>
          <TextInput
            accessibilityLabel="Összeállítás neve"
            value={presetName}
            onChangeText={setPresetName}
            style={{
              color: colors.text,
              borderColor: colors.muted,
              borderWidth: 1,
              padding: 12,
              borderRadius: 12
            }}
          />
          <ActionButton title="Összeállítás mentése" secondary onPress={() => submit(true)} />
        </View>
      )}

      {errors}
      {!!startError && <Text accessibilityRole="alert" style={ui.error}>{startError}</Text>}

      {!editing && playerIdx === profiles.length - 1 && (
        <ActionButton title="Játék indítása →" onPress={() => submit(false)} />
      )}

      <ActionButton
        title="Vissza a főmenübe"
        secondary
        onPress={onBack}
      />
    </ScreenShell>
  );
}
