const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/../content.js','utf8'),ctx);const c=ctx.window.COURSE,b=JSON.parse(fs.readFileSync(__dirname+'/fixtures/lesson-guide-baseline.json','utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('all 29 guides preserve original data and cover every former rule',()=>{
 assert.equal(c.lessons.length,29);assert.equal(hash(c.sourcePages),b.source);assert.equal(hash(c.practiceCoverage),b.coverage);let count=0;
 for(const l of c.lessons){const old=b.lessons.find(x=>x.id===l.id);assert(old);assert.equal(hash(Object.fromEntries(Object.entries(l).filter(([k])=>k!=='guide'))),old.hash,l.id);assert(!('rules'in l));assert(!('note'in l));count+=l.questions.length;
 const g=l.guide;assert(g.goal.length>20);assert.equal(g.essentials.length,3);assert(g.essentials.every(s=>s.trim().length>2));const covered=new Set();
 for(const s of g.sections){for(const k of ['title','explanation','memory'])assert(s[k]?.length>5,`${l.id} ${k}`);assert(s.steps.length>=2);for(const n of s.covers){assert(Number.isInteger(n)&&n>=0&&n<old.rules.length);covered.add(n);}
 assert(s.examples.length);for(const e of s.examples){for(const k of ['text','ipa','meaning','speak','focus'])assert(e[k]?.trim(),`${l.id} ${k}`);assert(e.ipa.includes('/'));assert(!/[<>]/.test(e.speak));}}
 assert.equal(covered.size,old.rules.length,l.id);assert(g.further.some(n=>n.text===old.note),l.id+' preserves prior caveats');for(const k of ['prompt','answer','explanation'])assert(g.selfCheck[k]?.length>2);assert.notEqual(g.selfCheck.answer,g.selfCheck.explanation);assert(g.terms.every(t=>t.term&&t.definition));
 }assert.equal(count,1201);
});
