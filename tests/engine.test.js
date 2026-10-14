import test from 'node:test';import assert from 'node:assert/strict';import {evaluate,validateBank,selectQuestions} from '../engine.js';
const q=(id,topic='Üslü ifadeler')=>({id,subject:'matematik',unit:'matematik-1',topic,outcome:'MAT.9.1.1',stem:'Soru '+id,options:['A','B'],answer:0,page:12,sourceId:'matematik1',explanation:'A doğrudur.',status:'verified',provenance:'verbatim'});
const curriculum=[{id:'matematik',units:[{id:'matematik-1'}]}],sources=[{id:'matematik1'}];
test('yanlış ve boşlar ayrı; 3 soruluk zayıf konu için tekrar önerilir',()=>{const r=evaluate([q('1'),q('2'),q('3')],{'1':0,'2':1});assert.deepEqual([r.correct,r.wrong,r.blank,r.percent],[1,1,1,33]);assert.equal(r.topics[0].assessment,'Tekrar çalış');assert.equal(r.rows[2].givenAnswer,null);});
test('az sayıda doğru sorudan kesin başarı yorumu çıkarılmaz',()=>{assert.equal(evaluate([q('1')],{'1':0}).topics[0].assessment,'Daha fazla soru çöz');});
test('boş test sıfıra bölünmez',()=>{assert.equal(evaluate([],{}).percent,0);});
test('konular başarıya göre sıralanır ve kimlikler korunur',()=>{const r=evaluate([q('1','A'),q('2','B')],{'1':0,'2':1});assert.equal(r.topics[0].topic,'B');assert.equal(r.rows[1].id,'2');});
test('banka bilinmeyen kaynak, cevap ve tekrarı reddeder',()=>{for(const invalid of [{...q('1'),sourceId:'missing'},{...q('1'),answer:2},{...q('1'),unit:'wrong'},{...q('1'),status:'draft'}])assert.throws(()=>validateBank({schemaVersion:1,questions:[invalid]},curriculum,sources));assert.throws(()=>validateBank({schemaVersion:1,questions:[q('1'),q('1')]},curriculum,sources));assert.throws(()=>validateBank({schemaVersion:1,questions:[q('2'),{...q('3'),stem:'Soru 2'}]},curriculum,sources));});
test('doğru banka kabul edilir',()=>{assert.equal(validateBank({schemaVersion:1,questions:[q('1')]},curriculum,sources).length,1);});
test('bir konudaki farklı kitap sayfaları kaynaklarıyla korunur',()=>{const r=evaluate([q('1'),{...q('2'),sourceId:'kitap2',page:20}],{});assert.deepEqual(r.topics[0].references,[{sourceId:'matematik1',pages:[12]},{sourceId:'kitap2',pages:[20]}]);});
test('başka üniteye ait öğrenme çıktısı reddedilir',()=>{assert.throws(()=>validateBank({schemaVersion:1,questions:[q('1')]},[{id:'matematik',units:[{id:'matematik-1',outcomes:[{code:'MAT.9.2.1'}]}]}],sources));});
test('soru görseli atlas dışına taşamaz',()=>{assert.throws(()=>validateBank({schemaVersion:1,questions:[{...q('1'),image:'assets/math.jpg',imageCrop:{x:0,y:50,width:100,height:100,fullWidth:100,fullHeight:100}}]},curriculum,sources));});
test('atlas içindeki soru görseli kabul edilir',()=>{assert.equal(validateBank({schemaVersion:1,questions:[{...q('1'),image:'assets/math.jpg',imageCrop:{x:0,y:0,width:100,height:50,fullWidth:100,fullHeight:100}}]},curriculum,sources).length,1);});
test('kısa test farklı konuları kapsar ve soru tekrar etmez',()=>{const pool=[...Array.from({length:20},(_,i)=>q('a'+i,'A')),q('b','B'),q('c','C')];const r=selectQuestions(pool,3,()=>0.5);assert.equal(new Set(r.map(x=>x.topic)).size,3);assert.equal(new Set(r.map(x=>x.id)).size,3);assert.equal(pool.length,22);});
test('tüm sorular seçeneği ve küçük havuz doğru sayıda soru döndürür',()=>{assert.equal(selectQuestions([q('1'),q('2')],0).length,2);assert.equal(selectQuestions([q('1')],20).length,1);assert.equal(selectQuestions([],20).length,0);});

test('numaralı testler 15 sınırını aşmaz ve havuzdaki her soru tam bir kez yer alır',async()=>{
 const {partitionTests}=await import('../engine.js');const qs=Array.from({length:52},(_,i)=>({id:'q'+String(i).padStart(3,'0')}));
 const groups=partitionTests(qs);assert.deepEqual(groups.map(g=>g.length),[15,15,15,7]);assert.equal(new Set(groups.flat().map(q=>q.id)).size,52);assert.deepEqual(groups,partitionTests([...qs].reverse()));assert.deepEqual(partitionTests([]),[]);assert.throws(()=>partitionTests(qs,16));
});
test('veli raporu yanlışları boşlardan ayırır ve az örnek uyarısını içerir',async()=>{
 const {parentReport}=await import('../engine.js');const r={title:'Test 2',startedAt:'2026-10-14T10:00:00Z',finishedAt:'2026-10-14T10:01:30Z',total:3,correct:1,wrong:1,blank:1,percent:33,topics:[{topic:'Osmoz',outcome:'BİY.9.2.2',correct:1,wrong:1,blank:1,percent:33,assessment:'Tekrar çalış',references:[{sourceId:'biyoloji',pages:[152]}]}]};const text=parentReport(r,'Öğrenci','Biyoloji');assert.match(text,/1 doğru, 1 yanlış, 1 boş/);assert.match(text,/Osmoz/);assert.match(text,/1 dk 30 sn/);assert.match(text,/3 sorudan az/);
});
