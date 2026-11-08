import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput } from '../i18n/ui';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { ui, colors } from '../theme';
export default function ContentScreen({cards,onImport,onBack}) {
 const [json,setJson]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 return <ScreenShell><Text style={ui.title}>Kártyakészlet</Text><Text style={ui.muted}>Az öt szint kezelése kész. Az üres szintekhez háromnyelvű JSON-kártyákat importálhatsz. A már használt kártyaazonosítók nem írhatók felül.</Text>
 {[1,2,3,4,5].map(level=><View key={level} style={ui.row}><Text style={ui.text}>{level}</Text><Text style={ui.text}>{cards.filter(c=>c.intensity===level&&c.kind==='question').length}</Text><Text style={ui.muted}>kérdés</Text><Text style={ui.text}>{cards.filter(c=>c.intensity===level&&c.kind==='challenge').length}</Text><Text style={ui.muted}>kihívás</Text></View>)}
 <TextInput accessibilityLabel="Tartalom JSON" placeholder="JSON" multiline value={json} onChangeText={setJson} maxLength={1000000} style={{minHeight:200,color:colors.text,borderWidth:1,borderColor:colors.muted,padding:12,textAlignVertical:'top'}} />
 {!!error&&<Text accessibilityRole="alert" style={ui.error}>{error}</Text>}<ActionButton title="Kártyák importálása" disabled={busy||!json.trim()} onPress={async()=>{setBusy(true);try{const value=JSON.parse(json);const result=await onImport(value);if(result.ok){setJson('');setError('');}else setError(result.error);}catch{setError('Érvénytelen tartalomfájl.');}finally{setBusy(false);}}} />
 <ActionButton title="Vissza" secondary onPress={onBack} /></ScreenShell>;
}
