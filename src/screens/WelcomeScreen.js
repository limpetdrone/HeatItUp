import { Text, Switch } from "../i18n/ui";
import React, { useState } from 'react';
import { View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { colors, ui } from '../theme';
export default function WelcomeScreen({
  onContinue,
  onResume,
  onPresets,
  onMusic,
  hasSession,
  onClearSession,
  onLanguage,
  onContent
}) {
  const [adult, setAdult] = useState(false);
  return <ScreenShell label="EGY KIS SZIKRA. SOK ÚJ TÖRTÉNET.">
    <Text accessibilityRole="header" style={[ui.title, {
      fontSize: 44,
      lineHeight: 52
    }]}>Törjétek meg{'\n'}a jeget.</Text>
    <Text style={ui.muted}>Ismerjétek meg egymást egy kicsit másképp. Kérdések, kihívások és közös pillanatok, a ti tempótokban.</Text>
    <View style={ui.row}><Text style={ui.eyebrow}>2–8 JÁTÉKOS</Text><Text style={ui.eyebrow}>5 SZINT</Text><Text style={ui.eyebrow}>48 KÁRTYA</Text></View>
    <View style={ui.panel}><Text style={ui.heading}>Ti szabjátok a határokat.</Text><Text style={ui.text}>Bármelyik feladat passzolható. Csak azt vállaljátok, ami mindenkinek belefér.</Text>
      <View style={[ui.row, {
        flexWrap: 'nowrap'
      }]}><Switch value={adult} onValueChange={setAdult} trackColor={{
          true: colors.accent
        }} accessibilityLabel="Minden résztvevő betöltötte a 18. életévét." /><Text style={[ui.text, {
          flex: 1
        }]}>Minden résztvevő betöltötte a 18. életévét.</Text></View>
    </View>
    {hasSession && <ActionButton title="Játék folytatása" disabled={!adult} onPress={onResume} />}{hasSession && <ActionButton title="Mentett játék törlése" secondary onPress={onClearSession} />}<ActionButton title="Preseteim" secondary onPress={onPresets} /><ActionButton title="Zene beállításai" secondary onPress={onMusic} />
    <ActionButton title="Kártyakészlet" secondary onPress={onContent} /><ActionButton title="Nyelv" secondary onPress={onLanguage} /><ActionButton title="Kezdjük →" disabled={!adult} onPress={onContinue} />
  </ScreenShell>;
}
