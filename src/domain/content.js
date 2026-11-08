export function validateContent(envelope, reservedIds = [], reservedCards = []) {
 const errors=[];
 if(!envelope||envelope.schemaVersion!==1||!Array.isArray(envelope.cards)||envelope.cards.length>1000)return {ok:false,error:'Érvénytelen tartalomfájl.'};
 const seen=new Set(reservedIds);const cards=[];
 const fingerprint=(text,language)=>language+':'+text.trim().normalize('NFC').toLowerCase().replace(/[\s.!?,;:…“”„"'’-]+/g,' ');
 const texts=new Set(reservedCards.flatMap(card=>['en','hu','de'].map(language=>fingerprint(card.translations?.[language]||card.text,language))));
 for(const raw of envelope.cards){
  if(!raw||typeof raw.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(raw.id)||seen.has(raw.id)){errors.push('A kártyaazonosítók legyenek egyediek.');continue;}seen.add(raw.id);
  if(!['question','challenge'].includes(raw.kind)||![1,2,3,4,5].includes(raw.intensity)||!Number.isInteger(raw.minPlayers)||raw.minPlayers<2||raw.minPlayers>8){errors.push(raw.id+': '+ 'Érvénytelen kártyaadatok.');continue;}
  if(!raw.text||['en','hu','de'].some(language=>typeof raw.text[language]!=='string'||!raw.text[language].trim()||Array.from(raw.text[language]).length>300)){errors.push(raw.id+': '+ 'Mindhárom nyelv szövege szükséges.');continue;}
  const keys=['en','hu','de'].map(language=>fingerprint(raw.text[language],language));if(keys.some(key=>texts.has(key))){errors.push('Azonos kártyaszöveg már szerepel.');continue;}keys.forEach(key=>texts.add(key));
  if(['parallelSafe','bodyParts'].some(key=>raw[key]!==undefined&&typeof raw[key]!=='boolean')){errors.push('Érvénytelen kártyaadatok.');continue;}
  const count=raw.participantCount??1;const duration=raw.durationSeconds??0;const parallelDuration=raw.parallelDurationSeconds??duration;
  if(raw.clothingType&&!['any','shirt','trousers','skirt','dress','bra','underwear','socks','shoes','other'].includes(raw.clothingType)||raw.fetishId&&!['blindfold','roleplay','feet'].includes(raw.fetishId)){errors.push('Érvénytelen kártyaadatok.');continue;}
  const category=raw.category||'general';const role=raw.role||'give';
  if(category!=='general'&&count<2||category==='fetish'&&!raw.fetishId){errors.push('Érvénytelen kártyaadatok.');continue;}
  if(!Number.isInteger(count)||count<1||count>raw.minPlayers||!Number.isInteger(duration)||duration<0||duration>300||!Number.isInteger(parallelDuration)||parallelDuration<0||parallelDuration>300||!['give','receive'].includes(role)||!['general','oral','penetration','anal','fetish'].includes(category)||raw.kind==='question'&&duration!==0){errors.push(raw.id+': '+ 'Érvénytelen kártyaadatok.');continue;}
  if(raw.familyId!==undefined&&(typeof raw.familyId!=='string'||!raw.familyId.trim())){errors.push('Érvénytelen kártyaadatok.');continue;}
  cards.push({id:raw.id,familyId:raw.familyId||raw.id,kind:raw.kind,intensity:raw.intensity,minPlayers:raw.minPlayers,text:raw.text.hu,translations:{...raw.text},interaction:{category,role,partnerCount:count-1,durationSeconds:duration,parallelDurationSeconds:parallelDuration,parallelSafe:raw.parallelSafe===true,bodyParts:raw.bodyParts===true,...(raw.clothingType?{clothingType:raw.clothingType}:{}),...(raw.fetishId?{fetishId:raw.fetishId}:{})}});
 }
 return errors.length?{ok:false,error:[...new Set(errors)].slice(0,8).join('\n')}:{ok:true,cards};
}
