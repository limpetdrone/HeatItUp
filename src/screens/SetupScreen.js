import { Text, TextInput } from '../i18n/ui';
import React, { useState } from 'react';
import { View } from 'react-native';
import { validateSettings } from '../domain/validation';
import { normalizeProfile, pairProfiles, removeProfile } from '../domain/profiles';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import ProfileEditor from '../components/ProfileEditor';
import GameOptionsEditor, { defaultGameOptions } from '../components/GameOptionsEditor';
import { useTranslation } from '../i18n/context';
import { colors, ui, levels } from '../theme';
let nextProfileId=0;
const localId=()=>`draft-${Date.now().toString(36)}-${++nextProfileId}`;
export default function SetupScreen({draft,onStart,onBack,startError,onSavePreset,initialPresetName='',editing=false}) {
 const t=useTranslation();
 const [profiles,setProfiles]=useState(()=>draft.profiles?.map(normalizeProfile)||draft.players.map(name=>normalizeProfile({id:localId(),name})));
 const [settings,setSettings]=useState(()=>({...draft,options:{...defaultGameOptions,...draft.options}}));
 const [submitted,setSubmitted]=useState(false); const [presetName,setPresetName]=useState(initialPresetName);
 const [mode,setMode]=useState('host'); const [stage,setStage]=useState('general'); const [index,setIndex]=useState(0);
 const result=validateSettings({...settings,profiles,players:profiles.map(p=>p.name)});
 function patchProfile(profile){setProfiles(previous=>previous.map(p=>p.id===profile.id?profile:p));}
 function pair(id,partnerId){setProfiles(previous=>pairProfiles(previous,id,partnerId));}
 function add(){const used=new Set(profiles.map(p=>p.name.trim().toLocaleLowerCase('hu-HU')));let n=1;while(used.has(t(`Játékos ${n}`).toLocaleLowerCase('hu-HU')))n++;setProfiles(previous=>[...previous,normalizeProfile({id:localId(),name:t(`Játékos ${n}`)})]);}
 function remove(id){setProfiles(previous=>removeProfile(previous,id));setIndex(value=>Math.min(value,profiles.length-2));}
 function submit(save=false){setSubmitted(true);if(result.ok){if(save)onSavePreset(result.settings,presetName);else onStart(result.settings);}}
 function next(){
  const p=profiles[index];const name=p.name.trim();
  if(!name||Array.from(name).length>20||profiles.some((other,i)=>i!==index&&other.name.trim().toLocaleLowerCase('hu-HU')===name.toLocaleLowerCase('hu-HU'))){setSubmitted(true);return;}
  setSubmitted(false);
  if(index+1<profiles.length){setIndex(index+1);setStage('handoff');}else setStage('review');
 }
 const countControls=<View style={ui.panel}><Text style={ui.heading}>Játékosok száma</Text><Text style={ui.title}>{profiles.length}</Text><View style={ui.row}><ActionButton title="−" accessibilityLabel="Utolsó hely törlése" secondary disabled={profiles.length<=2} onPress={()=>remove(profiles[profiles.length-1].id)} /><ActionButton title="+ Játékos hozzáadása" secondary disabled={profiles.length>=8} onPress={add} /></View><Text style={ui.muted}>A létszám javítása nem törli a többi profilt.</Text></View>;
 const errors=submitted&&!result.ok&&<View accessibilityRole="alert">{result.errors.map(error=><Text key={error} style={ui.error}>{error}</Text>)}</View>;
 if(mode==='pass'&&stage==='handoff')return <ScreenShell><Text style={ui.title}>Add tovább a telefont.</Text><Text style={ui.text}>{index+1}. játékos</Text><Text style={ui.muted}>A következő személy nyissa meg a saját beállításait.</Text><ActionButton title="Én következem" onPress={()=>setStage('profile')} />{countControls}<ActionButton title="Vissza a közös beállításokhoz" secondary onPress={()=>setStage('general')} /></ScreenShell>;
 if(mode==='pass'&&stage==='profile')return <ScreenShell><Text style={ui.title}>Saját profil</Text><Text style={ui.muted}>{index+1}/{profiles.length}</Text><ProfileEditor globalActivities={settings.options.activities} key={profiles[index].id} profile={profiles[index]} profiles={profiles} onChange={patchProfile} onPair={partnerId=>pair(profiles[index].id,partnerId)} makeId={localId} />{errors}<ActionButton title="Profil kész, továbbadom" onPress={next} />{countControls}<ActionButton title="Vissza a közös beállításokhoz" secondary onPress={()=>setStage('general')} /></ScreenShell>;
 return <ScreenShell label="HANGOLÓDJATOK EGYMÁSRA">
  <Text style={ui.title} accessibilityRole="header">Kik játszanak?</Text><View style={ui.row}><ActionButton title="Játékmester állítja be" secondary selected={mode==='host'} onPress={()=>{setMode('host');setStage('general');}} /><ActionButton title="Körbeadós beállítás" secondary selected={mode==='pass'} onPress={()=>{setMode('pass');setStage('general');}} /></View>
  {countControls}
  {mode==='host'&&profiles.map((p,i)=><View key={p.id} style={ui.panel}><Text style={ui.heading}>{i+1}. játékos</Text><ProfileEditor globalActivities={settings.options.activities} profile={p} profiles={profiles} onChange={patchProfile} onPair={partnerId=>pair(p.id,partnerId)} makeId={localId} /><ActionButton title="Játékos törlése" secondary disabled={profiles.length<=2} onPress={()=>remove(p.id)} /></View>)}
  {mode==='pass'&&stage==='review'&&<View style={ui.panel}><Text style={ui.heading}>Profilok elkészültek</Text>{profiles.map((p,i)=><View key={p.id} style={{gap:8}}><Text verbatim style={ui.text}>{p.name}</Text><ActionButton title="Saját profil megnyitása" secondary onPress={()=>{setIndex(i);setStage('handoff');}} /></View>)}</View>}
  <Text style={ui.heading}>Kezdő szint</Text><View style={ui.row}>{[1,2,3,4,5].map(level=><ActionButton key={level} title={`${level} · ${t(levels[level])}`} secondary selected={settings.maxIntensity===level} onPress={()=>setSettings(previous=>({...previous,maxIntensity:level}))} />)}</View>
  <Text style={ui.heading}>Hány kör fér bele?</Text><View style={ui.row}>{[3,5,10,20].map(rounds=><ActionButton key={rounds} title={`${rounds} kör`} secondary selected={settings.rounds===rounds} onPress={()=>setSettings(previous=>({...previous,rounds}))} />)}</View>
  <GameOptionsEditor options={settings.options} onChange={options=>setSettings(previous=>({...previous,options}))} />
  {mode==='pass'&&stage==='general'&&<ActionButton title="Telefon körbeadása" onPress={()=>{setIndex(0);setStage('handoff');}} />}
  {errors}{!!startError&&<Text accessibilityRole="alert" style={ui.error}>{startError}</Text>}
  {(mode==='host'||stage==='review')&&<>
    {!!onSavePreset&&<View style={ui.panel}><Text style={ui.heading}>Mentés presetként</Text><TextInput accessibilityLabel="Preset neve" placeholder="Összeállítás neve" placeholderTextColor={colors.muted} value={presetName} onChangeText={setPresetName} style={{color:colors.text,borderColor:colors.muted,borderWidth:1,padding:12,borderRadius:12}} /><ActionButton title="Preset mentése" onPress={()=>submit(true)} /></View>}
    {!editing&&<ActionButton title="Játék indítása →" onPress={()=>submit()} />}
  </>}
  <ActionButton title="Vissza" secondary onPress={onBack} /><Text style={ui.muted}>A játék és a presetek ezen a készüléken mentődnek. A játék közbeni névsorváltozások nem írják át a presetet.</Text>
 </ScreenShell>;
}
