const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const S=require('../core.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/../content.js','utf8'),context);
const {lessons,sourcePages}=context.window.COURSE;
test('source coverage and unambiguous question bank',()=>{
 assert.equal(lessons.length,29);assert.equal(sourcePages.length,32);
 const ids=new Set(),pages=new Set();
 for(const l of lessons){assert(l.questions.length>=3);l.pages.forEach(p=>{assert(sourcePages[p-1]?.trim());pages.add(p);});
 for(const q of l.questions){assert(!ids.has(q.id));ids.add(q.id);assert.equal(q.lessonId,l.id);assert.equal(new Set(q.options).size,3);assert(q.options.includes(q.answer));assert(q.explanation.length>15);}}
 assert.equal(ids.size,128);assert.equal(pages.size,32);
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
