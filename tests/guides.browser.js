// Run with playwright-cli run-code --filename=tests/guides.browser.js on the local site.
async page=>{
 const base=new URL(page.url()).origin;if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Local server required');
 const check=(x,m)=>{if(!x)throw Error(m)},context=await page.context().browser().newContext(),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(()=>{
  window.__spoken=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
  Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{name:'QA English',lang:'en-US',voiceURI:'qa',default:true}],addEventListener(){},cancel(){},speak(u){window.__spoken.push(u.text)}}});
  if(!localStorage.getItem('am-pronunciation-v1'))localStorage.setItem('am-pronunciation-v1',JSON.stringify({version:1,read:['l1'],scores:{l1:92,l15:95},cards:{'q1-1':{due:8640000000000,interval:7}},wrong:['q1-2'],activity:{'2026-10-22':4},settings:{voice:'',rate:0.85,quizLessonId:'l16'}}));
 });
 const go=async r=>{await p.goto(base+'/#'+r);await p.waitForFunction(r=>document.querySelector('#main').dataset.route===r,r)};
 let routes=0,audio=0,links=0;
 try{
 await go('lesson/l1');const before=await p.evaluate(()=>localStorage.getItem('am-pronunciation-v1'));
 const ids=await p.evaluate(()=>window.COURSE.lessons.map(l=>l.id));
 for(const width of [1440,390])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:1000});
  for(const id of ids){
   await go('lesson/'+id);await p.evaluate(t=>{document.documentElement.dataset.theme=t},theme);
   check(await p.locator('.lesson-guide').count()===1,'guide '+id);
   check(await p.locator('.guide-essentials li').count()===3,'three essentials '+id);
   check(await p.locator('.rules').count()===0,'old rules absent');
   check(await p.locator('.guide-further').getAttribute('open')===null,'collapsed further');
   for(const selector of ['.guide-further summary','.guide-answer summary']){await p.locator(selector).focus();await p.keyboard.press('Enter');check(await p.locator(selector).evaluate(e=>e.parentElement.open),'keyboard details '+id);}
   check((await p.locator('.guide-answer').innerText()).length>40,'self check '+id);
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+id+' '+width+' '+theme);
   if(width===1440&&theme==='light'){
    const expected=await p.locator('.guide-listen').evaluateAll(es=>es.map(e=>e.dataset.speak));await p.evaluate(()=>window.__spoken=[]);
    for(const b of await p.locator('.guide-listen').all())await b.click();
    const actual=await p.evaluate(()=>window.__spoken);check(JSON.stringify(actual)===JSON.stringify(expected),'all audio callbacks '+id);audio+=actual.length;
    const hrefs=await p.locator('.guide-source a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),pages=await p.evaluate(id=>window.COURSE.lessons.find(l=>l.id===id).pages,id);
    check(JSON.stringify(hrefs)===JSON.stringify(pages.map(n=>'assets/source.pdf#page='+n)),'PDF '+id);links+=hrefs.length;
   }
   if(['l1','l6','l9','l15','l16','l27'].includes(id)){
    await p.locator('.guide-check').scrollIntoViewIfNeeded();await p.screenshot({path:`output/playwright/guides-${id}-${width}-${theme}-details.png`});
    await p.locator('.guide-essentials').scrollIntoViewIfNeeded();await p.screenshot({path:`output/playwright/guides-${id}-${width}-${theme}.png`});
   }
   routes++;
  }
 }
 check(await p.evaluate(()=>localStorage.getItem('am-pronunciation-v1'))===before,'guide interactions preserve progress, schedules and selection');
 await go('lessons');await p.locator('#search').fill('cú chạm');check(await p.locator('.lesson-card').count()>0,'search new guide prose');
 check((await p.request.get(base+'/assets/source.pdf')).status()===200,'PDF available');
 check(!errors.length,errors.join('\n'));
 return {routes,audio,links,errors,progress:'unchanged',screenshots:48};
 }finally{await context.close()}
}
