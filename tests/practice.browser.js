// Run using playwright-cli run-code --filename=tests/practice.browser.js after opening the local site.
async page => {
 const base=new URL(page.url()).origin;
 if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Run this test only against a local server.');
 const check=(condition,message)=>{if(!condition)throw Error(message);};
 const browser=page.context().browser(), context=await browser.newContext({viewport:{width:1440,height:1000}});
 const p=await context.newPage(),errors=[];await p.emulateMedia({reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 const oldBackup={version:1,read:['l1'],scores:{l1:92,l15:95},cards:{'q1-1':{due:8640000000000,interval:7}},wrong:['q1-2'],activity:{'2026-10-22':4},settings:{voice:'',rate:0.85}};
 await context.addInitScript(seed=>{if(!localStorage.getItem('am-pronunciation-v1'))localStorage.setItem('am-pronunciation-v1',JSON.stringify(seed));},oldBackup);
 let navigation=0;
 const go=async route=>{await p.goto(base+'/?test='+ ++navigation+'#'+route);await p.waitForFunction(r=>document.querySelector('#main').dataset.route===r,route);};
 try{
  await go('quiz');check(await p.locator('#quiz-lesson').inputValue()==='l1','old backup defaults to l1');
  await p.locator('#quiz-lesson').selectOption('l15');
  check(await p.evaluate(()=>JSON.parse(localStorage.getItem('am-pronunciation-v1')).settings.quizLessonId)==='l15','selection saved on change');
  await go('home');await go('quiz');check(await p.locator('#quiz-lesson').inputValue()==='l15','selection survives route and reload');
  await go('quiz/l29');await go('quiz');check(await p.locator('#quiz-lesson').inputValue()==='l29','direct lesson updates choice');
  // Same lesson resume also updates selection, even if another choice was saved in the meantime.
  await p.locator('#quiz-lesson').selectOption('l15');await p.locator('[data-action="selected-quiz"]').click();await p.waitForFunction(()=>document.querySelector('#main').dataset.route==='quiz/l15');
  const count=await p.evaluate(()=>quiz.questions.length);
  check(count===await p.evaluate(()=>lessons.find(l=>l.id==='l15').questions.length),'selected lesson uses every question');check(count>5,'expanded lesson');
  let failedId;
  for(let i=0;i<count;i++){
   const q=await p.evaluate(()=>quiz.questions[quiz.index]);const picked=i===0?q.options.find(o=>o!==q.answer):q.answer;
   await p.locator('.option').nth(q.options.indexOf(picked)).click();
   const feedback=p.locator('.feedback');check((await feedback.innerText()).includes(q.optionExplanations[picked]),'feedback follows chosen option, not letter');
   check((await feedback.innerText()).includes(q.optionExplanations[q.answer]),'correct explanation is shown');
   check(await feedback.locator('a[href="assets/source.pdf#page='+q.sourcePages[0]+'"]').count()===1,'source link points to question page');
   if(i===0){failedId=q.id;await feedback.locator('summary').click();for(const other of q.options.filter(o=>o!==picked&&o!==q.answer))check((await feedback.innerText()).includes(q.optionExplanations[other]),'remaining alternative explanation');}
   if(i===1){await p.locator('#theme-toggle').click();await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});await p.screenshot({path:'output/playwright/practice-dark-correct.png',fullPage:true});}
   await p.locator('[data-action="next-question"]').click();
  }
  check(await p.getByRole('heading',{name:'Một bước tiến mới.'}).count()===1,'full lesson results reached');
  check(await p.evaluate(()=>state.scores.l15)===95,'lower result preserves old best');
  check(await p.evaluate(id=>state.wrong.includes(id),failedId),'wrong answer persisted');
  check(await p.evaluate(()=>state.scores.l1)===92,'old score unchanged');
  await go('quiz/l1');await p.evaluate(()=>location.hash='quiz');await p.waitForFunction(()=>document.querySelector('#main').dataset.route==='quiz');await p.locator('#quiz-lesson').selectOption('l7');
  // Change only the hash to keep the in-memory unfinished quiz for the resume branch.
  await p.evaluate(()=>location.hash='quiz/l1');await p.waitForFunction(()=>document.querySelector('#main').dataset.route==='quiz/l1');
  check(await p.evaluate(()=>state.settings.quizLessonId)==='l1','resumed lesson also updates choice');
  // Check randomized answers and long feedback on both themes and three viewports.
  for(const width of [1440,390,320])for(const dark of [false,true]){
   await p.setViewportSize({width,height:1000});await go('quiz/l6');
   if(await p.locator('#theme-toggle').getAttribute('aria-pressed')!==String(dark))await p.locator('#theme-toggle').click();
   const q=await p.evaluate(()=>quiz.questions[0]),picked=q.options.find(o=>o!==q.answer);
   await p.locator('.option').nth(q.options.indexOf(picked)).click();await p.locator('.feedback summary').click();
   check((await p.locator('.feedback').innerText()).includes(q.optionExplanations[picked]),'shuffled feedback '+width+' '+dark);
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow '+width+' '+dark);
   if(width===320)await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});await p.screenshot({path:'output/playwright/practice-'+(dark?'dark':'light')+'-wrong-320.png',fullPage:true});
  }
  await p.setViewportSize({width:1440,height:1000});
  await go('quiz');await p.locator('[data-action="mixed"]').click();check(await p.evaluate(()=>quiz.questions.length)===10,'mixed stays at 10');
  await p.evaluate(()=>{state.wrong=allQuestions.slice(0,25).map(q=>q.id);save();});
  await go('quiz/wrong');check(await p.evaluate(()=>quiz.questions.length)===20,'wrong review capped at 20');
  const correct=await p.evaluate(()=>quiz.questions[0]);await p.locator('.option').nth(correct.options.indexOf(correct.answer)).click();
  check(await p.evaluate(id=>!state.wrong.includes(id),correct.id),'correct retry removes wrong ID');
  await go('review');check(await p.evaluate(()=>review.ids.length)===20,'new bank flashcard session capped at 20');
  const newCard=await p.evaluate(()=>review.ids.find(id=>id.includes('-ext-')));check(!!newCard,'new cards unlocked by old read progress');
  // Reach a newly added card through normal review actions.
  let scheduledNew=false;
  for(let i=0;i<20&&!scheduledNew;i++){
   const id=await p.evaluate(()=>review.ids[review.index]);await p.locator('[data-action="flip"]').click();
   check((await p.locator('.flash-answer').innerText()).includes(await p.evaluate(()=>allQuestions.find(q=>q.id===review.ids[review.index]).explanation)),'flashcard general explanation');
   await p.locator('[data-action="rate:1"]').click();
   if(id.includes('-ext-')){check(await p.evaluate(id=>state.cards[id]?.interval===1,id),'new card scheduled');scheduledNew=true;}
  }
  check(scheduledNew,'review reached new card');
  // Import the old schema and verify compatibility, without touching the user's real browser storage.
  await go('settings');await p.locator('#import-file').setInputFiles({name:'old-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(oldBackup))});
  await p.locator('#confirm-dialog button[value="confirm"]').click();await p.waitForFunction(()=>state.settings.quizLessonId==='l1'&&state.scores.l1===92);
  check(await p.evaluate(()=>state.cards['q1-1'].due)===oldBackup.cards['q1-1'].due,'old imported schedule preserved');
  check(await p.evaluate(()=>state.wrong.join(','))==='q1-2','old imported wrong IDs preserved');
  check(errors.length===0,'page errors: '+errors.join('; '));
 }finally{await context.close();}
 const blocked=await browser.newContext({viewport:{width:390,height:844}});const b=await blocked.newPage(),blockedErrors=[];b.on('pageerror',e=>blockedErrors.push(e.message));
 await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
 try{
  await b.goto(base+'/#quiz');await b.locator('#quiz-lesson').selectOption('l29');
  await b.evaluate(()=>location.hash='home');await b.waitForFunction(()=>document.querySelector('#main').dataset.route==='home');
  await b.evaluate(()=>location.hash='quiz');await b.waitForFunction(()=>document.querySelector('#main').dataset.route==='quiz');
  check(await b.locator('#quiz-lesson').inputValue()==='l29','blocked storage keeps selection in memory');
  await b.locator('[data-action="selected-quiz"]').click();await b.waitForFunction(()=>document.querySelector('#main').dataset.route==='quiz/l29');check(await b.evaluate(()=>quiz.lessonId)==='l29','blocked storage can start selected lesson');
  const q=await b.evaluate(()=>quiz.questions[0]);await b.locator('.option').nth(q.options.indexOf(q.answer)).click();
  check(await b.locator('.feedback').count()===1,'blocked storage still answers');check(blockedErrors.length===0,'blocked storage page errors');
 }finally{await blocked.close();}
 console.log('PASS: selection, old backup, full lesson, shuffled explanations, wrong retry, new cards, 6 feedback layouts, blocked storage');
}
