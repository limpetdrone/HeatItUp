import { test,expect } from '@jest/globals';
import { normalizeProfile,pairProfiles } from './profiles';
import { assignmentChoices } from './assignments';
import { startSession,currentTurn,chooseCardKind,resolveTurn,spinAssignment,setAnswered,timerAction,changeLevel } from './session';
import { applyDecline,updatePresetPreferences } from './decline';
import { validateContent } from './content';
const roster=n=>Array.from({length:n},(_,i)=>normalizeProfile({id:String(i),name:`P${i}`}));
const card={id:'task',text:'Test {actor}',kind:'challenge',intensity:1,minPlayers:2,interaction:{category:'general',partnerCount:1,parallelSafe:true,bodyParts:true,durationSeconds:60,parallelDurationSeconds:180}};
const start=(options={},list=roster(4),deck=[card])=>startSession('s',{rounds:5,maxIntensity:1,options},list,deck,null,()=>.99).session;
const choose=(s,deck=[card],kind='challenge')=>chooseCardKind(s,{turnId:currentTurn(s).id,kind},deck,()=>.99).session;
const event=s=>({turnId:currentTurn(s).id,cardRevision:s.cardRevision,outcome:'completed'});
test('parallel assignments maximize participation with disjoint, eligible groups',()=>{
 let people=pairProfiles(roster(6),'0','1');const s=start({parallel:true,bodyWheel:false},people);const choices=assignmentChoices(s,card,'0');
 expect(choices.length).toBeGreaterThan(0);for(const option of choices){expect(option.playerIds).toHaveLength(6);expect(new Set(option.playerIds).size).toBe(6);}
 const game=choose(s);expect(currentTurn(game).assignment.groups).toHaveLength(3);expect(currentTurn(game).durationSeconds).toBe(180);
});
test('partner and body wheels use legal persisted choices, completion is blocked until resolved',()=>{
 let s=choose(start({partnerWheel:true,bodyWheel:true}));expect(resolveTurn(s,event(s),[card]).ok).toBe(false);
 s=spinAssignment(s,'partner',[card],()=>0,0).session;expect(currentTurn(s).assignment.partnerPending).toBe(false);
 s=spinAssignment(s,'body',[card],()=>0,0).session;expect(currentTurn(s).assignment.bodyPartId).toBe('hand');expect(s.history).toHaveLength(1);
 expect(resolveTurn(s,event(s),[card]).ok).toBe(true);
});
test('everyone answers question; each checkbox is required',()=>{
 const q={...card,id:'q',kind:'question',interaction:{}};let s=choose(start({questionsForAll:true},roster(3),[q]),[q],'question');expect(resolveTurn(s,event(s),[q]).ok).toBe(false);
 for(const p of s.roster)s=setAnswered(s,p.id).session;expect(resolveTurn(s,event(s),[q]).ok).toBe(true);
});
test('timer pause/resume restores wall-clock remaining time and ignores stale turn events',()=>{
 let s=choose(start({bodyWheel:false}));const timer=(action,now)=>{s=timerAction(s,{action,now,turnId:currentTurn(s).id,revision:s.cardRevision}).session;};
 timer('start',1000);expect(currentTurn(s).timer.deadline).toBe(61000);timer('pause',11000);expect(currentTurn(s).timer.remainingMs).toBe(50000);timer('resume',21000);expect(currentTurn(s).timer.deadline).toBe(71000);timer('notify',71000);expect(currentTurn(s).timer.notified).toBe(true);
 expect(timerAction(s,{action:'start',now:0,turnId:'old',revision:1}).session).toBe(s);
});
test('decline changes only the requested role; optional preset update maps session IDs',()=>{
 const people=roster(2).map((p,i)=>({...p,sourceMemberId:`m${i}`}));const activity={...card,interaction:{category:'oral',partnerCount:1,bodyParts:false}};
 let s=choose(start({},people,[activity]),[activity]);const changed=applyDecline(s,activity,{playerId:'0',scope:'activityPartner',partnerId:'1'});expect(changed.ok).toBe(true);
 expect(changed.session.roster[0].preferences.activities.oral.giveBlockedIds).toEqual(['1']);expect(s.roster[0].preferences.activities.oral.giveBlockedIds).toEqual([]);
 const preset={id:'p',name:'Group',members:people.map((p,i)=>({...p,id:`m${i}`}))};const updated=updatePresetPreferences(preset,changed.session,'0');expect(updated.preset.members[0].preferences.activities.oral.giveBlockedIds).toEqual(['m1']);expect(preset.members[0].preferences.activities.oral.giveBlockedIds).toEqual([]);
});
test('clothing is removed only on completion and no unavailable garment can be offered twice',()=>{
 const people=roster(2);people[0].wardrobe=[{id:'shirt0',type:'shirt',worn:true}];people[1].wardrobe=[];const clothing={...card,interaction:{category:'general',partnerCount:0,clothingType:'shirt'}};
 let s=choose(start({trackWardrobe:true,bodyWheel:false},people,[clothing]),[clothing]);const next=resolveTurn(s,event(s),[clothing]).session;expect(next.roster[0].wardrobe[0].worn).toBe(false);expect(s.roster[0].wardrobe[0].worn).toBe(true);
});
test('undressing cards stay available without wardrobe tracking and leave the wardrobe untouched',()=>{
 const people=roster(2);people[0].wardrobe=[{id:'shirt0',type:'shirt',worn:true}];const clothing={...card,interaction:{category:'general',partnerCount:0,clothingType:'shirt'}};
 const s=choose(start({trackWardrobe:false,bodyWheel:false},people,[clothing]),[clothing]);expect(s.phase).toBe('playing');
 expect(resolveTurn(s,event(s),[clothing]).session.roster[0].wardrobe[0].worn).toBe(true);
});
test('level changes preserve the turn; exhausted content does not repeat for a player',()=>{
 const solo={...card,interaction:{partnerCount:0,bodyParts:false}};let s=choose(start({bodyWheel:false},roster(2),[solo]),[solo]);const first=currentTurn(s).id;
 const level=changeLevel(s,5,[solo]).session;expect(currentTurn(level).id).toBe(first);expect(level.phase).toBe('choosing');expect(choose(level,[solo]).phase).toBe('waiting');
 for(let i=0;i<2;i++){s=resolveTurn(s,event(s),[solo]).session;if(s.phase==='choosing')s=choose(s,[solo]);}expect(s.phase).toBe('waiting');
});
test('three-language content import validates identifiers and timing',()=>{
 const raw={schemaVersion:1,cards:[{id:'custom',kind:'challenge',intensity:5,minPlayers:2,participantCount:2,durationSeconds:120,text:{en:'Test',hu:'Teszt',de:'Test'}}]};
 expect(validateContent(raw).ok).toBe(true);expect(validateContent(raw,['custom']).ok).toBe(false);expect(validateContent({...raw,cards:[{...raw.cards[0],durationSeconds:999}]}).ok).toBe(false);
});

test('four completed rounds suggest a higher level without automatically changing it',()=>{
 const deck=Array.from({length:30},(_,i)=>({...card,id:`q${i}`,familyId:`q${i}`,kind:'question',interaction:{}}));let s=start({},roster(2),deck);
 for(let i=0;i<8;i++){s=choose(s,deck,'question');s=resolveTurn(s,event(s),deck).session;}
 expect(currentTurn(s).round).toBe(5);expect(s.levelSuggestion).toBe(2);expect(s.settings.maxIntensity).toBe(1);
});
test('manual level change resets the 4-round level suggestion counter',()=>{
 const deck=Array.from({length:60},(_,i)=>({...card,id:`q${i}`,familyId:`q${i}`,intensity:(i%3)+1,kind:'question',interaction:{}}));let s=startSession('s',{rounds:10,maxIntensity:1,options:{}},roster(2),deck,null,()=>.99).session;
 for(let i=0;i<4;i++){s=choose(s,deck,'question');s=resolveTurn(s,event(s),deck).session;}
 expect(currentTurn(s).round).toBe(3);
 s=changeLevel(s,2,deck).session;
 expect(s.levelSuggestion).toBeNull();
 for(let i=0;i<4;i++){s=choose(s,deck,'question');s=resolveTurn(s,event(s),deck).session;}
 expect(currentTurn(s).round).toBe(5);
 expect(s.levelSuggestion).toBeNull();
 for(let i=0;i<4;i++){s=choose(s,deck,'question');s=resolveTurn(s,event(s),deck).session;}
 expect(currentTurn(s).round).toBe(7);
 expect(s.levelSuggestion).toBe(3);
});
test('multi-giver groups respect exclusions between all members',()=>{
 const people=roster(3);people[1].preferences.blockedIds=['2'];const multi={...card,interaction:{category:'general',role:'receive',partnerCount:2}};
 expect(assignmentChoices(start({},people,[multi]),multi,'0')).toHaveLength(0);
});
test('content cannot duplicate an existing translation or contain invalid effects',()=>{
 const raw={id:'custom',kind:'question',intensity:1,minPlayers:2,text:{en:'Hello',hu:'Szia',de:'Hallo'}};
 expect(validateContent({schemaVersion:1,cards:[raw,{...raw,id:'copy'}]}).ok).toBe(false);
 expect(validateContent({schemaVersion:1,cards:[{...raw,clothingType:'imaginary'}]}).ok).toBe(false);
});
test('a card family repeated in the same game comes back with a twist',()=>{
 const solo={...card,id:'repeat',interaction:{category:'general',partnerCount:0,bodyParts:false}};
 const first=choose(start({bodyWheel:false},roster(2),[solo]),[solo]);
 expect(currentTurn(first).twistId).toBeNull();
 let s=resolveTurn(first,event(first),[solo]).session;s=choose(s,[solo]);
 expect(currentTurn(s).playerId).toBe('1');
 expect(currentTurn(s).twistId).toEqual(expect.any(String));
});

test('level 5 with parallel option prioritizes multi-group splits for 4+ players',()=>{
 const pairCard={id:'pair',familyId:'pair',kind:'challenge',intensity:5,minPlayers:2,text:'Pair task',interaction:{category:'general',partnerCount:1,parallelSafe:false,durationSeconds:30}};
 const parallelCard={id:'par',familyId:'par',kind:'challenge',intensity:5,minPlayers:2,text:'Parallel task',interaction:{category:'general',partnerCount:1,parallelSafe:true,durationSeconds:30}};
 const groupDeck=[pairCard, parallelCard];
 const s=choose(startSession('s',{rounds:5,maxIntensity:5,options:{parallel:true}},roster(4),groupDeck,null,()=>0.5).session, groupDeck);
 expect(currentTurn(s).assignment.groups.length).toBe(2);
 expect(currentTurn(s).assignment.playerIds.length).toBe(4);
});
