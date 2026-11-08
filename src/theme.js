import { StyleSheet } from 'react-native';

export const colors = {
  background: '#120C16',
  surface: '#231827',
  surfaceRaised: '#2D1E30',
  border: '#59404F',
  text: '#FFF8F5',
  muted: '#D2BFCA',
  accent: '#FF8795',
  focus: '#FFD39A',
  ink: '#28121B'
};

export const levels = {
  1: 'Bevezető',
  2: 'Flört',
  3: 'Szikra',
  4: 'Szenvedély',
  5: 'Tüzes'
};

export const ui = StyleSheet.create({
  title: { color: colors.text, fontSize: 34, fontWeight: '700', lineHeight: 42, letterSpacing: -0.8 },
  heading: { color: colors.text, fontSize: 22, fontWeight: '700', lineHeight: 30, letterSpacing: -0.25 },
  text: { color: colors.text, fontSize: 16, lineHeight: 24 },
  muted: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, lineHeight: 18 },
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 20, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  error: { color: colors.focus, fontSize: 15, lineHeight: 22 }
});
