import React, { useEffect, useRef, useState } from 'react';
import { View, AppState, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Text, Switch } from '../i18n/ui';
import ActionButton from './ActionButton';
import { colors, ui } from '../theme';

function playChime(player) {
  player.volume = 0.25;
  return player.seekTo(0).then(() => player.play());
}

export default function TaskTimer({ turn, onAction }) {
  const [now, setNow] = useState(Date.now);
  const [sound, setSound] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const notified = useRef(null);

  const player = useAudioPlayer(require('../../assets/gentle-chime.wav'));

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  const remaining = turn.timer?.deadline !== null && turn.timer?.deadline !== undefined
    ? Math.max(0, turn.timer.deadline - now)
    : turn.timer?.remainingMs ?? (turn.durationSeconds * 1000);

  useEffect(() => {
    if (turn.timer?.deadline && turn.timer.deadline <= now && !turn.timer.notified && notified.current !== turn.timer.deadline) {
      notified.current = turn.timer.deadline;
      onAction('notify', Date.now());
      if (sound) Promise.resolve().then(() => playChime(player)).catch(() => setAudioError(true));
    }
  }, [now, turn.timer, player, onAction, sound]);

  if (!turn.durationSeconds) return null;

  const running = Boolean(turn.timer?.deadline);
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  function adjustDuration(deltaSeconds) {
    notified.current = null;
    onAction('adjust', Date.now(), deltaSeconds);
  }

  return (
    <View style={styles.container}>
      {/* Discreet Timer Pill */}
      <View style={styles.pillRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Időzítő: ${minutes}:${seconds}`}
          onPress={() => setExpanded(!expanded)}
          style={[styles.timerBadge, running && styles.timerBadgeRunning]}
        >
          <Text style={styles.timerIcon}>⏱️</Text>
          <Text accessibilityLiveRegion={remaining === 0 ? 'polite' : 'none'} style={styles.timerDigits}>
            {minutes}:{seconds}
          </Text>
        </TouchableOpacity>

        <View style={styles.quickControls}>
          <ActionButton
            title={running ? 'Szünet ⏸' : turn.timer && remaining > 0 ? 'Folytatás ▶' : 'Indítás ▶'}
            onPress={() => {
              notified.current = null;
              onAction(running ? 'pause' : turn.timer && remaining > 0 ? 'resume' : 'start', Date.now());
            }}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Időzítő beállítások"
            onPress={() => setExpanded(!expanded)}
            style={styles.expandToggle}
          >
            <Text style={{ fontSize: 16, color: colors.muted }}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded controls: Duration adjust and settings */}
      {expanded && (
        <View style={styles.expandedPanel}>
          <Text style={ui.heading}>Időtartam módosítása</Text>
          <View style={ui.row}>
            <ActionButton
              title="−30s"
              secondary
              onPress={() => adjustDuration(-30)}
            />
            <ActionButton
              title="+30s"
              secondary
              onPress={() => adjustDuration(30)}
            />
            <ActionButton
              title="+60s"
              secondary
              onPress={() => adjustDuration(60)}
            />
            <ActionButton
              title="Visszaállítás ↺"
              secondary
              onPress={() => {
                notified.current = null;
                onAction('reset', Date.now());
              }}
            />
          </View>

          <View style={ui.row}>
            <Text style={ui.text}>Gyengéd hangjelzés</Text>
            <Switch
              accessibilityLabel="Gyengéd hangjelzés"
              value={sound}
              onValueChange={setSound}
            />
          </View>
          {audioError && <Text style={ui.error}>A hangjelzést a rendszer nem engedte lejátszani.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 144, 0.25)',
    gap: 12
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  timerBadgeRunning: {
    borderColor: colors.accent,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 122, 144, 0.15)'
  },
  timerIcon: {
    fontSize: 18
  },
  timerDigits: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums']
  },
  quickControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  expandToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  expandedPanel: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  }
});
