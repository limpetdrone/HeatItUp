import { Text } from "./i18n/ui";
import React, { useState, useEffect, useRef } from 'react';
import { BackHandler, Platform, View } from 'react-native';
import { cards as builtinCards } from './data/cards';
import { validateContent } from './domain/content';
import { registerCardTranslations } from './i18n/core';
import ContentScreen from './screens/ContentScreen';
import { startSession, resolveTurn, changePlayerStatus, chooseCardKind, spinAssignment, setAnswered, changeLevel, timerAction, updateWardrobe, stopSession, currentTurn, migrateSession } from './domain/session';
import { rekeyProfiles, normalizeProfile, removeProfile } from './domain/profiles';
import { validatePreset, copy } from './domain/presets';
import { repository, keys } from './storage/repository';
import { musicDefaults, validMusic, validCatalog } from './music/selectTrack';
import DeclineScreen from './screens/DeclineScreen';
import { applyDecline, updatePresetPreferences } from './domain/decline';
import LanguageSettingsScreen from './screens/LanguageSettingsScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import SummaryScreen from './screens/SummaryScreen';
import PlayersScreen from './screens/PlayersScreen';
import PresetsScreen from './screens/PresetsScreen';
import MusicSettingsScreen from './screens/MusicSettingsScreen';
import MusicPanel from './components/MusicPanel';
import ScreenShell from './components/ScreenShell';
import ActionButton from './components/ActionButton';
import { useTranslation } from './i18n/context';
import { ui, colors } from './theme';
const defaults = {
  players: ['Játékos 1', 'Játékos 2'],
  maxIntensity: 1,
  rounds: 20
};
let sequence = 0;
const makeId = () => `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export default function App() {
  const t = useTranslation();
  const freshDefaults = () => ({
    ...defaults,
    players: defaults.players.map(name => t(name))
  });
  const [customContent,setCustomContent]=useState({schemaVersion:1,cards:[]});
  const custom=validateContent(customContent,builtinCards.map(c=>c.id),builtinCards);
  const cards=[...builtinCards,...(custom.ok?custom.cards:[])];
  const [screen, setScreen] = useState('welcome');
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);
  const [presets, setPresets] = useState([]);
  const [draft, setDraft] = useState(freshDefaults);
  const [source, setSource] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [music, setMusic] = useState(musicDefaults);
  const [catalog, setCatalog] = useState([]);
  const [musicBack, setMusicBack] = useState('welcome');
  const [replace, setReplace] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [clearRequested, setClearRequested] = useState(false);
  const retry = useRef(null);
  useEffect(() => {
    let live = true;
    async function load() {
      let savedContent={schemaVersion:1,cards:[]};
      try {savedContent=await repository.read(keys.content,value=>validateContent(value,builtinCards.map(c=>c.id),builtinCards).ok,savedContent);if(live)setCustomContent(savedContent);}catch{if(live)setError('Érvénytelen tartalomfájl.');}
      const loaded=validateContent(savedContent,builtinCards.map(c=>c.id),builtinCards);const availableCards=[...builtinCards,...(loaded.ok?loaded.cards:[])];registerCardTranslations(availableCards);
      const tasks = [[keys.presets, v => Array.isArray(v) && v.every(p => validatePreset(p, v, {
        allowLegacySinglePlayer: true
      }).ok) && new Set(v.map(p => p.id)).size === v.length, [], setPresets], [keys.session, v => Boolean(migrateSession(v, availableCards)), null, s => {
        const migrated=migrateSession(s,availableCards);sessionRef.current = migrated;
        setSession(migrated);
      }], [keys.music, validMusic, musicDefaults, setMusic], [keys.catalog, validCatalog, [], setCatalog]];
      for (const [key, valid, fallback, apply] of tasks) {
        try {
          const value = await repository.read(key, valid, fallback);
          if (live) apply(value);
        } catch (e) {
          if (live) setError(`${e.message} A többi adatot betöltöttük.`);
        }
      }
      if (live) setReady(true);
    }
    load();
    return () => {
      live = false;
    };
  }, []);
  async function persist(key, value, apply) {
    try {
      await repository.write(key, value);
      apply?.();
      setNotice('Mentve ezen a készüléken.');
      retry.current = null;
      setError('');
      return true;
    } catch {
      setError('A mentés nem sikerült. A játék folytatható; próbáld újra a mentést.');
      retry.current = () => persist(key, value, apply);
      return false;
    }
  }
  function commit(s) {
    sessionRef.current = s;
    setSession(s);
    persist(keys.session, s);
  }
  function outcome(result) {
    if (!result.ok) {
      setError(result.error);
      return;
    }
    commit(result.session);
  }
  function goBack() {
    if (screen === 'decline') setScreen('game');else if (screen === 'players') setScreen('game');else if (screen === 'music') setScreen(musicBack);else if (screen === 'editor') setScreen('presets');else if (screen === 'game') {
      commit(stopSession(sessionRef.current));
      setScreen('summary');
    } else setScreen('welcome');
  }
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'welcome') return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  });
  function begin(settings) {
    const profiles=settings.profiles || settings.players.map((name,i)=>normalizeProfile({id:String(i),name}));
    const roster=rekeyProfiles(profiles,makeId).map((p,i)=>({...p,sourceMemberId:source?.members.some(m=>m.id===profiles[i].id)?profiles[i].id:null}));
    const result = startSession(makeId(), {
      ...settings,
      music
    }, roster, cards, source?.id || null);
    if (result.ok) {
      commit(result.session);
      setScreen('game');
      setReplace(false);
    } else setError(result.error);
  }
  function showSetup(preset) {
    setSource(preset || null);
    setDraft(preset ? {
      ...copy(preset.defaults),
      players: preset.members.map(m => m.name),
      profiles: copy(preset.members)
    } : freshDefaults());
    if (preset?.defaults.music && validMusic(preset.defaults.music)) setMusic(copy(preset.defaults.music));
    setScreen('setup');
  }
  async function savePreset(settings, name) {
    const previous = screen === 'editor' ? editing : null;
    const candidate = {
      id: previous?.id || makeId(),
      name,
      members: (()=>{const profiles=settings.profiles||settings.players.map((name,i)=>normalizeProfile({id:String(i),name}));return previous?profiles.map(normalizeProfile):rekeyProfiles(profiles,makeId);})(),
      defaults: {
        maxIntensity: settings.maxIntensity,
        rounds: settings.rounds,
        options: copy(settings.options || {}),
        music: copy(music)
      }
    };
    const valid = validatePreset(candidate, presets);
    if (!valid.ok) {
      setError(valid.error);
      return;
    }
    const next = [...presets.filter(p => p.id !== candidate.id), valid.preset];
    if (await persist(keys.presets, next, () => setPresets(next))) {
      if (screen === 'editor') setScreen('presets');else {setSource(valid.preset);setDraft({...settings,players:valid.preset.members.map(p=>p.name),profiles:copy(valid.preset.members)});}
    }
  }
  async function confirmDecline(request){
    const original=sessionRef.current;const card=cards.find(c=>c.id===original.currentCardId);const result=applyDecline(original,card,request);
    if(!result.ok){setError(result.error);return;}
    if(request.save){const preset=presets.find(p=>p.id===original.sourcePresetId);const updated=updatePresetPreferences(preset,result.session,request.playerId);if(!updated.ok){setError(updated.error);return;}const next=presets.map(p=>p.id===updated.preset.id?updated.preset:p);if(!await persist(keys.presets,next,()=>setPresets(next)))return;}
    const turn=currentTurn(original);outcome(resolveTurn(result.session,{turnId:turn.id,cardRevision:original.cardRevision,outcome:'passed'},cards));setScreen('game');
  }
  function setupFromSession(){const original=sessionRef.current;let profiles=original.roster.map(normalizeProfile);for(const p of original.roster.filter(p=>p.status==='removed'))profiles=removeProfile(profiles,p.id);setSource(null);setDraft({...original.settings,players:profiles.map(p=>p.name),profiles});setScreen('setup');}
  const openMusic = () => {
    setMusicBack(screen);
    setScreen('music');
  };
  let content;
  if (!ready) content = <ScreenShell><Text style={ui.title}>Betöltés…</Text></ScreenShell>;else if (screen === 'welcome') content = <WelcomeScreen hasSession={session && session.phase !== 'finished'} onResume={() => {
    setMusic({
      ...musicDefaults,
      ...session.settings.music,
      autoStart: false
    });
    setScreen('game');
  }} onContinue={() => {
    if (session && session.phase !== 'finished') setReplace(true);else showSetup();
  }} onClearSession={() => setClearRequested(true)} onPresets={() => setScreen('presets')} onMusic={openMusic} onContent={()=>setScreen('content')} onLanguage={() => setScreen('language')} />;else if (screen === 'content') content = <ContentScreen cards={cards} onBack={()=>setScreen('welcome')} onImport={async envelope=>{const checked=validateContent(envelope,cards.map(c=>c.id),cards);if(!checked.ok)return checked;const next={schemaVersion:1,cards:[...customContent.cards,...envelope.cards]};if(!validateContent(next,builtinCards.map(c=>c.id),builtinCards).ok)return {ok:false,error:'Érvénytelen tartalomfájl.'};if(!await persist(keys.content,next,()=>{registerCardTranslations(checked.cards);setCustomContent(next);}))return {ok:false,error:'A mentés nem sikerült.'};return {ok:true};}} />;else if (screen === 'language') content = <LanguageSettingsScreen onBack={() => setScreen('welcome')} />;else if (screen === 'setup' || screen === 'editor') content = <SetupScreen key={`${screen}:${editing?.id || source?.id || ''}`} draft={draft} onStart={begin} onBack={goBack} startError={error} onSavePreset={savePreset} initialPresetName={screen === 'editor' ? editing?.name || '' : ''} editing={screen === 'editor'} />;else if (screen === 'presets') content = <PresetsScreen presets={presets} onUse={p => {
    setSource(p);
    if (session && session.phase !== 'finished') {
      setDraft({
        ...p.defaults,
        players: p.members.map(m => m.name),
      profiles: copy(p.members)
      });
      setReplace(true);
    } else showSetup(p);
  }} onNew={() => {
    setEditing(null);
    setDraft(freshDefaults());
    setScreen('editor');
  }} onEdit={p => {
    setEditing(p);
    setDraft({
      ...p.defaults,
      players: p.members.map(m => m.name),
      profiles: copy(p.members)
    });
    if (validMusic(p.defaults.music)) setMusic(copy(p.defaults.music));
    setScreen('editor');
  }} onCopy={p => {
    setEditing(null);
    setDraft({
      ...p.defaults,
      players: p.members.map(m => m.name),
      profiles: copy(p.members)
    });
    if (validMusic(p.defaults.music)) setMusic(copy(p.defaults.music));
    setScreen('editor');
  }} onDelete={p => setDeleteId(p.id)} onBack={goBack} />;else if (screen === 'music') content = <MusicSettingsScreen music={music} onMusic={m => {
    setMusic(m);
    persist(keys.music, m);
    if (sessionRef.current && sessionRef.current.phase !== 'finished') commit({
      ...sessionRef.current,
      settings: {
        ...sessionRef.current.settings,
        music: copy(m)
      }
    });
  }} catalog={catalog} onCatalog={next => persist(keys.catalog, next, () => setCatalog(next))} cards={cards} cardId={session?.currentCardId} makeId={makeId} onBack={goBack} />;else if (screen === 'decline') content = <DeclineScreen session={session} card={cards.find(c=>c.id===session.currentCardId)} onConfirm={confirmDecline} onBack={()=>setScreen('game')} />;else if (screen === 'players') content = <PlayersScreen makeId={makeId} onWardrobe={(id,wardrobe)=>outcome(updateWardrobe(sessionRef.current,id,wardrobe,cards))} session={session} onChange={(id, status) => outcome(changePlayerStatus(sessionRef.current, id, status, cards))} onBack={() => setScreen(sessionRef.current.phase === 'finished' ? 'summary' : 'game')} />;else if (screen === 'summary' || session?.phase === 'finished') content = <SummaryScreen game={session} onRestart={setupFromSession} onSettings={setupFromSession} />;else content = <GameScreen game={session} card={cards.find(c => c.id === session.currentCardId)} onLevel={level=>outcome(changeLevel(sessionRef.current,level,cards))} onDismissLevel={()=>commit({...sessionRef.current,levelSuggestion:null})} onSpin={(part,index)=>{if(sessionRef.current.cardRevision===session.cardRevision&&currentTurn(sessionRef.current)?.id===currentTurn(session)?.id)outcome(spinAssignment(sessionRef.current,part,cards,Math.random,index));}} onAnswered={id=>outcome(setAnswered(sessionRef.current,id))} onTimer={(action,now)=>outcome(timerAction(sessionRef.current,{action,now,turnId:currentTurn(session)?.id,revision:session.cardRevision}))} onDecline={()=>setScreen('decline')} onChoose={kind => outcome(chooseCardKind(sessionRef.current, {
    kind,
    turnId: currentTurn(session)?.id
  }, cards))} onResolve={value => outcome(resolveTurn(sessionRef.current, {
    turnId: currentTurn(session)?.id,
    cardRevision: session.cardRevision,
    outcome: value
  }, cards))} onStop={() => {
    commit(stopSession(sessionRef.current));
    setScreen('summary');
  }} onPlayers={() => setScreen('players')} onMusic={openMusic} musicPanel={<MusicPanel music={music} catalog={catalog} cardId={session.currentCardId} onUserPause={() => setMusic(value => ({
    ...value,
    autoStart: false
  }))} requestKey={`${session.id}:${currentTurn(session)?.id}:${session.cardRevision}`} />} />;
  return <View style={{
    flex: 1, backgroundColor: colors.background
  }}>
    {!!error && <View style={{
      padding: 12
    }}><Text accessibilityRole="alert" style={ui.error}>{error}</Text>{retry.current && <ActionButton title="Mentés újrapróbálása" onPress={() => retry.current?.()} />}<ActionButton title="Bezárás" secondary onPress={() => setError('')} /></View>}
    {!!notice && <Text accessibilityLiveRegion="polite" style={[ui.muted, {
      paddingHorizontal: 16
    }]}>{notice}</Text>}
    {clearRequested ? <ScreenShell><Text style={ui.heading}>Törlöd a mentett játékot? A presetek és a dalok megmaradnak.</Text><ActionButton title="Igen, törlöm a játékot" onPress={async () => {
        if (await persist(keys.session, null, () => {
          sessionRef.current = null;
          setSession(null);
        })) setClearRequested(false);
      }} /><ActionButton title="Mégse" secondary onPress={() => setClearRequested(false)} /></ScreenShell> : replace ? <ScreenShell><Text style={ui.title}>Van egy folyamatban lévő játék.</Text><ActionButton title="Folytatom" onPress={() => {
        setReplace(false);
        setScreen('game');
      }} /><ActionButton title="Új összeállítást készítek" onPress={() => {
        setReplace(false);
        showSetup(source);
      }} /><ActionButton title="Mégse" secondary onPress={() => setReplace(false)} /></ScreenShell> : deleteId ? <ScreenShell><Text style={ui.heading}>Törlöd ezt a presetet? A futó játék megmarad.</Text><ActionButton title="Preset törlése" onPress={async () => {
        const next = presets.filter(p => p.id !== deleteId);
        if (await persist(keys.presets, next, () => setPresets(next))) setDeleteId(null);
      }} /><ActionButton title="Mégse" secondary onPress={() => setDeleteId(null)} /></ScreenShell> : content}
  </View>;
}
