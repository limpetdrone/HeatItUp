import { Text } from "../i18n/ui";
import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n/context';
import { colors } from '../theme';
export default function ActionButton({
  title,
  verbatim = false,
  onPress,
  disabled = false,
  secondary = false,
  selected,
  accessibilityLabel,
  style,
  textStyle
}) {
  const t = useTranslation();
  const [focused, setFocused] = useState(false);
  return <Pressable onPress={onPress} disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} accessibilityLabel={verbatim?(accessibilityLabel||title):t(accessibilityLabel || title)} accessibilityRole={selected === undefined ? 'button' : 'radio'} accessibilityState={{
    disabled,
    ...(selected === undefined ? {} : {
      checked: selected
    })
  }} style={({
    pressed
  }) => [styles.button, secondary && styles.secondary, selected && styles.selected, focused && styles.focused, (disabled || pressed) && {
    opacity: disabled ? 0.45 : 0.75
  }, style]}>
    <Text verbatim={verbatim} style={[styles.label, secondary && {
      color: colors.text
    }, textStyle]}>{title}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 44,
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: '#59425E'
  },
  selected: {
    borderColor: colors.accent
  },
  focused: {
    borderColor: colors.focus
  },
  label: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1
  }
});
