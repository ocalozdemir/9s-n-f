export function evaluate(questions,answers){
  const groups=new Map();let correct=0,wrong=0,blank=0;
  const rows=questions.map(q=>{
    const answer=answers[q.id];const status=answer===undefined||answer===null?'blank':answer===q.answer?'correct':'wrong';
    if(status==='correct')correct++;else if(status==='wrong')wrong++;else blank++;
    const key=q.topic+'|'+q.outcome;
    if(!groups.has(key))groups.set(key,{topic:q.topic,outcome:q.outcome,unit:q.unit,total:0,correct:0,wrong:0,blank:0,sourceId:q.sourceId,pages:[],references:[]});
    const g=groups.get(key);g.total++;g[status]++;if(q.page&&!g.pages.includes(q.page))g.pages.push(q.page);
    let ref=g.references.find(r=>r.sourceId===q.sourceId);if(!ref){ref={sourceId:q.sourceId,pages:[]};g.references.push(ref);}if(!ref.pages.includes(q.page))ref.pages.push(q.page);
    return {...q,givenAnswer:answer??null,status};
  });
  const topics=[...groups.values()].map(g=>({...g,percent:Math.round(g.correct/g.total*100),assessment:g.total<3?'Daha fazla soru çöz':g.correct/g.total<.6?'Tekrar çalış':g.correct/g.total<.8?'Pekiştir':'Bu testte başarılı'})).sort((a,b)=>a.percent-b.percent);
  return {total:questions.length,correct,wrong,blank,percent:questions.length?Math.round(correct/questions.length*100):0,topics,rows};
}
export function validateBank(bank,curriculum,sources,existing=[]){
  if(!bank||bank.schemaVersion!==1||!Array.isArray(bank.questions))throw Error('Dosya schemaVersion: 1 ve questions listesi içermeli.');
  const ids=new Set(existing.map(q=>q.id));const fingerprints=new Set(existing.map(q=>q.subject+'|'+q.stem.trim().toLocaleLowerCase('tr')));
  const subjectIds=new Set(curriculum.map(s=>s.id));const sourceIds=new Set(sources.map(s=>s.id));
  for(const q of bank.questions){
    for(const field of ['id','subject','unit','topic','outcome','stem','sourceId','explanation'])if(typeof q[field]!=='string'||!q[field].trim())throw Error(`Eksik alan: ${field} (${q.id||'yeni soru'})`);
    if(!subjectIds.has(q.subject))throw Error(`Bilinmeyen ders: ${q.subject}`);
    if(!curriculum.find(s=>s.id===q.subject).units.some(u=>u.id===q.unit))throw Error(`Bilinmeyen ünite: ${q.unit}`);
    const outcomes=curriculum.find(s=>s.id===q.subject).units.find(u=>u.id===q.unit).outcomes;
    if(outcomes?.length&&!outcomes.some(o=>o.code===q.outcome))throw Error(`Üniteye ait olmayan öğrenme çıktısı: ${q.outcome}`);
    if(!sourceIds.has(q.sourceId))throw Error(`Önce kaynağı kaydet: ${q.sourceId}`);
    const source=sources.find(s=>s.id===q.sourceId);
    if(source.subject&&source.subject!==curriculum.find(s=>s.id===q.subject).name)throw Error(`Kaynak ve soru dersi uyuşmuyor: ${q.id}`);
    if(!Number.isInteger(q.page)||q.page<1)throw Error('Kitap sayfası pozitif tam sayı olmalı.');
    if(source.pageCount&&q.page>source.pageCount)throw Error(`Sayfa kitap uzunluğunu aşıyor: ${q.id}`);
    if(!Array.isArray(q.options)||q.options.length<2||q.options.some(o=>typeof o!=='string'||!o.trim()))throw Error(`Seçenekler geçersiz: ${q.id}`);
    if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)throw Error(`Cevap indeksi geçersiz: ${q.id}`);
    if(q.status!=='verified')throw Error(`Yalnızca kontrol edilmiş sorular eklenebilir: ${q.id}`);
    if(ids.has(q.id))throw Error(`Tekrarlanan soru kimliği: ${q.id}`);ids.add(q.id);
    const fingerprint=q.subject+'|'+q.stem.trim().toLocaleLowerCase('tr');if(fingerprints.has(fingerprint))throw Error(`Tekrarlanan soru metni: ${q.id}`);fingerprints.add(fingerprint);
    if(q.image&&!/^assets\/[a-zA-Z0-9_./-]+$/.test(q.image))throw Error('Görsel yolu assets/ altında olmalı.');
    if(!['verbatim','adapted'].includes(q.provenance))throw Error('Kaynak türü verbatim veya adapted olmalı.');
  }
  return bank.questions;
}
