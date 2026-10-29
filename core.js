(function (root) {
'use strict';
const blank = () => ({version:1,read:[],scores:{},cards:{},wrong:[],activity:{},settings:{voice:'',rate:0.85,quizLessonId:'l1'}});
const dayKey = (date=new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function validate(raw, lessons) {
 if(!raw || raw.version!==1 || !Array.isArray(raw.read) || !Array.isArray(raw.wrong) || !raw.scores || !raw.cards || !raw.activity || !raw.settings) throw Error('Tệp không đúng định dạng bản sao lưu Âm phiên bản 1.');
 const state=blank(), lids=new Set(lessons.map(l=>l.id)), qids=new Set(lessons.flatMap(l=>l.questions.map(q=>q.id)));
 state.read=[...new Set(raw.read.filter(id=>lids.has(id)))]; state.wrong=[...new Set(raw.wrong.filter(id=>qids.has(id)))];
 for(const [id,v] of Object.entries(raw.scores)) if(lids.has(id)&&Number.isFinite(v)&&v>=0&&v<=100) state.scores[id]=v;
 for(const [id,c] of Object.entries(raw.cards)) if(qids.has(id)&&c&&Number.isFinite(c.due)&&c.due>=0&&c.due<=8640000000000000&&[1,3,7].includes(c.interval)) state.cards[id]={due:c.due,interval:c.interval};
 for(const [d,n] of Object.entries(raw.activity)) if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isInteger(n)&&n>=0&&n<1000000) state.activity[d]=n;
 state.settings.voice=typeof raw.settings.voice==='string'?raw.settings.voice.slice(0,300):'';
 state.settings.rate=Number.isFinite(raw.settings.rate)?Math.min(1.2,Math.max(0.6,raw.settings.rate)):0.85;
 state.settings.quizLessonId=lids.has(raw.settings.quizLessonId)?raw.settings.quizLessonId:(lessons[0]?.id||'');
 return state;
}
const completed=(s,l)=>s.read.includes(l.id)&&(s.scores[l.id]||0)>=80;
const questions=lessons=>lessons.flatMap(l=>l.questions);
const due=(s,lessons,now=Date.now())=>questions(lessons).filter(q=>s.read.includes(q.lessonId)&&(!s.cards[q.id]||s.cards[q.id].due<=now));
function schedule(s,id,interval,now=Date.now()){if(![1,3,7].includes(interval))throw Error('Khoảng ôn không hợp lệ');s.cards[id]={due:now+interval*86400000,interval};}
function score(s,id,value){s.scores[id]=Math.max(s.scores[id]||0,value);}
const api={blank,dayKey,validate,completed,questions,due,schedule,score};
root.Study=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
