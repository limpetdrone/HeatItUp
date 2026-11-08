import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput } from '../i18n/ui';
import { useLanguage } from '../i18n/context';
import { feedbackPayload, newFeedbackId, sendFeedback } from '../feedback/client';
import ActionButton from './ActionButton';
import ScreenShell from './ScreenShell';
import { colors, ui } from '../theme';

export default function FeedbackForm({ card, onClose, onBusyChange, submit = sendFeedback }) {
  const type = card ? 'report' : 'suggestion';
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('question');
  const [level, setLevel] = useState(1);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(null);
  const inFlight = useRef(false);

  async function send() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    try {
      const payload = feedbackPayload({ type, message, card, language, kind, level });
      const snapshot = JSON.stringify(payload);
      if (request.current?.snapshot !== snapshot) request.current = { id: newFeedbackId(), snapshot };
      await submit(request.current.id, payload);
      setSent(true);
    } catch (e) {
      setError(e.message === 'Az online visszajelzés még nincs beállítva.' ? e.message : 'A beküldés nem sikerült. Próbáld újra; a szöveg megmaradt.');
    } finally {
      inFlight.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return <ScreenShell label="VISSZAJELZÉS">
    <Text accessibilityRole="header" style={ui.title}>{card ? 'Hibajelzés' : 'Új kérdés vagy feladat javaslata'}</Text>
    {sent ? <Text accessibilityLiveRegion="polite" style={ui.text}>Köszönjük, megérkezett a visszajelzésed.</Text> : <>
      <Text style={ui.muted}>{card ? 'Jelezd, ha gond van ezzel a kártyával. A leírás opcionális.' : 'Írd le az ötletedet. A javaslat ellenőrzés után kerülhet a játékba.'}</Text>
      {!card && <>
        <View style={ui.row}>{[['question', 'Kérdés'], ['challenge', 'Feladat']].map(([value, label]) => <ActionButton key={value} title={label} secondary selected={kind === value} disabled={busy} onPress={() => setKind(value)} />)}</View>
        <Text style={ui.heading}>Javasolt szint</Text>
        <View style={ui.row}>{[1, 2, 3, 4, 5].map(value => <ActionButton key={value} title={String(value)} secondary selected={level === value} disabled={busy} onPress={() => setLevel(value)} />)}</View>
      </>}
      <TextInput accessibilityLabel={card ? 'Leírás (opcionális)' : 'Javaslat leírása'} placeholder={card ? 'Leírás (opcionális)' : 'Javaslat leírása'} multiline maxLength={2000} editable={!busy} value={message} onChangeText={setMessage} style={{ color: colors.text, borderWidth: 1, borderColor: colors.muted, padding: 12, borderRadius: 12, minHeight: 120, textAlignVertical: 'top' }} />
      <Text style={ui.muted}>A megjegyzés online tárolódik. Ne írj bele nevet vagy más személyes adatot. Játékosadatokat és válaszokat nem küldünk.</Text>
      {!!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
      <ActionButton title={busy ? 'Küldés…' : 'Beküldés'} disabled={busy || (!card && !message.trim())} onPress={send} />
    </>}
    <ActionButton title={sent ? 'Bezárás' : 'Mégse'} secondary disabled={busy} onPress={onClose} />
  </ScreenShell>;
}
