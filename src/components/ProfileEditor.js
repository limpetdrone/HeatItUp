import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Switch } from '../i18n/ui';
import { useTranslation } from '../i18n/context';
import { normalizeProfile, activityCategories, clothingTypes, fetishTypes } from '../domain/profiles';
import ActionButton from './ActionButton';
import { ui, colors } from '../theme';
export const categoryLabels = { oral:'Orális szex', penetration:'Behatolás', anal:'Anális szex', fetish:'Fétis', femaleSameGender:'Nő–nő feladatok', maleSameGender:'Férfi–férfi feladatok' };
export const clothingLabels = {shirt:'Felső',trousers:'Nadrág',skirt:'Szoknya',dress:'Ruha',bra:'Melltartó',underwear:'Alsónemű',socks:'Zokni',shoes:'Cipő',other:'Egyéb ruhadarab'};
export const fetishLabels = {blindfold:'Szemkötő',roleplay:'Szerepjáték',feet:'Láb'};
export default function ProfileEditor({ profile, profiles, onChange, onPair, makeId, wardrobeOnly = false, globalActivities = {} }) {
  const t = useTranslation(); const p = normalizeProfile(profile); const [details,setDetails] = useState(false);
  const patch = change => onChange({...p,...change});
  const preferences = change => patch({preferences:{...p.preferences,...change}});
  function rule(category, change) { preferences({activities:{...p.preferences.activities,[category]:{...p.preferences.activities[category],...change}}}); }
  const toggle = (list,id) => list.includes(id) ? list.filter(x=>x!==id) : [...list,id];
  return <View style={{gap:12}}>
    {!wardrobeOnly && <>
      <TextInput accessibilityLabel="Név" autoCorrect={false} value={p.name} onChangeText={name=>patch({name})} style={{color:colors.text,borderColor:colors.muted,borderWidth:1,borderRadius:12,padding:12,fontSize:16}} />
      <Text style={ui.heading}>Nem / identitás</Text><View style={ui.row}>{[[null,'Nincs megadva'],['male','Férfi'],['female','Nő'],['nonbinary','Nem bináris']].map(([value,label])=><ActionButton key={String(value)} title={label} selected={p.gender===value} secondary onPress={()=>patch({gender:value})} />)}</View>
      <Text style={ui.heading}>Pár megjelölése</Text><ActionButton title="Nincs pár" secondary selected={!p.partnerId} onPress={()=>onPair(null)} />
      {profiles.filter(other=>other.id!==p.id).map(other=><ActionButton key={other.id} verbatim title={other.name || `${profiles.indexOf(other) + 1}. ${t('játékos')}`} selected={p.partnerId===other.id} secondary onPress={()=>onPair(other.id)} />)}
      <Text style={ui.muted}>A párok megjelölése nem ír felül személyes határokat.</Text>
      <ActionButton title={details?'Személyes beállítások bezárása':'Személyes beállítások'} secondary onPress={()=>setDetails(!details)} />
      {details && <View style={{gap:16}}>
        {['femaleSameGender','maleSameGender'].map(id=><View key={id} style={ui.row}><Text style={ui.text}>{categoryLabels[id]}</Text><Switch accessibilityLabel={categoryLabels[id]} value={p.preferences.genderActivities[id]??globalActivities[id]??(id==='femaleSameGender')} onValueChange={value=>preferences({genderActivities:{...p.preferences.genderActivities,[id]:value}})} /></View>)}
        <ActionButton title="Közös beállítások öröklése" secondary onPress={()=>preferences({genderActivities:{femaleSameGender:null,maleSameGender:null}})} />
        <Text style={ui.heading}>Akikkel nem szeretnék interakciót</Text>
        {profiles.filter(other=>other.id!==p.id).map(other=><View key={other.id} style={ui.row}><Text verbatim style={ui.text}>{other.name}</Text><Switch accessibilityLabel={other.name} value={p.preferences.blockedIds.includes(other.id)} onValueChange={()=>preferences({blockedIds:toggle(p.preferences.blockedIds,other.id)})} /></View>)}
        {activityCategories.map(category=><View key={category} style={ui.panel}><Text style={ui.heading}>{categoryLabels[category]}</Text>
          {['give','receive'].map(role=>{const r=p.preferences.activities[category];return <View key={role} style={{gap:8}}>
            <Text style={ui.text}>{role==='give'?'Adó szerepet vállalok':'Fogadó szerepet vállalok'}</Text><Switch accessibilityLabel={t(categoryLabels[category])+' · '+t(role==='give'?'Adó szerepet vállalok':'Fogadó szerepet vállalok')} value={r[role]} onValueChange={value=>rule(category,{[role]:value})} />
            <View style={ui.row}>{[['all','Mindenkivel'],['partner','Csak a párommal'],['selected','Kijelölt személyekkel']].map(([value,label])=><ActionButton key={value} title={label} selected={r[role+'Policy']===value} secondary onPress={()=>rule(category,{[role+'Policy']:value})} />)}</View>
            {r[role+'Policy']==='selected' && profiles.filter(other=>other.id!==p.id).map(other=><View key={other.id} style={ui.row}><Text verbatim style={ui.text}>{other.name}</Text><Switch accessibilityLabel={other.name} value={r[role+'Ids'].includes(other.id)} onValueChange={()=>rule(category,{[role+'Ids']:toggle(r[role+'Ids'],other.id)})} /></View>)}
          </View>;})}
        </View>)}
        <Text style={ui.heading}>Vállalt fétiskategóriák</Text>{fetishTypes.map(id=><View key={id} style={ui.row}><Text style={ui.text}>{fetishLabels[id]}</Text><Switch accessibilityLabel={fetishLabels[id]} value={p.preferences.fetishes.includes(id)} onValueChange={()=>preferences({fetishes:toggle(p.preferences.fetishes,id)})} /></View>)}
      </View>}
    </>}
    {(details || wardrobeOnly) && <View style={{gap:8}}><Text style={ui.heading}>Ruházat (opcionális)</Text>
      {clothingTypes.map(type=><View key={type} style={ui.row}><Text style={ui.text}>{clothingLabels[type]}</Text><Text style={ui.text}>{p.wardrobe.filter(item=>item.type===type&&item.worn).length}</Text><ActionButton title="+" accessibilityLabel={t(clothingLabels[type])+' +'} secondary onPress={()=>patch({wardrobe:[...p.wardrobe,{id:makeId(),type,worn:true}]})} /></View>)}
      {p.wardrobe.map((item,index)=><View key={item.id} style={ui.row}><Text style={ui.text}>{clothingLabels[item.type]}</Text><Text style={ui.text}>#{index+1}</Text><Switch accessibilityLabel={t(clothingLabels[item.type])+' '+(index+1)} value={item.worn} onValueChange={value=>patch({wardrobe:p.wardrobe.map(x=>x.id===item.id?{...x,worn:value}:x)})} /></View>)}
    </View>}
  </View>;
}
