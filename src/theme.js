import { StyleSheet } from 'react-native';
export const colors = {
  background: '#130D18',
  surface: '#23172C',
  text: '#FFF7FA',
  muted: '#C9B8C8',
  accent: '#FF7A90',
  focus: '#FFC56E'
};
export const levels = {
  1: 'Bevezető',
  2: 'Flört',
  3: 'Szikra',
  4: 'Szenvedély',
  5: 'Tüzes'
};
export const ui = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 42
  },
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30
  },
  text: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24
  },
  muted: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },
  error: {
    color: colors.focus,
    fontSize: 14,
    lineHeight: 22
  }
});
