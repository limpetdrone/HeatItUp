import { canInteract } from './profiles';
export const bodyParts = [
 {id:'hand',level:1,label:'Kéz'},{id:'arm',level:1,label:'Kar'},{id:'cheek',level:1,label:'Arc'},
 {id:'shoulder',level:2,label:'Váll'},{id:'neck',level:2,label:'Nyak'},{id:'back',level:2,label:'Hát'},
 {id:'abdomen',level:3,label:'Has'},{id:'thigh',level:3,label:'Comb'},{id:'foot',level:3,label:'Lábfej'},
 {id:'chest',level:4,label:'Mellkas'},{id:'buttocks',level:4,label:'Fenék'},
 {id:'genitals',level:5,label:'Intim zóna'}
];
export function metadata(card) {
 return {category:'general',role:'give',partnerCount:card.minPlayers>1?1:0,parallelSafe:false,bodyParts:false,durationSeconds:0,...card.interaction};
}
export function hasSeen(session, playerId, card) {
 return (session.history||[]).some(h=>h.playerIds.includes(playerId)&&h.familyId===(card.familyId||card.id));
}
const active = session=>session.roster.filter(p=>p.status==='active');
function combinations(list,count){if(count===0)return [[]];if(list.length<count)return [];return list.flatMap((p,i)=>combinations(list.slice(i+1),count-1).map(rest=>[p,...rest]));}
function groupFor(session, card, actor, others) {
 const m=metadata(card);const group=m.role==='receive'?{giverIds:others.map(p=>p.id),receiverIds:[actor.id]}:{giverIds:[actor.id],receiverIds:others.map(p=>p.id)};
 const all=[actor,...others];
 if(all.some(p=>hasSeen(session,p.id,card)))return null;
 if(all.some(p=>all.some(other=>other.id!==p.id&&(p.preferences?.blockedIds||[]).includes(other.id))))return null;
 if(group.giverIds.some(id=>group.receiverIds.some(target=>!canInteract(session.roster.find(p=>p.id===id),session.roster.find(p=>p.id===target),m.category,{...session.settings.options,activities:session.settings.options?.activities},m.fetishId))))return null;
 // Without wardrobe tracking, undressing cards are still offered; the app just cannot check what is worn.
 if(m.clothingType && session.settings.options?.trackWardrobe && !actor.wardrobe?.some(item=>item.worn&&(m.clothingType==='any'||item.type===m.clothingType)))return null;
 return {...group,actorId:actor.id,playerIds:all.map(p=>p.id)};
}
function scoreGroup(session, group, category='general') {
 let score=0;
 const completed=(session.history||[]).filter(h=>h.status==='completed');
 for(const giver of group.giverIds)for(const receiver of group.receiverIds){
  score+=completed.reduce((n,h)=>n+(h.groups||[]).filter(g=>g.giverIds.includes(giver)&&g.receiverIds.includes(receiver)||g.giverIds.includes(receiver)&&g.receiverIds.includes(giver)).length*(h.category===category?8:6),0);
  if(session.roster.find(p=>p.id===giver)?.partnerId===receiver)score+=2;
 }
 for(const id of group.playerIds){const gives=completed.reduce((n,h)=>n+(h.groups||[]).filter(g=>g.receiverIds.length&&g.giverIds.includes(id)).length,0);const receives=completed.reduce((n,h)=>n+(h.groups||[]).filter(g=>g.receiverIds.includes(id)).length,0);score+=Math.max(0,group.giverIds.includes(id)?gives-receives:receives-gives);}
 return score;
}
function groupsFor(session,card,actor,pool) { return combinations(pool.filter(p=>p.id!==actor.id),metadata(card).partnerCount).map(list=>groupFor(session,card,actor,list)).filter(Boolean); }
function coverRest(session,card,pool) {
 if(pool.length<metadata(card).partnerCount+1)return {groups:[],covered:0,score:0};
 const first=pool[0];let best=coverRest(session,card,pool.slice(1));
 for(const group of groupsFor(session,card,first,pool)){
  const rest=coverRest(session,card,pool.filter(p=>!group.playerIds.includes(p.id)));
  const option={groups:[group,...rest.groups],covered:group.playerIds.length+rest.covered,score:scoreGroup(session,group,metadata(card).category)+rest.score};
  if(option.covered>best.covered||option.covered===best.covered&&option.score<best.score)best=option;
 }
 return best;
}
export function assignmentChoices(session,card,actorId) {
 const pool=active(session), actor=pool.find(p=>p.id===actorId);if(!actor)return [];
 const m=metadata(card);
 if(card.kind==='question'){
  if(m.category!=='general' && session.settings.options?.activities?.[m.category]===false)return [];

  const responders=session.settings.options?.questionsForAll?pool:[actor];
  if(responders.some(p=>hasSeen(session,p.id,card)||m.category!=='general'&&p.preferences?.activities?.[m.category]?.[m.role=== 'receive'?'receive':'give']===false))return [];
  return [{groups:[],playerIds:responders.map(p=>p.id),responders:responders.map(p=>p.id),score:0}];
 }
 return groupsFor(session,card,actor,pool).map(group=>{
  const rest=session.settings.options?.parallel&&m.parallelSafe?coverRest(session,card,pool.filter(p=>!group.playerIds.includes(p.id))):{groups:[],covered:0,score:0};
  const groups=[group,...rest.groups];return {groups,playerIds:groups.flatMap(g=>g.playerIds),responders:[],score:scoreGroup(session,group,metadata(card).category)+rest.score};
 }).filter((option,_,all)=>option.playerIds.length===Math.max(...all.map(x=>x.playerIds.length)));
}
export function chooseAssignment(choices,rng=Math.random){
 if(!choices.length)return null;const weights=choices.map(c=>1/(1+c.score));let pick=rng()*weights.reduce((a,b)=>a+b,0);
 return choices.find((_,i)=>(pick-=weights[i])<0)||choices[choices.length-1];
}
export function eligibleAssignments(session,card,actorId){
 if(typeof card.text!=='string'||!card.text.trim()||card.intensity!==session.settings.maxIntensity||card.minPlayers>active(session).length)return [];
 return assignmentChoices(session,card,actorId);
}
