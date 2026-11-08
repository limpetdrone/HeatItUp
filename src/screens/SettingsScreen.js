import React from 'react';
import { View } from 'react-native';
import { Text } from '../i18n/ui';
import { useLanguage } from '../i18n/context';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { ui } from '../theme';

export default function SettingsScreen({ onBack, onSuggest }) {
  const { preference, setPreference, error } = useLanguage();

  return (
    <ScreenShell label="BEÁLLÍTÁSOK">
      <Text accessibilityRole="header" style={ui.title}>Beállítások</Text>

      <View style={ui.panel}>
        <Text style={ui.heading}>Nyelv / Language</Text>
        {[
          ['auto', 'Telefon nyelve (Auto)'],
          ['hu', 'Magyar'],
          ['en', 'English'],
          ['de', 'Deutsch']
        ].map(([value, label]) => (
          <ActionButton
            key={value}
            title={label}
            selected={value === preference}
            secondary
            onPress={() => setPreference(value)}
          />
        ))}
        <Text style={ui.muted}>A nyelvválasztás ezen a készüléken mentődik.</Text>
        {!!error && <Text style={ui.error}>{error}</Text>}
      </View>

      <ActionButton title="Új kérdés vagy feladat javaslata" secondary onPress={onSuggest} />

      <View style={ui.panel}>
        <Text style={ui.heading}>Alkalmazás információ</Text>
        <Text style={ui.text}>Heat It Up · v1.0.0</Text>
        <Text style={ui.muted}>A játék offline működik. A visszajelzések és javaslatok beküldéséhez internet szükséges.</Text>
      </View>

      <ActionButton title="Vissza" onPress={onBack} />
    </ScreenShell>
  );
}
