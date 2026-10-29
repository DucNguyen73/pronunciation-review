const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const S=require('../core.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/../content.js','utf8'),context);
const {lessons,sourcePages,practiceCoverage}=context.window.COURSE;
test('source coverage and unambiguous question bank',()=>{
 assert.equal(lessons.length,29);assert.equal(sourcePages.length,32);
 const ids=new Set(),pages=new Set();
 for(const l of lessons){assert(l.questions.length>5);l.pages.forEach(p=>{assert(sourcePages[p-1]?.trim());pages.add(p);});
 const prompts=new Set();
 for(const q of l.questions){assert(!ids.has(q.id),q.id);ids.add(q.id);assert.equal(q.lessonId,l.id);assert(!prompts.has(q.prompt),q.prompt);prompts.add(q.prompt);assert.equal(new Set(q.options).size,3);assert(q.options.includes(q.answer));assert(q.explanation.length>15);
 assert(q.sourcePages.length>0);assert(q.sourcePages.every(p=>l.pages.includes(p)&&sourcePages[p-1]?.trim()),q.id);
 assert(q.sourceTerms.length>0);assert.equal(Object.keys(q.optionExplanations).length,3);
 for(const o of q.options)assert(q.optionExplanations[o]?.length>25,`${q.id}: ${o}`);
 assert.equal(new Set(Object.values(q.optionExplanations)).size,3,q.id);
 }}
 assert(ids.size>128);assert.equal(pages.size,32);
 // Original stable IDs are still valid keys in stored wrong answers and schedules.
 const originalCounts=[5,5,5,5,5,5,5,4,4,4,4,4,4,5,5,5,4,4,4,4,4,4,4,4,5,5,4,4,4];
 originalCounts.forEach((n,i)=>{for(let j=1;j<=n;j++)assert(ids.has(`q${i+1}-${j}`));});
 assert.deepEqual(Array.from(practiceCoverage.reviewedPages),Array.from({length:32},(_,i)=>i+1));
 for(const l of lessons){const rows=practiceCoverage.groups.filter(g=>g.lessonId===l.id);assert(rows.length>0);
 for(const g of rows){assert(l.pages.includes(g.page));assert.equal(g.examples.length,g.questionIds.length);
 g.questionIds.forEach((id,i)=>{const q=l.questions.find(q=>q.id===id);assert(q,id);assert(q.sourcePages.includes(g.page));assert(q.sourceTerms.includes(g.examples[i]),id);});}}
});
test('lesson choice survives validation and older backups get a valid default',()=>{
 const s=S.blank();s.settings.quizLessonId='l29';assert.equal(S.validate(s,lessons).settings.quizLessonId,'l29');
 delete s.settings.quizLessonId;assert.equal(S.validate(s,lessons).settings.quizLessonId,'l1');
 for(const invalid of ['missing','mixed','wrong','',null,{},5]){s.settings.quizLessonId=invalid;assert.equal(S.validate(s,lessons).settings.quizLessonId,'l1');}
});
test('reviewed pronunciation and ambiguous contractions keep their explicit contexts',()=>{
 const find=(lesson,term,topic)=>lessons[lesson-1].questions.find(q=>q.sourceTerms.includes(term)&&q.topic.includes(topic));
 assert.equal(find(3,'finger','cụm ng').answer,'/ŋɡ/');
 assert.equal(find(1,'suit','s đầu').answer,'/s/');
 assert.equal(find(1,'suite','cụm su').answer,'/sw/');
 assert.equal(find(3,'cicada','c thứ hai').answer,'/k/');
 assert.equal(find(25,'he’s finished his work','rút gọn have').answer,'he has finished his work');
 assert(find(19,'pattern','t d trước n').answer.includes('r giữa t và n'));
 const protest=find(14,'protest','protest có biến thể');assert(protest.answer.includes('biến thể'));
});
test('old progress is retained and new cards unlock without replacing old schedules',()=>{
 const s=S.blank(),newQuestion=lessons[0].questions.find(q=>q.id.includes('-ext-'));
 s.read=['l1'];s.scores.l1=92;s.wrong=['q1-1',newQuestion.id];s.cards['q1-1']={due:999999,interval:7};
 const restored=S.validate(s,lessons);assert.equal(restored.scores.l1,92);assert.equal(restored.cards['q1-1'].due,999999);
 assert.deepEqual(restored.wrong,s.wrong);assert(S.due(restored,lessons,100).some(q=>q.id===newQuestion.id));
 assert(!S.due(restored,lessons,100).some(q=>q.id==='q1-1'));
});
test('completion requires reading and >=80%, best score survives a lower result',()=>{
 const s=S.blank(),l=lessons[0];S.score(s,l.id,80);assert(!S.completed(s,l));s.read.push(l.id);assert(S.completed(s,l));S.score(s,l.id,20);assert.equal(s.scores[l.id],80);
});
test('only read lessons unlock cards; 1/3/7 day reviews wait until due',()=>{
 const s=S.blank(),l=lessons[0],q=l.questions[0],now=100000;
 assert.equal(S.due(s,lessons,now).length,0);s.read.push(l.id);assert.equal(S.due(s,lessons,now).length,l.questions.length);
 for(const interval of [1,3,7]){S.schedule(s,q.id,interval,now);assert.equal(s.cards[q.id].due,now+interval*86400000);assert(!S.due(s,lessons,s.cards[q.id].due-1).some(x=>x.id===q.id));assert(S.due(s,lessons,s.cards[q.id].due).some(x=>x.id===q.id));}
});
test('backup validates known IDs and filters malformed values',()=>{
 const s=S.blank();s.read=['l1','unknown'];s.wrong=['q1-1','missing'];s.scores={l1:90,l2:Infinity,unknown:80};s.cards={'q1-1':{due:100,interval:3},'q1-2':{due:-1,interval:7}};s.activity={'2026-10-22':4,bad:5};s.settings.rate=99;
 const restored=S.validate(s,lessons);assert.deepEqual(restored.read,['l1']);assert.deepEqual(restored.wrong,['q1-1']);assert.deepEqual(restored.scores,{l1:90});assert.equal(Object.keys(restored.cards).length,1);assert.deepEqual(restored.activity,{'2026-10-22':4});assert.equal(restored.settings.rate,1.2);
 assert.throws(()=>S.validate({version:3},lessons));assert.deepEqual(S.validate(S.blank(),lessons),S.blank());
});
