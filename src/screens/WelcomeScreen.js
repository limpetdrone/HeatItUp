import { Text } from "../i18n/ui";
import React from 'react';
import { View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { ui } from '../theme';
export default function WelcomeScreen({
  onContinue,
  onResume,
  onPresets,
  hasSession,
  onClearSession,
  onSettings
}) {
  return <ScreenShell onSettings={onSettings} label="EGY KIS SZIKRA. SOK ÚJ TÖRTÉNET.">
    <Text accessibilityRole="header" style={[ui.title, {
      fontSize: 44,
      lineHeight: 52
    }]}>Törjétek meg{'\n'}a jeget.</Text>
    <Text style={ui.muted}>Ismerjétek meg egymást egy kicsit másképp. Kérdések, kihívások és közös pillanatok, a ti tempótokban.</Text>
    <View style={ui.row}><Text style={ui.eyebrow}>2–8 JÁTÉKOS</Text><Text style={ui.eyebrow}>5 SZINT</Text><Text style={ui.eyebrow}>310+ KÁRTYA</Text></View>
    <View style={ui.panel}><Text style={ui.heading}>Ti szabjátok a határokat.</Text><Text style={ui.text}>Bármelyik feladat passzolható. Csak azt vállaljátok, ami mindenkinek belefér.</Text></View>
    {hasSession && <ActionButton title="Játék folytatása" onPress={onResume} />}
    {hasSession && <ActionButton title="Mentett játék törlése" secondary onPress={onClearSession} />}
    <ActionButton title="Kezdjük →" onPress={onContinue} />
    <ActionButton title="Mentett összeállítások" secondary onPress={onPresets} />
  </ScreenShell>;
}
