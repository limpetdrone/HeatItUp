import React, { useEffect, useRef, useState } from 'react';
import { View, AppState } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { Text, Switch } from '../i18n/ui';
import ActionButton from './ActionButton';
import { ui } from '../theme';
function playChime(player){player.volume=.25;return player.seekTo(0).then(()=>player.play());}
export default function TaskTimer({turn,onAction}) {
 const [now,setNow]=useState(Date.now);const [sound,setSound]=useState(true);const [audioError,setAudioError]=useState(false);const notified=useRef(null);
 const player=useAudioPlayer(require('../../assets/gentle-chime.wav'));
 useEffect(()=>{const interval=setInterval(()=>setNow(Date.now()),250);const sub=AppState.addEventListener('change',state=>{if(state==='active')setNow(Date.now());});return()=>{clearInterval(interval);sub.remove();};},[]);
 const remaining=turn.timer?.deadline!==null&&turn.timer?.deadline!==undefined?Math.max(0,turn.timer.deadline-now):turn.timer?.remainingMs??turn.durationSeconds*1000;
 useEffect(()=>{if(turn.timer?.deadline&&turn.timer.deadline<=now&&!turn.timer.notified&&notified.current!==turn.timer.deadline){notified.current=turn.timer.deadline;onAction('notify',Date.now());if(sound)Promise.resolve().then(()=>playChime(player)).catch(()=>setAudioError(true));}},[now,turn.timer,player,onAction,sound]);
 if(!turn.durationSeconds)return null;
 const running=Boolean(turn.timer?.deadline);
 return <View style={ui.panel}><Text style={ui.heading}>Időzítő</Text><Text accessibilityLiveRegion={remaining===0?'polite':'none'} style={ui.title}>{Math.floor(Math.ceil(remaining/1000)/60).toString().padStart(2,'0')}:{(Math.ceil(remaining/1000)%60).toString().padStart(2,'0')}</Text>
  <ActionButton title={running?'Időzítő szüneteltetése':turn.timer&&remaining>0?'Időzítő folytatása':'Időzítő indítása'} onPress={()=>{notified.current=null;onAction(running?'pause':turn.timer&&remaining>0?'resume':'start',Date.now());}} />
  <ActionButton title="Időzítő visszaállítása" secondary onPress={()=>{notified.current=null;onAction('reset',Date.now());}} />
  <View style={ui.row}><Text style={ui.text}>Gyengéd hangjelzés</Text><Switch accessibilityLabel="Gyengéd hangjelzés" value={sound} onValueChange={setSound} /></View>{audioError&&<Text style={ui.error}>A hangjelzést a rendszer nem engedte lejátszani.</Text>}
 </View>;
}
