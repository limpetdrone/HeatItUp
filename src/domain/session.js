import { metadata, eligibleAssignments, chooseAssignment, bodyParts } from './assignments';
import { normalizeProfile } from './profiles';
import { validateSettings } from './validation';
import { pickTwist } from './twists';
const clone = value => JSON.parse(JSON.stringify(value));
const failure = error => ({
  ok: false,
  error
});
const playerFor = (s, turn) => s.roster.find(p => p.id === turn.playerId);
export const currentTurn = s => s.turns.find(t => t.status === 'open');
export const activeCount = s => s.roster.filter(p => p.status === 'active').length;
function eligible(s, cards) {
  const turn=currentTurn(s);
  return cards.filter(c=>(!s.cardKind||c.kind===s.cardKind)&&eligibleAssignments(s,c,turn?.playerId).length);
}
function draw(s, cards, rng) {
  const pool = eligible(s, cards);
  if (!pool.length) return {
    ...s,
    phase: 'waiting',
    waitReason: 'no_cards',
    currentCardId: null
  };
  const usage=c=>(s.history||[]).filter(h=>h.familyId===(c.familyId||c.id)).length;
  const lowest=Math.min(...pool.map(usage));const freshPool=pool.filter(c=>usage(c)===lowest);
  let deck = s.remainingCardIds.filter(id => freshPool.some(c => c.id === id));
  if (!deck.length) {
    deck = freshPool.map(c => c.id);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (deck.length > 1 && deck[0] === s.currentCardId) [deck[0], deck[1]] = [deck[1], deck[0]];
  }
  const activeCount = s.roster.filter(p => p.status === 'active').length;
  deck=deck.map(id=>{
    const card=pool.find(c=>c.id===id);
    const choices=eligibleAssignments(s,card,currentTurn(s).playerId);
    const minScore=choices.length?Math.min(...choices.map(choice=>choice.score)):0;
    let weight=minScore*.3+rng();
    if(s.settings.maxIntensity===5&&s.settings.options?.parallel){
      if(activeCount>=4){
        if(choices.some(c=>c.groups.length>1))weight-=100;
        else if(card.minPlayers>=3||(card.interaction?.partnerCount&&card.interaction.partnerCount>=2))weight-=80;
      }else if(activeCount===3){
        if(card.minPlayers>=3||(card.interaction?.partnerCount&&card.interaction.partnerCount>=2))weight-=100;
      }
    }
    return {id,weight};
  }).sort((a,b)=>a.weight-b.weight).map(entry=>entry.id);
  const card=pool.find(c=>c.id===deck[0]);
  const choices=eligibleAssignments(s,card,currentTurn(s).playerId);
  const assignment=chooseAssignment(choices,rng);
  const otherRemaining=(s.remainingCardIds||[]).filter(id=>!freshPool.some(c=>c.id===id));
  const next={...s,phase:'playing',waitReason:null,currentCardId:card.id,remainingCardIds:[...otherRemaining,...deck.slice(1)],cardRevision:s.cardRevision+1};
  const turn=currentTurn(next);const m=metadata(card);
  const wheelOptions=[...choices].sort((a,b)=>a.score-b.score).slice(0,8);
  turn.assignment={...assignment,wheelOptions,partnerPending:Boolean(s.settings.options?.partnerWheel&&m.partnerCount>0&&card.kind==='challenge'),bodyPending:Boolean(s.settings.options?.bodyWheel!==false&&m.bodyParts),bodyPartId:m.bodyParts&&s.settings.options?.bodyWheel===false?bodyParts.filter(p=>p.level<=s.settings.maxIntensity)[Math.floor(rng()*bodyParts.filter(p=>p.level<=s.settings.maxIntensity).length)].id:null,answeredIds:[]};
  turn.cardId=card.id;turn.durationSeconds=assignment.groups.length>1?(m.parallelDurationSeconds||m.durationSeconds):m.durationSeconds;
  turn.timer=null;
  // A card family already played in this game returns with a twist instead of verbatim.
  const usedTwistIds=s.turns.map(t=>t.twistId).filter(Boolean);
  turn.twistId=usage(card)>0?pickTwist(card.kind,usedTwistIds,rng):null;
  if(!turn.assignment.partnerPending&&!turn.assignment.bodyPending)recordOffer(next,card);
  return next;
}
function advance(s, cards, rng) {
  const open = currentTurn(s);
  if (open) {
    if (s.phase === 'choosing') return s;
    const existing=cards.find(c=>c.id===s.currentCardId);
    const withoutCurrent={...s,history:(s.history||[]).filter(h=>h.revision!==s.cardRevision||h.turnId!==open.id)};
    if(existing&&eligibleAssignments(withoutCurrent,existing,open.playerId).length&&(!open.assignment||open.assignment.playerIds.every(id=>s.roster.some(p=>p.id===id&&p.status==='active'))))return s;
    return draw(s,cards,rng);
  }
  let pending = s.turns.filter(t => t.status === 'pending');
  if (!pending.length) {
    if (s.roster.every(p => p.status === 'removed')) return {
      ...s,
      phase: 'finished',
      currentCardId: null,
      waitReason: null,
      endReason: 'no_players'
    };
    const lastRound = s.turns.length ? Math.max(...s.turns.map(t => t.round)) : 0;
    const activeRoster = s.roster.filter(p => p.status === 'active');
    if (s.settings.openEnded && activeRoster.length > 0) {
      const nextTurns = activeRoster.map(p => ({
        id: `${lastRound + 1}:${p.id}`,
        round: lastRound + 1,
        playerId: p.id,
        status: 'pending',
        omittedReason: null
      }));
      s = {
        ...s,
        settings: {
          ...s.settings,
          rounds: lastRound + 1
        },
        turns: [...s.turns, ...nextTurns]
      };
      pending = nextTurns;
    } else {
      return {
        ...s,
        phase: 'finished',
        currentCardId: null,
        waitReason: null,
        endReason: 'rounds'
      };
    }
  }
  if (!pending.some(t => playerFor(s, t).status === 'active')) return {
    ...s,
    phase: 'waiting',
    waitReason: 'no_active_turns',
    currentCardId: null
  };
  for (let i = 0; i < s.turns.length; i++) {
    const t = s.turns[i];
    if (t.status !== 'pending') continue;
    const status = playerFor(s, t).status;
    if (status !== 'active') {
      t.status = 'omitted';
      t.omittedReason = status === 'paused' ? 'paused' : 'removed';
      continue;
    }
    t.status = 'open';
    s.cursor = i;
    return {
      ...s,
      currentCardId: null,
      cardKind: null,
      phase: 'choosing',
      waitReason: null
    };
  }
  return s;
}
/** Create IDs in the application layer; this motor only works on snapshots. */
export function startSession(id, input, roster, cards, sourcePresetId = null, rng = Math.random) {
  const valid = validateSettings({
    ...input,
    players: roster.map(p => p.name),
    profiles: roster
  });
  if (!valid.ok) return failure(valid.errors.join(' '));
  if (!id || new Set(roster.map(p => p.id)).size !== roster.length || roster.some(p => !p.id)) return failure('Hibás játékosazonosító.');
  const players = roster.map((p, i) => ({
    ...normalizeProfile(p),
    sourceMemberId: p.sourceMemberId || null,
    name: valid.settings.players[i],
    status: 'active'
  }));
  const initialRounds = input.rounds || 50;
  const turns = Array.from({
    length: initialRounds
  }, (_, r) => players.map(p => ({
    id: `${r + 1}:${p.id}`,
    round: r + 1,
    playerId: p.id,
    status: 'pending',
    omittedReason: null
  }))).flat();
  const levelCards = (cards || []).filter(c => c.intensity === input.maxIntensity).map(c => c.id);
  for (let i = levelCards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [levelCards[i], levelCards[j]] = [levelCards[j], levelCards[i]];
  }
  const allMales = players.length >= 2 && players.every(p => p.gender === 'male');
  const sessionOptions = clone(input.options || {});
  if (allMales && sessionOptions.activities && sessionOptions.activities.maleSameGender !== false) {
    sessionOptions.activities.maleSameGender = true;
  }
  const session = {
    schemaVersion: 3,
    id,
    sourcePresetId,
    roster: players,
    settings: {
      maxIntensity: input.maxIntensity,
      rounds: initialRounds,
      openEnded: input.openEnded !== undefined ? Boolean(input.openEnded) : (input.rounds === undefined),
      music: clone(input.music || {}),
      options: sessionOptions
    },
    turns,
    cursor: 0,
    currentCardId: null,
    cardRevision: 0,
    cardKind: null,
    history: [],
    remainingCardIds: levelCards,
    phase: 'playing',
    waitReason: null,
    endReason: null
  };
  return {
    ok: true,
    session: advance(session, cards, rng)
  };
}
export function chooseCardKind(session, event, cards, rng = Math.random) {
  const turn = currentTurn(session);
  if (!turn || event.turnId !== turn.id || !['question', 'challenge'].includes(event.kind)) return failure('Hibás lépés.');
  if (session.phase !== 'choosing' && !(session.phase === 'waiting' && session.waitReason === 'no_cards')) return {
    ok: true,
    session
  };
  const next = clone(session);
  next.cardKind = event.kind;
  return {
    ok: true,
    session: draw(next, cards, rng)
  };
}
export function resolveTurn(session, event, cards, rng = Math.random) {
  const turn = currentTurn(session);
  if (session.phase !== 'playing' || !turn || event.turnId !== turn.id || event.cardRevision !== session.cardRevision) return {
    ok: true,
    session
  };
  if (event.outcome==='completed' && (turn.assignment?.partnerPending||turn.assignment?.bodyPending||turn.assignment?.responders?.length>1&&turn.assignment.responders.some(id=>!turn.assignment.answeredIds.includes(id)))) return failure('Előbb fejezd be a kijelölést és a válaszokat.');
  if (!['completed', 'passed'].includes(event.outcome)) return failure('Hibás lépés.');
  const next = clone(session);
  currentTurn(next).status = event.outcome;
  next.history=(next.history||[]).map(h=>h.turnId===turn.id&&h.revision===session.cardRevision?{...h,status:event.outcome}:h);
  if(event.outcome==='completed'){const card=cards.find(c=>c.id===session.currentCardId);const m=card?metadata(card):{};if(m.clothingType&&next.settings.options?.trackWardrobe)for(const group of turn.assignment?.groups||[]){const p=next.roster.find(p=>p.id===group.actorId);const item=p.wardrobe.find(x=>x.worn&&(m.clothingType==='any'||x.type===m.clothingType));if(item)item.worn=false;}}

  return {
    ok: true,
    session: (()=>{const advanced=advance(next,cards,rng);const round=currentTurn(advanced)?.round;const since=(round&&turn.round)?(turn.round-(advanced.lastLevelChangeRound||0)):0;if(round>turn.round&&since>0&&since%4===0&&advanced.settings.maxIntensity<5){advanced.levelSuggestion=advanced.settings.maxIntensity+1;advanced.lastLevelChangeRound=turn.round;}return advanced;})()
  };
}
export function changePlayerStatus(session, id, status, cards, rng = Math.random) {
  const player = session.roster.find(p => p.id === id);
  if (!player || session.phase === 'finished' || player.status === 'removed' || !['active', 'paused', 'removed'].includes(status)) return failure('Ez a játékosállapot nem módosítható.');
  const next = clone(session);
  next.roster.find(p => p.id === id).status = status;
  next.remainingCardIds = []; // Eligibility changed; rebuild the deck against active players.
  for (const turn of next.turns) {
    if (turn.playerId === id && (turn.status === 'open' && status !== 'active' || turn.status === 'pending' && status === 'removed')) {
      turn.status = 'omitted';
      turn.omittedReason = status === 'paused' ? 'paused' : 'removed';
    }
  }
  return {
    ok: true,
    session: advance(next, cards, rng)
  };
}
export function stopSession(s) {
  return {
    ...s,
    phase: 'finished',
    currentCardId: null,
    waitReason: null,
    endReason: s.endReason || 'stopped'
  };
}
export function getSessionSummary(s) {
  const count = status => s.turns.filter(t => t.status === status).length;
  return {
    completed: count('completed'),
    passed: count('passed'),
    omitted: count('omitted'),
    remaining: count('pending') + count('open'),
    total: s.turns.length
  };
}
export function isValidSession(s, cards) {
  if (!s || s.schemaVersion !== 3 || !Array.isArray(s.roster) || !Array.isArray(s.turns) || !Array.isArray(s.remainingCardIds)) return false;
  const valid = validateSettings({
    ...s.settings,
    players: s.roster.map(p => p.name),
    profiles: s.roster
  });
  if (!valid.ok || !s.id || new Set(s.roster.map(p => p.id)).size !== s.roster.length || !['playing', 'choosing', 'waiting', 'finished'].includes(s.phase)) return false;
  if (s.roster.some(p => !p.id || !['active', 'paused', 'removed'].includes(p.status))) return false;
  const expected = Array.from({
    length: s.settings.rounds
  }, (_, r) => s.roster.map(p => `${r + 1}:${p.id}`)).flat();
  if (s.turns.length !== expected.length || s.turns.some((t, i) => t.id !== expected[i] || t.round !== Math.floor(i / s.roster.length) + 1 || t.playerId !== s.roster[i % s.roster.length].id || !['pending', 'open', 'completed', 'passed', 'omitted'].includes(t.status))) return false;
  const open = s.turns.filter(t => t.status === 'open');
  if (open.length > 1 || s.remainingCardIds.some(id => !cards.some(c => c.id === id))) return false;
  if (s.phase === 'choosing' && (open.length !== 1 || s.currentCardId !== null || playerFor(s, open[0]).status !== 'active')) return false;
  if (s.phase === 'playing' && (open.length !== 1 || s.turns[s.cursor] !== open[0] || playerFor(s, open[0]).status !== 'active' || !cards.some(c=>c.id===s.currentCardId&&c.intensity===s.settings.maxIntensity&&c.minPlayers<=activeCount(s)))) return false;
  return Number.isInteger(s.cardRevision) && s.cardRevision >= 0;
}

function recordOffer(s,card){
 const turn=currentTurn(s);if(!turn||!turn.assignment)return;
 const history={turnId:turn.id,revision:s.cardRevision,cardId:card.id,familyId:card.familyId||card.id,playerIds:turn.assignment.playerIds,groups:turn.assignment.groups,category:metadata(card).category,status:'offered'};
 s.history=[...(s.history||[]).filter(h=>h.turnId!==turn.id||h.revision!==s.cardRevision),history];
}
export function spinAssignment(session,part,cards,rng=Math.random,selectedIndex=null){
 const next=clone(session), turn=currentTurn(next), card=cards.find(c=>c.id===next.currentCardId);
 if(!turn||!card||next.phase!=='playing')return failure('Hibás lépés.');
 if(part==='partner'&&turn.assignment?.partnerPending){const legal=eligibleAssignments({...next,history:(next.history||[]).filter(h=>h.turnId!==turn.id||h.revision!==next.cardRevision)},card,turn.playerId);const option=Number.isInteger(selectedIndex)?turn.assignment.wheelOptions?.[selectedIndex]:null;const selected=option&&legal.some(c=>JSON.stringify(c.groups)===JSON.stringify(option.groups))?option:chooseAssignment(legal,rng);if(!selected)return failure('Nincs megfelelő párosítás.');turn.assignment={...selected,partnerPending:false,bodyPending:turn.assignment.bodyPending,bodyPartId:turn.assignment.bodyPartId,answeredIds:[]};}
 else if(part==='body'&&turn.assignment?.bodyPending&&!turn.assignment.partnerPending){const pool=bodyParts.filter(p=>p.level<=next.settings.maxIntensity);turn.assignment.bodyPartId=pool[Number.isInteger(selectedIndex)&&selectedIndex>=0&&selectedIndex<pool.length?selectedIndex:Math.floor(rng()*pool.length)].id;turn.assignment.bodyPending=false;}
 else return {ok:true,session};
 if(!turn.assignment.partnerPending&&!turn.assignment.bodyPending)recordOffer(next,card);
 return {ok:true,session:next};
}
export function setAnswered(session,id){const next=clone(session),turn=currentTurn(next);if(!turn?.assignment?.responders.includes(id))return failure('Hibás játékosazonosító.');const list=turn.assignment.answeredIds;turn.assignment.answeredIds=list.includes(id)?list.filter(x=>x!==id):[...list,id];return {ok:true,session:next};}
export function changeLevel(session,level,cards,rng=Math.random){if(![1,2,3,4,5].includes(level)||session.phase==='finished')return failure('Hibás lépés.');const next=clone(session);next.settings.maxIntensity=level;next.levelSuggestion=null;next.cardKind=null;next.currentCardId=null;const levelCards=(cards||[]).filter(c=>c.intensity===level).map(c=>c.id);for(let i=levelCards.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[levelCards[i],levelCards[j]]=[levelCards[j],levelCards[i]];}next.remainingCardIds=levelCards;const turn=currentTurn(next);if(turn){next.lastLevelChangeRound=turn.round-1;delete turn.assignment;turn.timer=null;next.phase='choosing';}return {ok:true,session:advance(next,cards,rng)};}
export function updateWardrobe(session,id,wardrobe,cards){const next=clone(session),p=next.roster.find(p=>p.id===id);if(!p)return failure('Hibás játékosazonosító.');p.wardrobe=clone(wardrobe);return {ok:true,session:cards&&next.phase!=='finished'?advance(next,cards,Math.random):next};}
export function timerAction(session,event){const next=clone(session),turn=currentTurn(next);if(!turn||turn.id!==event.turnId||next.cardRevision!==event.revision)return {ok:true,session};const now=event.now;if(!Number.isFinite(now))return failure('Hibás lépés.');const duration=(turn.durationSeconds||0)*1000;if(!duration)return {ok:true,session};
 if(event.action==='start'||event.action==='reset')turn.timer={remainingMs:duration,deadline:event.action==='start'?now+duration:null,notified:false};
 else if(turn.timer&&event.action==='pause')turn.timer={...turn.timer,remainingMs:Math.max(0,(turn.timer.deadline??now+turn.timer.remainingMs)-now),deadline:null};
 else if(turn.timer&&event.action==='resume')turn.timer={...turn.timer,deadline:now+turn.timer.remainingMs};
 else if(turn.timer&&event.action==='notify'&&turn.timer.deadline!==null&&turn.timer.deadline<=now)turn.timer={remainingMs:0,deadline:null,notified:true};
 return {ok:true,session:next};
}

export function migrateSession(saved,cards){
 if(!saved)return null;if(![2,3].includes(saved.schemaVersion))return null;
 const next=clone(saved);next.schemaVersion=3;next.roster=next.roster.map(p=>({...p,...normalizeProfile(p)}));next.history=next.history||[];
 const turn=currentTurn(next);const card=cards.find(c=>c.id===next.currentCardId);
 if(next.phase==='playing'&&turn&&(!turn.assignment||!card||card.intensity!==next.settings.maxIntensity)){if(card)next.history.push({turnId:turn.id,revision:next.cardRevision,cardId:card.id,familyId:card.familyId||card.id,playerIds:[turn.playerId],groups:[],category:'general',status:'offered'});next.phase='choosing';next.currentCardId=null;next.cardKind=null;delete turn.assignment;turn.timer=null;}
 return isValidSession(next,cards)?next:null;
}
