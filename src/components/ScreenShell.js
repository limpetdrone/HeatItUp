import { Text } from "../i18n/ui";
import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui } from '../theme';
export default function ScreenShell({
  children,
  label = 'KÖZELEBB EGYMÁSHOZ',
  footer,
  onSettings,
  headerRight
}) {
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.brand}>
            <Text verbatim style={styles.wordmark}>heat<Text verbatim style={{
                color: colors.accent
              }}>it</Text>up<Text verbatim style={{
                color: colors.accent
              }}>.</Text></Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              {headerRight ? headerRight : (
                <>
                  <Text verbatim style={ui.eyebrow}>18+</Text>
                  {onSettings && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Beállítások"
                      onPress={onSettings}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                      <Text verbatim style={{fontSize: 22}}>⚙️</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
          {Boolean(label) && <Text style={ui.eyebrow}>{label}</Text>}
          {children}
          <Text style={styles.footer}>A ti tempótok. A ti határaitok.</Text>
        </View>
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flexGrow: 1,
    padding: 16
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: 16,
    paddingVertical: 12
  },
  brand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  wordmark: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: -1
  },
  footer: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 16
  }
});
