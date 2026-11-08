import { Text, Switch } from '../i18n/ui';
import React, { useEffect, useRef, useState } from 'react';
import { View, AccessibilityInfo, Platform, StyleSheet, Modal, Pressable } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import RouletteWheel from '../components/RouletteWheel';
import TaskTimer from '../components/TaskTimer';
import { useTranslation } from '../i18n/context';
import { renderCard } from '../domain/renderCard';
import { bodyParts, assignmentBodyParts } from '../domain/assignments';
import { twistText } from '../domain/twists';
import { colors, ui, levels } from '../theme';

export default function GameScreen({
  game,
  card,
  onResolve,
  onChoose,
  onStop,
  onPlayers,
  onLevel,
  onDismissLevel,
  onSpin,
  onAnswered,
  onTimer,
  onDecline,
  onReport
}) {
  const t = useTranslation();
  const locked = useRef(false);
  const timer = useRef(null);
  const [busy, setBusy] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  const turn = game.turns.find(row => row.status === 'open');
  const player = game.roster.find(p => p.id === turn?.playerId)?.name;
  const resolved = game.turns.filter(row => ['completed', 'passed', 'omitted'].includes(row.status)).length;

  useEffect(() => () => clearTimeout(timer.current), []);

  const a = turn?.assignment;
  const pending = Boolean(a?.partnerPending || a?.bodyPending);
  const names = ids => (ids || []).map(id => game.roster.find(p => p.id === id)?.name).filter(Boolean).join(', ');

  // When body is pending, display 'testrész' in the task text
  const rawBodyLabel = bodyParts.find(p => p.id === a?.bodyPartId)?.label;
  const bodyLabel = rawBodyLabel ? t(rawBodyLabel) : (a?.bodyPending ? t('testrész') : '');

  const spokenText = card
    ? renderCard(t(card.text), a?.groups?.[0], game.roster, bodyLabel)
    : t('Várakozás');

  useEffect(() => {
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(`${player || ''}. ${spokenText}`);
  }, [player, spokenText]);

  function resolve() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    timer.current = setTimeout(() => {
      locked.current = false;
      setBusy(false);
    }, 300);
    onResolve('completed');
  }

  // Direct pass without complex preference questions
  function passTurn() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    timer.current = setTimeout(() => {
      locked.current = false;
      setBusy(false);
    }, 300);
    onResolve('passed');
  }

  // Top bar action icons displayed in the brand header row next to the logo
  const headerActions = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <ActionButton
        title="🌶️"
        accessibilityLabel={t('Intenzitási szint módosítása')}
        secondary
        selected={showLevelPicker}
        onPress={() => setShowLevelPicker(!showLevelPicker)}
        style={styles.iconButton}
        textStyle={styles.iconButtonText}
      />
      <ActionButton
        title="👥"
        accessibilityLabel="Játékosok"
        secondary
        onPress={onPlayers}
        style={styles.iconButton}
        textStyle={styles.iconButtonText}
      />
      <ActionButton
        title="🏁"
        accessibilityLabel="Játék befejezése"
        secondary
        onPress={onStop}
        style={styles.iconButton}
        textStyle={styles.iconButtonText}
      />
    </View>
  );

  // Discreet Level Selector Drawer
  const levelDrawer = showLevelPicker && (
    <View style={[ui.panel, { marginBottom: 12, borderColor: colors.accent, borderWidth: 1 }]}>
      <Text style={ui.heading}>Intenzitási szint módosítása</Text>
      <View style={ui.row}>
        {[1, 2, 3, 4, 5].map(lvl => (
          <ActionButton
            key={lvl}
            title={`${lvl} · ${t(levels[lvl])}`}
            secondary
            selected={game.settings.maxIntensity === lvl}
            onPress={() => {
              onLevel(lvl);
              setShowLevelPicker(false);
            }}
          />
        ))}
      </View>
    </View>
  );

  // Level Suggestion Banner
  const suggestionBanner = game.levelSuggestion && (
    <View style={[ui.panel, { backgroundColor: 'rgba(255, 197, 110, 0.15)', borderColor: colors.focus, borderWidth: 1 }]}>
      <Text style={[ui.heading, { color: colors.focus }]}>
        Ajánlott szintváltás: {game.levelSuggestion} · {t(levels[game.levelSuggestion])}
      </Text>
      <View style={ui.row}>
        <ActionButton
          title="Szint emelése"
          onPress={() => onLevel(game.levelSuggestion)}
        />
        <ActionButton
          title="Mégse"
          secondary
          onPress={onDismissLevel}
        />
      </View>
    </View>
  );

  if (game.phase === 'waiting') {
    return (
      <ScreenShell label="SZÜNET" headerRight={headerActions}>
        {levelDrawer}
        <Text style={ui.title}>Várunk rátok.</Text>
        <Text style={ui.muted}>
          {game.waitReason === 'no_cards'
            ? 'Nincs új, megfelelő kártya. Válts típust vagy szintet, vagy fejezd be a játékot.'
            : 'Most nincs aktív játékosnak hátralévő lépése. Hozz vissza egy szünetelő játékost, vagy fejezd be a játékot.'}
        </Text>
        {game.waitReason === 'no_cards' && (
          <View style={ui.row}>
            <ActionButton title="Felelsz" onPress={() => onChoose('question')} />
            <ActionButton title="Mersz" secondary onPress={() => onChoose('challenge')} />
          </View>
        )}
      </ScreenShell>
    );
  }

  if (game.phase === 'choosing') {
    return (
      <ScreenShell label={`${turn.round}. KÖR`} headerRight={headerActions}>
        {levelDrawer}
        <Text style={ui.muted}>Soron következő játékos:</Text>
        <Text verbatim style={[ui.title, { fontSize: 38 }]}>{player}</Text>

        <View style={[ui.panel, { marginTop: 12, gap: 16 }]}>
          <Text style={ui.heading}>Felelsz vagy mersz?</Text>
          <Text style={ui.muted}>Válassz, hogy kérdésre válaszolsz, vagy bevállalsz egy érzéki feladatot.</Text>
          <ActionButton title="Felelsz" onPress={() => onChoose('question')} />
          <ActionButton title="Mersz" secondary onPress={() => onChoose('challenge')} />
        </View>
      </ScreenShell>
    );
  }

  // ACTIVE PLAYING TURN
  const isChallenge = card.kind === 'challenge';
  const groups = a?.groups || [];

  // Wheel labels for partner or body spin
  const eligibleParts = assignmentBodyParts(game, a);

  const wheelLabels = a?.partnerPending
    ? (a.wheelOptions || []).map(option => names(option.playerIds.filter(id => id !== turn.playerId)))
    : eligibleParts.map(p => t(p.label));

  return (
    <ScreenShell label={`${turn.round}. KÖR`} headerRight={headerActions}>
      {levelDrawer}
      {suggestionBanner}

      {/* Main Focus: The Task Card ALWAYS displayed */}
      <View
        accessibilityLiveRegion="polite"
        style={[styles.taskCard, { borderTopColor: isChallenge ? colors.accent : colors.focus }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[ui.eyebrow, { color: isChallenge ? colors.accent : colors.focus }]}>
            {isChallenge ? '🔥 MERSZ · KIHÍVÁS' : '💬 FELELSZ · KÉRDÉS'} · {card.intensity}. {t(levels[card.intensity])}
          </Text>
          <View style={styles.playerBadge}>
            <Text verbatim style={styles.playerBadgeText}>
              👤 {player}
            </Text>
          </View>
        </View>

        {/* If Challenge and roles are assigned, build roles directly into task display */}
        {isChallenge && groups.length > 0 && groups.map((g, i) => {
          const givers = names(g.giverIds) || player;
          const receivers = names(g.receiverIds) || (a?.partnerPending ? `[${t('partner')}]` : '');
          const groupText = renderCard(t(card.text), g, game.roster, bodyLabel);
          return (
            <View key={i} style={groups.length > 1 ? styles.subGroupCard : null}>
              {receivers ? (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {groups.length > 1 ? `${i + 1}. Csapat: ` : ''}
                    🔥 {givers} ➔ {receivers}
                  </Text>
                </View>
              ) : null}
              <Text verbatim style={ui.heading}>{groupText}</Text>
            </View>
          );
        })}

        {/* Questions or tasks without groups */}
        {(!isChallenge || groups.length === 0) && (
          <Text verbatim style={ui.heading}>
            {renderCard(t(card.text), groups[0], game.roster, bodyLabel)}
          </Text>
        )}

        {/* Optional Twist */}
        {turn.twistId && (
          <View style={styles.twistBox}>
            <Text style={styles.twistText}>⚡ {t(twistText(turn.twistId))}</Text>
          </View>
        )}
        <Pressable accessibilityRole="button" accessibilityLabel={t('Hibajelzés erről a kártyáról')} onPress={() => onReport(card)} style={{ alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }}>
          <Text style={{ color: colors.muted, fontSize: 12, textDecorationLine: 'underline' }}>Hibajelzés</Text>
        </Pressable>
      </View>

      {/* PENDING ACTIONS: Spin button and Pass */}
      {pending && (
        <View style={{ gap: 12, marginTop: 12 }}>
          <ActionButton
            title={a?.partnerPending ? "🎲 Partner kisorsolása" : "🎲 Testrész pörgetése"}
            onPress={() => setShowWheel(true)}
          />
          <ActionButton
            title="Passz →"
            secondary
            onPress={passTurn}
          />
        </View>
      )}

      {/* Question responders if multiple */}
      {!pending && a?.responders?.length > 1 && (
        <View style={ui.panel}>
          <Text style={ui.heading}>Ki válaszolt már?</Text>
          {a.responders.map(id => (
            <View key={id} style={ui.row}>
              <Text verbatim style={ui.text}>{names([id])}</Text>
              <Switch
                accessibilityLabel={names([id])}
                value={a.answeredIds.includes(id)}
                onValueChange={() => onAnswered(id)}
              />
            </View>
          ))}
        </View>
      )}

      {/* Discreet Task Timer */}
      {!pending && turn.durationSeconds > 0 && (
        <TaskTimer
          key={`${turn.id}:${game.cardRevision}`}
          turn={turn}
          revision={game.cardRevision}
          onAction={onTimer}
        />
      )}

      {/* REGULAR TURN RESOLUTION: Done or Pass */}
      {!pending && (
        <View style={{ gap: 12, marginTop: 12 }}>
          <ActionButton
            title="Kész ✓"
            disabled={busy || (a?.responders?.length > 1 && a.responders.some(id => !a.answeredIds.includes(id)))}
            onPress={resolve}
          />
          <ActionButton
            title="Passz →"
            secondary
            onPress={passTurn}
          />
        </View>
      )}

      <Text style={[ui.muted, { textAlign: 'center', fontSize: 13, marginTop: 4 }]}>
        {resolved} {t('lépés lezárva')}
      </Text>

      {/* FORTUNE WHEEL POPUP MODAL */}
      <Modal
        visible={showWheel}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWheel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RouletteWheel
              key={`${a?.partnerPending ? 'partner' : 'body'}:${game.cardRevision}`}
              title={a?.partnerPending ? "Partner sorsolása" : "Testrész sorsolása"}
              subtitle={a?.partnerPending ? "Ki lesz a partnered ebben a feladatban?" : "Melyik testrész kerül sorra?"}
              labels={wheelLabels}
              onSpin={index => {
                setShowWheel(false);
                onSpin(a?.partnerPending ? 'partner' : 'body', index);
              }}
              onClose={() => setShowWheel(false)}
            />
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    minHeight: 38,
    minWidth: 38,
    height: 38,
    width: 38,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButtonText: {
    fontSize: 18
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderTopWidth: 4,
    gap: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 12,
    gap: 8
  },
  playerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  playerBadgeText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 122, 144, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  roleBadgeText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700'
  },
  subGroupCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  twistBox: {
    backgroundColor: 'rgba(255, 197, 110, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.focus,
    marginTop: 4
  },
  twistText: {
    color: colors.focus,
    fontSize: 14,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 18, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 144, 0.4)',
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12
  }
});
