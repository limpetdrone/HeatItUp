import { Text } from "../i18n/ui";
import React from 'react';
import { View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { getSessionSummary } from '../domain/session';
import { ui } from '../theme';
export default function SummaryScreen({
  game,
  onRestart,
  onSettings
}) {
  const summary = getSessionSummary(game);
  return <ScreenShell label="EGY KICSIT KÖZELEBB">
    <Text style={ui.title} accessibilityRole="header">{game.endReason === 'rounds' ? 'Ez jólesett.' : 'Most ennyi fért bele.'}</Text>
    <Text style={ui.muted}>{game.endReason === 'rounds' ? 'Végigértetek a játékon.' : 'Megszakított játék.'} Minden közös pillanat számít.</Text>
    <View style={ui.panel}>
      <Text style={ui.eyebrow}>A KÖZÖS ESTÉTEK</Text>
      <Text style={ui.title}>{summary.completed + summary.passed}/{summary.total}</Text>
      <Text style={ui.muted}>lezárt lépés</Text>
      <View style={ui.row}><Text style={ui.text}>Kész: {summary.completed}</Text><Text style={ui.text}>Passz: {summary.passed}</Text><Text style={ui.text}>Kimaradt: {summary.omitted}</Text><Text style={ui.muted}>Hátralévő: {summary.remaining}</Text></View>
    </View>
    <ActionButton title="Új játék ugyanezekkel →" onPress={onRestart} />
    <ActionButton title="Beállítások" secondary onPress={onSettings} />
  </ScreenShell>;
}
