export function selectQuestions(questions,limit=20,random=Math.random){
  const shuffle=arr=>{const out=[...arr];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
  const target=limit>0?Math.min(limit,questions.length):questions.length;
  const groups=new Map();
  for(const q of questions){const k=q.topic+'|'+q.outcome;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(q);}
  const pools=shuffle([...groups.values()].map(shuffle));const selected=[];
  while(selected.length<target){for(const pool of pools){if(pool.length)selected.push(pool.pop());if(selected.length===target)break;}}
  return shuffle(selected);
}
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
    if(q.imageCrop){
      const c=q.imageCrop;
      if(!q.image||['x','y','width','height','fullWidth','fullHeight'].some(k=>!Number.isInteger(c[k]))||c.x<0||c.y<0||c.width<=0||c.height<=0||c.x+c.width>c.fullWidth||c.y+c.height>c.fullHeight)throw Error(`Görsel kırpma alanı geçersiz: ${q.id}`);
    }
    if(!['verbatim','adapted'].includes(q.provenance))throw Error('Kaynak türü verbatim veya adapted olmalı.');
  }
  return bank.questions;
}

// Stable membership keeps Test 1 / Test 2 meaningful across visits and retries.
export function partitionTests(questions,maxSize=15){
  if(!Number.isInteger(maxSize)||maxSize<1||maxSize>15)throw Error('Test başına soru sayısı 1–15 olmalı.');
  const ordered=[...questions].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  const groups=[];for(let i=0;i<ordered.length;i+=maxSize)groups.push(ordered.slice(i,i+maxSize));return groups;
}
export function parentReport(result,studentName,subjectName){
  const seconds=Math.max(0,Math.round((Date.parse(result.finishedAt)-Date.parse(result.startedAt))/1000));
  return [
    '9. Atölye — Test Sonuç Raporu',
    `Öğrenci: ${studentName||'Belirtilmedi'}`,`Ders: ${subjectName}`,`Test: ${result.title}`,
    `Tarih: ${new Date(result.finishedAt).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul'})}`,
    `Sonuç: ${result.correct} doğru, ${result.wrong} yanlış, ${result.blank} boş / ${result.total} soru`,
    `Başarı: %${result.percent}`,`Süre: ${Math.floor(seconds/60)} dk ${seconds%60} sn`,'',
    'Konu değerlendirmesi:',...result.topics.map(t=>`${t.topic} (${t.outcome}): ${t.correct} doğru, ${t.wrong} yanlış, ${t.blank} boş — %${t.percent}; ${t.assessment}`),'',
    'Tekrar önerilen konular:',...result.topics.filter(t=>t.wrong||t.blank).map(t=>`• ${t.topic}: ${(t.references||[]).map(r=>r.sourceId+' s. '+r.pages.join(', ')).join('; ')}`),
    '', 'Bu rapor yalnızca çözülen soruları değerlendirir. Bir konuda 3 sorudan az varsa değerlendirme sınırlıdır.','https://ocalozdemir.github.io/9s-n-f/'
  ].join('\n');
}
