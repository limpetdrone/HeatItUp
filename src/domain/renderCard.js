export function renderCard(template,group,roster,bodyPart='') {
 const name=id=>roster.find(p=>p.id===id)?.name||'';
 const values={actor:name(group?.actorId),givers:(group?.giverIds||[]).map(name).join(', '),receivers:(group?.receiverIds||[]).map(name).join(', '),bodyPart};
 return template.replace(/\{(actor|givers|receivers|bodyPart)\}/g,(_,key)=>values[key]);
}
