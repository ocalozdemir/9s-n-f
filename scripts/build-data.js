import fs from 'node:fs';
import {validateBank} from '../engine.js';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/'+name+'.json',import.meta.url),'utf8'));
const curriculum=read('curriculum'),sources=read('sources'),bank=read('questions'),exams=read('exams');
validateBank(bank,curriculum,sources);
for(const exam of exams){if(exam.status==='ready'&&(!exam.scopeSourceUrl||!exam.questionIds.length||exam.questionIds.some(id=>!bank.questions.some(q=>q.id===id&&q.subject===exam.subject))))throw Error('Hazır sınav kapsamı veya soru kimlikleri eksik: '+exam.id);}
fs.writeFileSync(new URL('../data/bundle.js',import.meta.url),'window.ATOLYE_DATA = '+JSON.stringify({curriculum,sources,bank,exams})+';\n');
console.log(`${curriculum.length} ders, ${sources.length} kaynak, ${bank.questions.length} doğrulanmış soru paketlendi.`);
