import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, Switch } from '../i18n/ui';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import { activityCategories } from '../domain/profiles';
import { ui } from '../theme';
export default function DeclineScreen({session,card,onConfirm,onBack}) {
 const [playerId,setPlayer]=useState(session.turns.find(t=>t.status==='open').playerId);const [scope,setScope]=useState(null);const [partnerId,setPartner]=useState(null);const [role,setRole]=useState(card.interaction?.role||'give');const [save,setSave]=useState(false);const [busy,setBusy]=useState(false);
 const specific=activityCategories.includes(card.interaction?.category);
 return <ScreenShell><Text style={ui.title}>Mit szeretnél kihagyni?</Text><Text style={ui.muted}>A passzolásnak nincs büntetése. Válaszd ki, hogy csak most hagyod ki, vagy új határt szeretnél menteni.</Text>
  <Text style={ui.heading}>Kinek a beállítása?</Text>{session.roster.filter(p=>p.status==='active').map(p=><ActionButton key={p.id} verbatim title={p.name} selected={p.id===playerId} secondary onPress={()=>setPlayer(p.id)} />)}
  {[['once','Csak ezt a feladatot most'],...(specific?[['activity','Ezt a szerepet ebben a kategóriában nem vállalom'],['partnerOnly','Ezt csak a párommal vállalom'],['activityPartner','Ezt ezzel a személlyel nem vállalom']]:[]),['allPartner','Ezzel a személlyel nem szeretnék interakciót']].map(([id,label])=><ActionButton key={id} title={label} selected={scope===id} secondary onPress={()=>setScope(id)} />)}
  {specific&&<View style={ui.row}>{[['give','Adó szerep'],['receive','Fogadó szerep']].map(([id,label])=><ActionButton key={id} title={label} secondary selected={role===id} onPress={()=>setRole(id)} />)}</View>}
  {['activityPartner','allPartner'].includes(scope)&&session.roster.filter(p=>p.id!==playerId).map(p=><ActionButton key={p.id} verbatim title={p.name} selected={partnerId===p.id} secondary onPress={()=>setPartner(p.id)} />)}
  {scope&&scope!=='once'&&session.sourcePresetId&&<View style={ui.row}><Text style={ui.text}>A presetbe is mentem</Text><Switch accessibilityLabel="A presetbe is mentem" value={save} onValueChange={setSave} /></View>}
  <ActionButton title="Passz és beállítás alkalmazása" disabled={busy||!scope||['activityPartner','allPartner'].includes(scope)&&!partnerId} onPress={async()=>{setBusy(true);try{await onConfirm({playerId,scope,partnerId,role,save:save&&scope!=='once'});}finally{setBusy(false);}}} />
  <ActionButton title="Mégse" secondary disabled={busy} onPress={onBack} />
 </ScreenShell>;
}
