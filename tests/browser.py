"""Integration QA. Run with local server at port 8000; Python Playwright + Chromium required."""
from playwright.sync_api import sync_playwright
import json, pathlib, tempfile
ROOT=pathlib.Path(__file__).resolve().parent.parent
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
    def go(url):
        response=page.goto(url)
        expected=url.split('#',1)[1] if '#' in url else 'home'
        page.wait_for_function('(route)=>document.querySelector("#main").dataset.route===route',arg=expected)
        return response
    errors=[]
    page.on('pageerror',lambda err: errors.append(str(err)))
    assert go('http://127.0.0.1:8000').status==200
    page.keyboard.press('Tab')
    assert page.locator('.skip').evaluate('(el)=>el===document.activeElement')
    page.keyboard.press('Enter')
    assert page.locator('#main').evaluate('(el)=>el===document.activeElement')
    assert page.locator('h1').inner_text()=='Mỗi ngày, một chút tiến bộ.'
    page.screenshot(path='/tmp/am-desktop.png',full_page=True)
    assert page.locator('h1').inner_text()=='Mỗi ngày, một chút tiến bộ.'
    page.locator('a[href="#lessons"]').first.click()
    assert page.locator('.lesson-card').count()==29
    page.locator('#search').fill('flap')
    assert page.locator('.lesson-card').count()>=1
    assert 'Flap' in page.locator('.lesson-card').first.inner_text()
    page.locator('#search').fill('zzzz-no-result')
    assert page.locator('.lesson-card').count()==0
    go('http://127.0.0.1:8000/#lesson/l1')
    page.get_by_role('button',name='Đánh dấu đã đọc',exact=True).click()
    assert json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))['read']==['l1']
    page.reload()
    assert page.get_by_role('button',name='✓ Đã đọc bài',exact=True).count()==1
    page.locator('a[href="#quiz/l1"]').click()
    page.locator('.option').first.wait_for()
    for i in range(5):
        answer=page.evaluate('quiz.questions[quiz.index].answer')
        opts=page.locator('.option')
        if i==0:
            opts.filter(has_text=answer).first.click()
            assert page.locator('.feedback').count()==1
        else:
            idx=page.evaluate('quiz.questions[quiz.index].options.indexOf(quiz.questions[quiz.index].answer)')
            opts.nth(idx).click()
        assert page.locator('.option:disabled').count()==3
        page.locator('[data-action="next-question"]').click()
    assert page.locator('.result-number').inner_text()=='100%'
    state=json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))
    assert state['scores']['l1']==100
    go('http://127.0.0.1:8000/#review')
    firstid=page.evaluate('review.ids[review.index]')
    page.get_by_role('button',name='Lật thẻ để kiểm tra').click()
    page.locator('[data-action="rate:3"]').click()
    state=json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))
    assert state['cards'][firstid]['interval']==3
    assert page.evaluate('review.index')==1
    # Wrong answer persists, then disappears after a correct answer in a later attempt.
    go('http://127.0.0.1:8000/#quiz/l2')
    qid=page.evaluate('quiz.questions[0].id')
    bad=page.evaluate('quiz.questions[0].options.findIndex(o=>o!==quiz.questions[0].answer)')
    page.locator('.option').nth(bad).click()
    assert qid in json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))['wrong']
    go('http://127.0.0.1:8000/#quiz')
    page.locator('[data-action="wrong"]').click()
    idx=page.evaluate('quiz.questions[0].options.indexOf(quiz.questions[0].answer)')
    page.locator('.option').nth(idx).click()
    assert qid not in json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))['wrong']
    go('http://127.0.0.1:8000/#settings')
    # Download then reject destructive reset, reset and restore actual downloaded backup.
    with page.expect_download() as download:
        page.locator('[data-action="export"]').click()
    backup=pathlib.Path(tempfile.gettempdir())/'am-qa-backup.json'
    download.value.save_as(backup)
    saved=json.loads(backup.read_text())
    page.locator('[data-action="reset"]').click()
    page.locator('#confirm-dialog button[value="cancel"]').click()
    assert json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))['read']==['l1']
    page.locator('[data-action="reset"]').click()
    page.locator('#confirm-dialog button[value="confirm"]').click()
    page.wait_for_function('JSON.parse(localStorage.getItem("am-pronunciation-v1")).read.length===0')
    assert json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))['read']==[]
    page.locator('#import-file').set_input_files(str(backup))
    page.locator('#confirm-dialog button[value="confirm"]').click()
    page.wait_for_function('JSON.parse(localStorage.getItem("am-pronunciation-v1")).read.length===1')
    assert json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))==saved
    page.locator('#import-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"version":99}'})
    page.wait_for_function('document.querySelector("#toast").textContent.includes("Không nhập được")')
    assert json.loads(page.evaluate('localStorage.getItem("am-pronunciation-v1")'))==saved
    # Empty English voice list has a useful fallback and does not throw.
    page.evaluate('speak("hello")')
    assert page.locator('#voice-status').inner_text()
    # Exercise voice selection even when the QA machine has no installed English voice.
    page.evaluate("""() => {
      const selected=[];
      window.__spoken=selected;
      speechSynthesis.getVoices=()=>[
        {voiceURI:'qa-gb',name:'QA British',lang:'en-GB'},
        {voiceURI:'qa-us',name:'QA American',lang:'en-US'}];
      speechSynthesis.speak=msg=>selected.push({voice:msg.voice.voiceURI,rate:msg.rate,text:msg.text});
      window.SpeechSynthesisUtterance=class {constructor(text){this.text=text}};
      loadVoices(); speak('voice test');
    }""")
    assert page.evaluate('window.__spoken[0].voice')=='qa-us'
    page.select_option('#voice','qa-gb')
    page.locator('#rate').fill('0.7')
    page.locator('[data-speak]').first.click()
    assert page.evaluate('window.__spoken.at(-1).voice')=='qa-gb'
    assert page.evaluate('window.__spoken.at(-1).rate')==0.7
    # All routes fit a narrow phone viewport and render without JS errors.
    page.set_viewport_size({'width':390,'height':844})
    for route in ['home','lessons','lesson/l1','quiz','quiz/l1','review','progress','settings','missing']:
        go('http://127.0.0.1:8000/#'+route)
        assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),route
    go('http://127.0.0.1:8000/#home')
    page.evaluate('document.querySelector("#toast").classList.remove("show")')
    page.screenshot(path='/tmp/am-mobile.png',full_page=True)
    assert page.request.get('http://127.0.0.1:8000/assets/source.pdf').status==200
    assert not errors,errors
    # Storage denied and no speech API must still allow learning.
    ctx=browser.new_context()
    ctx.add_init_script('Object.defineProperty(window,"localStorage",{get(){throw new Error("blocked")}}); Object.defineProperty(window,"speechSynthesis",{value:undefined});')
    denied=ctx.new_page()
    denied.goto('http://127.0.0.1:8000/#lesson/l1')
    denied.get_by_role('button',name='Đánh dấu đã đọc',exact=True).click()
    assert denied.get_by_role('button',name='✓ Đã đọc bài',exact=True).count()==1
    denied.locator('[data-speak]').first.click()
    assert 'trình duyệt' in denied.locator('.audio-help-text').inner_text().lower()
    browser.close()
    print('PASS: navigation, search, completion, persistence, review, wrong answers, backup import/export, responsive routes, PDF, fallback states; no page errors.')
