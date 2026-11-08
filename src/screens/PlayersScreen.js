import { Text } from "../i18n/ui";
import React, { useState } from 'react';
import { View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import ProfileEditor from '../components/ProfileEditor';
import { ui } from '../theme';
export default function PlayersScreen({
  session,
  onChange,
  onWardrobe,
  makeId,
  onBack
}) {
  const [wardrobe,setWardrobe]=useState(null);
  const [confirm, setConfirm] = useState(null);
  return <ScreenShell label="JÁTÉKOSOK"><Text style={ui.title}>Ki van játékban?</Text><Text style={ui.muted}>A mentett preset változatlan marad.</Text>
    {session.roster.map(p => <View key={p.id} style={ui.panel}><Text style={ui.heading} verbatim>{p.name}</Text><Text style={ui.muted}>{{
          active: 'Aktív',
          paused: 'Szünetel',
          removed: 'Kivéve ebből a játékból'
        }[p.status]}</Text><ActionButton title="Ruházat" secondary onPress={()=>setWardrobe(wardrobe===p.id?null:p.id)} />{wardrobe===p.id&&<ProfileEditor wardrobeOnly profile={p} profiles={session.roster} onChange={profile=>onWardrobe(p.id,profile.wardrobe)} makeId={makeId} />}
    {p.status !== 'removed' && <>
      <ActionButton title={p.status === 'active' ? 'Szünet' : 'Visszatérés'} onPress={() => onChange(p.id, p.status === 'active' ? 'paused' : 'active')} />
      <ActionButton title="Kivétel ebből a játékból" secondary onPress={() => setConfirm(p.id)} />
      {confirm === p.id && <><Text style={ui.text}>{p.name} ebben a játékban már nem kerül sorra. A presetben megmarad.</Text><ActionButton title="Igen, kiveszem" onPress={() => {
            onChange(p.id, 'removed');
            setConfirm(null);
          }} /><ActionButton title="Mégse" secondary onPress={() => setConfirm(null)} /></>}
    </>}</View>)}<ActionButton title="Vissza a játékhoz" onPress={onBack} /></ScreenShell>;
}
