import { Text, Switch } from '../i18n/ui';
import React, { useEffect, useRef, useState } from 'react';
import { View, AccessibilityInfo, Platform } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import ActionButton from '../components/ActionButton';
import LevelSelector from '../components/LevelSelector';
import RouletteWheel from '../components/RouletteWheel';
import TaskTimer from '../components/TaskTimer';
import { useTranslation } from '../i18n/context';
import { renderCard } from '../domain/renderCard';
import { bodyParts } from '../domain/assignments';
import { twistText } from '../domain/twists';
import { colors, ui, levels } from '../theme';
export default function GameScreen({game,card,onResolve,onChoose,onStop,onPlayers,onMusic,musicPanel,onLevel,onDismissLevel,onSpin,onAnswered,onTimer,onDecline}) {
 const t=useTranslation();const locked=useRef(false),timer=useRef(null);const [busy,setBusy]=useState(false);
 const turn=game.turns.find(row=>row.status==='open');const player=game.roster.find(p=>p.id===turn?.playerId)?.name;
 const resolved=game.turns.filter(row=>['completed','passed','omitted'].includes(row.status)).length;
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const spokenText=card&&!turn?.assignment?.partnerPending&&!turn?.assignment?.bodyPending?renderCard(t(card.text),turn?.assignment?.groups?.[0],game.roster,t(bodyParts.find(p=>p.id===turn?.assignment?.bodyPartId)?.label)||''):t('Várakozás');
 useEffect(()=>{if(Platform.OS==='ios')AccessibilityInfo.announceForAccessibility(`${player||''}. ${spokenText}`);},[player,spokenText]);
 function resolve(){if(locked.current)return;locked.current=true;setBusy(true);timer.current=setTimeout(()=>{locked.current=false;setBusy(false);},300);onResolve('completed');}
 const level=<LevelSelector level={game.settings.maxIntensity} onChange={onLevel} suggestion={game.levelSuggestion} onDismiss={onDismissLevel} />;
 const navigation=<><ActionButton title="Játékosok" secondary onPress={onPlayers} /><ActionButton title="Zene és dalok" secondary onPress={onMusic} /><ActionButton title="Játék befejezése" secondary onPress={onStop} /></>;
 if(game.phase==='waiting')return <ScreenShell label="SZÜNET"><Text style={ui.title}>Várunk rátok.</Text><Text style={ui.muted}>{game.waitReason==='no_cards'?'Nincs új, megfelelő kártya. Válts típust vagy szintet, vagy fejezd be a játékot.':'Most nincs aktív játékosnak hátralévő lépése. Hozz vissza egy szünetelő játékost, vagy fejezd be a játékot.'}</Text>{game.waitReason==='no_cards'&&<><ActionButton title="Felelsz" onPress={()=>onChoose('question')} /><ActionButton title="Mersz" onPress={()=>onChoose('challenge')} /></>}{level}{navigation}</ScreenShell>;
 if(game.phase==='choosing')return <ScreenShell label={`${turn.round}/${game.settings.rounds} KÖR`}><Text verbatim style={ui.title}>{player}</Text><Text style={ui.title}>Felelsz vagy mersz?</Text><Text style={ui.muted}>Válassz, mielőtt kártyát húzol.</Text><ActionButton title="Felelsz" onPress={()=>onChoose('question')} /><ActionButton title="Mersz" secondary onPress={()=>onChoose('challenge')} />{level}{navigation}</ScreenShell>;
 const a=turn.assignment;const pending=Boolean(a?.partnerPending||a?.bodyPending);const names=ids=>ids.map(id=>game.roster.find(p=>p.id===id)?.name).join(', ');
 return <ScreenShell footer={!pending?musicPanel:null} label={`${turn.round}/${game.settings.rounds} KÖR`}>
 <Text style={ui.muted}>Most te következel</Text><Text verbatim accessibilityRole="header" style={ui.title}>{player}</Text>
 <View accessibilityLiveRegion="polite" style={[ui.panel,{borderTopWidth:3,borderTopColor:colors.accent}]}><Text style={ui.eyebrow}>{card.kind==='question'?'KÉRDÉS':'KIHÍVÁS'} · {card.intensity} {t(levels[card.intensity])}</Text><Text verbatim style={ui.heading}>{pending?t('Pörgesd ki a hiányzó kijelölést.'):renderCard(t(card.text),a?.groups?.[0],game.roster,t(bodyParts.find(p=>p.id===a?.bodyPartId)?.label)||'')}</Text>{!pending&&turn.twistId&&<Text style={[ui.text,{color:colors.accent}]}>{t(twistText(turn.twistId))}</Text>}<Text style={ui.muted}>Csak amennyi jólesik.</Text></View>
 {a?.partnerPending&&<RouletteWheel key={`partner:${game.cardRevision}`} title="Partner kijelölése" labels={(a.wheelOptions||[]).map(option=>names(option.playerIds.filter(id=>id!==turn.playerId)))} onSpin={index=>onSpin('partner',index)} />}
 {!a?.partnerPending&&a?.bodyPending&&<RouletteWheel key={`body:${game.cardRevision}`} title="Testrész kijelölése" labels={bodyParts.filter(p=>p.level<=game.settings.maxIntensity).map(p=>t(p.label))} onSpin={index=>onSpin('body',index)} />}
 {!pending&&a?.groups?.map((group,i)=><View key={i} style={ui.panel}><Text style={ui.eyebrow}>Kijelölt résztvevők</Text>{i>0&&<Text verbatim style={ui.text}>{renderCard(t(card.text),group,game.roster,t(bodyParts.find(p=>p.id===a?.bodyPartId)?.label)||'')}</Text>}<Text style={ui.muted}>Adó szerep</Text><Text verbatim style={ui.text}>{names(group.giverIds)}</Text>{!!group.receiverIds.length&&<><Text style={ui.muted}>Fogadó szerep</Text><Text verbatim style={ui.text}>{names(group.receiverIds)}</Text></>}</View>)}
 {!pending&&a?.bodyPartId&&<Text style={ui.heading}>{t('Kijelölt testrész')}: {t(bodyParts.find(p=>p.id===a.bodyPartId)?.label)}</Text>}
 {!pending&&a?.responders?.length>1&&<View style={ui.panel}><Text style={ui.heading}>Ki válaszolt már?</Text>{a.responders.map(id=><View key={id} style={ui.row}><Text verbatim style={ui.text}>{names([id])}</Text><Switch accessibilityLabel={names([id])} value={a.answeredIds.includes(id)} onValueChange={()=>onAnswered(id)} /></View>)}</View>}
 {!pending&&turn.durationSeconds>0&&<TaskTimer key={`${turn.id}:${game.cardRevision}`} turn={turn} revision={game.cardRevision} onAction={onTimer} />}
 <ActionButton title="Kész ✓" disabled={busy||pending||a?.responders?.length>1&&a.responders.some(id=>!a.answeredIds.includes(id))} onPress={resolve} />
 <ActionButton title="Passz →" secondary onPress={onDecline} /><Text style={ui.muted}>{resolved}/{game.turns.length} lépés lezárva</Text>
 {level}{navigation}</ScreenShell>;
}
