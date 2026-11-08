import { normalizeProfile, activityCategories } from './profiles';
export function applyDecline(session,card,{playerId,scope,partnerId,role:requestedRole}) {
 const player=session.roster.find(p=>p.id===playerId&&p.status==='active');
 if(!player||!['once','activity','partnerOnly','activityPartner','allPartner'].includes(scope))return {ok:false,error:'Válassz elutasítási okot.'};
 const category=card.interaction?.category||'general';const turn=session.turns.find(t=>t.status==='open');
 const group=turn?.assignment?.groups.find(g=>g.playerIds.includes(playerId));
 const role=['give','receive'].includes(requestedRole)?requestedRole:group?.receiverIds.includes(playerId)?'receive':'give';
 if(['activity','partnerOnly','activityPartner'].includes(scope)&&!activityCategories.includes(category))return {ok:false,error:'Ehhez a kártyához nincs aktivitáskategória.'};
 if(['activityPartner','allPartner'].includes(scope)&&!session.roster.some(p=>p.id===partnerId&&p.id!==playerId))return {ok:false,error:'Válassz másik játékost.'};
 const next=JSON.parse(JSON.stringify(session));const p=normalizeProfile(player);
 if(scope==='activity')p.preferences.activities[category][role]=false;
 if(scope==='partnerOnly')p.preferences.activities[category][role+'Policy']='partner';
 if(scope==='activityPartner')p.preferences.activities[category][role+'BlockedIds']=[...new Set([...p.preferences.activities[category][role+'BlockedIds'],partnerId])];
 if(scope==='allPartner')p.preferences.blockedIds=[...new Set([...p.preferences.blockedIds,partnerId])];
 next.roster=next.roster.map(other=>other.id===p.id?{...other,...p}:other);
 next.declines=[...(next.declines||[]),{turnId:turn?.id,cardId:card.id,playerId,scope,partnerId:partnerId||null}];
 return {ok:true,session:next,profile:p};
}
export function updatePresetPreferences(preset,session,playerId) {
 const player=session.roster.find(p=>p.id===playerId);const member=preset?.members.find(m=>m.id===player?.sourceMemberId);
 if(!member)return {ok:false,error:'Ez a személy már nem található a presetben.'};
 const ids=new Map(session.roster.filter(p=>preset.members.some(m=>m.id===p.sourceMemberId)).map(p=>[p.id,p.sourceMemberId]));
 const p=normalizeProfile(player);const mapList=list=>list.map(id=>ids.get(id)).filter(Boolean);
 const preferences={...p.preferences,blockedIds:mapList(p.preferences.blockedIds),activities:Object.fromEntries(Object.entries(p.preferences.activities).map(([key,r])=>[key,{...r,giveIds:mapList(r.giveIds),receiveIds:mapList(r.receiveIds),giveBlockedIds:mapList(r.giveBlockedIds),receiveBlockedIds:mapList(r.receiveBlockedIds)}]))};
 return {ok:true,preset:{...preset,members:preset.members.map(m=>m.id===member.id?{...m,preferences}:m)}};
}
