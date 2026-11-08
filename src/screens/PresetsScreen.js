import { Text } from "../i18n/ui";
import React from 'react';
import { View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { ui } from '../theme';
export default function PresetsScreen({
  presets,
  onUse,
  onEdit,
  onCopy,
  onDelete,
  onNew,
  onBack
}) {
  return <ScreenShell label="MENTETT ÖSSZEÁLLÍTÁSOK"><Text style={ui.title}>Preseteid</Text>
    <Text style={ui.muted}>Itt módosíthatod tartósan a mentett névsort. A folyamatban lévő játék változatlan marad.</Text>
    <ActionButton title="Új preset" onPress={onNew} />
    {!presets.length && <Text style={ui.muted}>Még nincs mentett összeállítás.</Text>}
    {presets.map(p => <View key={p.id} style={ui.panel}><Text style={ui.heading} verbatim>{p.name}</Text><Text style={ui.text} verbatim>{p.members.map(m => m.name).join(', ')}</Text>
      <ActionButton title="Játék ezzel" onPress={() => onUse(p)} /><ActionButton title="Szerkesztés" secondary onPress={() => onEdit(p)} /><ActionButton title="Másolat" secondary onPress={() => onCopy(p)} /><ActionButton title="Preset törlése" secondary onPress={() => onDelete(p)} />
    </View>)}<ActionButton title="Vissza" onPress={onBack} /></ScreenShell>;
}
