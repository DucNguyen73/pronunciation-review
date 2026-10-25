"""Hands-on flow regression and screenshots following the UX review."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent.parent/'audit'
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1366,'height':960})
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 def observe():return page.locator('body').aria_snapshot()
 def snap(name):
  (OUT/(name+'.txt')).write_text(observe())
  page.screenshot(path=str(OUT/(name+'.png')))
 def click(locator):
  observe();locator.click()
 def route(hash):
  page.goto('http://127.0.0.1:8000/#'+hash)
  page.wait_for_function('(hash)=>document.querySelector("main").dataset.route===hash',arg=hash)
 page.goto('http://127.0.0.1:8000')
 snap('01-home-after')
 click(page.get_by_role('link',name='Bắt đầu phiên học'))
 page.locator('.rules').wait_for();snap('02-lesson-after')
 assert page.locator('[data-nav="lessons"]').evaluate('(el)=>el.classList.contains("active")')
 click(page.get_by_role('button',name='Đánh dấu đã đọc',exact=True))
 click(page.get_by_role('link',name='Luyện bài này'))
 page.locator('.option').first.wait_for()
 click(page.locator('.option').first)
 click(page.get_by_role('button',name='Câu tiếp theo'))
 qtext=page.locator('#question-title').inner_text()
 click(page.locator('.option').first)
 chosen=page.locator('.feedback').inner_text()
 assert page.locator('.option').first.evaluate('(el)=>getComputedStyle(el).opacity')=='1'
 snap('03-feedback-after')
 click(page.get_by_role('link',name='Xem bài học'))
 page.locator('.rules').wait_for()
 assert page.get_by_role('link',name='Tiếp tục bài đang làm').count()==1
 click(page.locator('[data-nav="quiz"]'))
 page.locator('.resume-panel').wait_for();snap('04-resume-after')
 click(page.get_by_role('link',name='Tiếp tục bài đang làm'))
 page.locator('.feedback').wait_for()
 assert page.locator('#question-title').inner_text()==qtext
 assert page.locator('.feedback').inner_text()==chosen
 assert 'Câu 2 / 5' in page.locator('.section-head').inner_text()
 # A deliberate retry is new, whereas navigating out and back resumes.
 route('review')
 click(page.get_by_role('button',name='Lật thẻ để kiểm tra'))
 snap('05-review-after')
 for _ in range(5):
  click(page.locator('[data-action="rate:7"]'))
  if page.locator('[data-action="flip"]').count():click(page.locator('[data-action="flip"]'))
 assert 'Lần ôn tiếp theo:' in page.locator('main').inner_text()
 assert page.get_by_role('link',name='Học bài tiếp theo').count()==1
 snap('08-review-done-after')
 page.set_viewport_size({'width':390,'height':844})
 route('lesson/l1')
 assert page.locator('.rules').bounding_box()['y']<844
 assert page.locator('.rules').bounding_box()['y']<page.locator('.side-meta').bounding_box()['y']
 page.evaluate('document.querySelector("#toast").classList.remove("show")')
 snap('06-mobile-after')
 click(page.get_by_role('button',name='Tới phần luyện tập'))
 assert page.locator('#lesson-actions').evaluate('(el)=>el===document.activeElement')
 page.locator('.listen').first.scroll_into_view_if_needed()
 click(page.locator('.listen').first)
 assert page.locator('.audio-help').is_visible()
 assert page.locator('.audio-help a').is_visible()
 assert page.locator('.listen').first.bounding_box()['height']>=44
 assert page.locator('.listen').first.bounding_box()['width']>=44
 snap('07-audio-after')
 # Return to the current answer and move to a new question on mobile.
 route('quiz/resume')
 page.locator('[data-action="next-question"]').scroll_into_view_if_needed()
 click(page.locator('[data-action="next-question"]'))
 box=page.locator('#question-title').bounding_box()
 assert box['y']>=0 and box['y']+box['height']<=844
 assert page.locator('#question-title').evaluate('(el)=>el===document.activeElement')
 snap('09-mobile-question-after')
 for width in [320,390,768,1366]:
  page.set_viewport_size({'width':width,'height':960})
  for r in ['home','lesson/l1','quiz','quiz/resume','review','settings']:
   route(r)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,r)
 assert not errors,errors
 b.close()
 print('PASS: quiz resumes with exact question and feedback; mobile content comes first; 44px audio target; persistent audio help; review next date; next question visible and focused; 24 viewport/route checks; no JS errors.')
