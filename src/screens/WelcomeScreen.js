import { Text } from '../i18n/ui';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { colors, ui } from '../theme';

export default function WelcomeScreen({ onContinue, onResume, onPresets, hasSession, onClearSession, onSettings }) {
  return <ScreenShell onSettings={onSettings} label="EGY KIS SZIKRA. SOK ÚJ TÖRTÉNET.">
    <View style={styles.hero}>
      <View style={styles.heroContent}>
        <Text accessibilityRole="header" style={styles.headline}>Törjétek meg{'\n'}a jeget.</Text>
        <Text style={styles.intro}>Ismerjétek meg egymást egy kicsit másképp. Kérdések, kihívások és közös pillanatok, a ti tempótokban.</Text>
      </View>
      <Image source={require('../../assets/icon.png')} accessibilityIgnoresInvertColors accessible={false} style={styles.emblem} />
    </View>

    <View style={styles.facts}>
      <Text style={styles.fact}>2–8 JÁTÉKOS</Text><View style={styles.dot} />
      <Text style={styles.fact}>5 SZINT</Text><View style={styles.dot} />
      <Text style={styles.fact}>500+ KÁRTYA</Text>
    </View>

    <View style={styles.actions}>
      {hasSession && <ActionButton title="Játék folytatása" onPress={onResume} />}
      <ActionButton title="Kezdjük →" secondary={Boolean(hasSession)} onPress={onContinue} />
      <ActionButton title="Mentett összeállítások" secondary onPress={onPresets} />
      {hasSession && <ActionButton title="Mentett játék törlése" secondary onPress={onClearSession} />}
    </View>

    <View style={styles.boundaries}>
      <View style={styles.boundaryMark} /><View style={styles.boundaryContent}>
        <Text style={ui.heading}>Ti szabjátok a határokat.</Text>
        <Text style={ui.muted}>Bármelyik feladat passzolható. Csak azt vállaljátok, ami mindenkinek belefér.</Text>
      </View>
    </View>
  </ScreenShell>;
}

const styles = StyleSheet.create({
  hero: { minHeight: 230, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: '#291822', padding: 24 },
  heroContent: { zIndex: 1, gap: 12 },
  headline: { color: colors.text, fontSize: 42, lineHeight: 49, fontWeight: '800', letterSpacing: -1.5 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 24, maxWidth: 340 },
  emblem: { position: 'absolute', width: 140, height: 140, right: -22, top: -18, opacity: 0.28, borderRadius: 70 },
  facts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 9, paddingHorizontal: 4 },
  fact: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  dot: { height: 3, width: 3, borderRadius: 2, backgroundColor: colors.accent },
  actions: { gap: 10 },
  boundaries: { flexDirection: 'row', gap: 14, paddingVertical: 8, paddingHorizontal: 4 },
  boundaryMark: { width: 3, borderRadius: 4, backgroundColor: colors.accent },
  boundaryContent: { flex: 1, gap: 6 }
});
