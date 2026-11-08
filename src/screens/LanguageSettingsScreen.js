import React from 'react';
import { Text } from '../i18n/ui';
import { useLanguage } from '../i18n/context';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { ui } from '../theme';
export default function LanguageSettingsScreen({
  onBack
}) {
  const {
    preference,
    setPreference,
    error
  } = useLanguage();
  return <ScreenShell><Text accessibilityRole="header" style={ui.title}>Nyelv</Text>
    {[['auto', 'Telefon nyelve'], ['en', 'English'], ['hu', 'Magyar'], ['de', 'Deutsch']].map(([value, label]) => <ActionButton key={value} title={label} selected={value === preference} secondary onPress={() => setPreference(value)} />)}
    <Text style={ui.muted}>A nyelvválasztás ezen a készüléken mentődik.</Text>{!!error && <Text style={ui.error}>{error}</Text>}
    <ActionButton title="Vissza" onPress={onBack} />
  </ScreenShell>;
}
