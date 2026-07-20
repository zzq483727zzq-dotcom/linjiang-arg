"""End-to-end walkthrough of the Serene ARG game.
- Boots the local server (must already be on :5173)
- Visits each page in player order
- Captures console errors and HTTP failures
- Screenshots each state
- Verifies key DOM (post list, comments, bubbles)
- Tries admin password
- Verifies ending pages
"""
import os, sys, json, time, traceback
from playwright.sync_api import sync_playwright

OUT = r"D:\VScode项目文件夹\arg解谜游戏\test-out"
os.makedirs(OUT, exist_ok=True)

report = []

def log(step, msg):
    print(f"[{step}] {msg}", flush=True)
    report.append((step, msg))

def shot(page, name):
    path = os.path.join(OUT, f"{name}.png")
    try:
        page.screenshot(path=path, full_page=True)
        log("shot", path)
    except Exception as e:
        log("shot-err", f"{name}: {e}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()

    console_errors = []
    page_errors = []
    failed_requests = []
    page.on("console", lambda m: console_errors.append((m.type, m.text, page.url)) if m.type == "error" else None)
    # Track the page URL when each console error happens
    page.on("pageerror", lambda e: page_errors.append(str(e)))
    # Log unexpected 404 responses (not the intentional /nonexistent test)
    def on_response(r):
        if r.status == 404 and '/nonexistent' not in r.url:
            log("net404", f"{r.status} {r.url}")
    page.on("response", on_response)

    BASE = "http://localhost:5173"

    # Reset state at start
    page.goto(BASE + "/", wait_until="domcontentloaded")
    page.evaluate("() => localStorage.clear()")

    def visit(path, name, expect_text=None):
        log("visit", path)
        page.goto(BASE + path, wait_until="networkidle", timeout=20000)
        page.wait_for_timeout(1500)
        if expect_text:
            html = page.content()
            ok = expect_text in html
            log("expect", f"{name}: {'OK' if ok else 'MISSING'}  '{expect_text}'")
        shot(page, name)
        return page

    try:
        # 0. Homepage
        visit("/", "00-home", expect_text="今天")
        visit("/index.html", "00-home-direct", expect_text="静园")

        # 1. Click into Lin's blog (simulate player discovery)
        log("click", "link to blog")
        page.goto(BASE + "/", wait_until="networkidle")
        # Check if there's a link to blog (could be via pill or card)
        links = page.locator("a[href*='blog']").count()
        log("dom", f"homepage links to blog: {links}")

        # 2. Blog index
        visit("/blog/", "01-blog-index", expect_text="静的角落")
        # Confirm 3 posts listed
        count = page.locator("article.post-card").count()
        log("dom", f"blog post cards: {count}")

        # 3. Each blog post page
        for post in ["hope", "trapped", "final"]:
            visit(f"/blog/post-{post}.html", f"02-post-{post}", expect_text="林")
        # Check final post has the GOOD/IQGG/DOOG references
        page.goto(BASE + "/blog/post-final.html", wait_until="networkidle")
        body = page.inner_text("body")
        for k in ["IQGG", "DOOG", "GOOD"]:
            log("clue", f"final-post contains '{k}': {k in body}")

        # 4. Forum
        visit("/forum/", "03-forum", expect_text="反消费主义互助")
        comments = page.locator("div.comment").count()
        log("dom", f"forum comments: {comments}")
        # Check the email doog-news.org exists
        body = page.inner_text("body")
        log("clue", f"forum email DOOG: {'doog' in body.lower()}")

        # 5. WeChat
        visit("/chat/wechat-thread.html", "04-wechat", expect_text="客服")
        bubbles = page.locator(".bubble").count()
        log("dom", f"wechat bubbles: {bubbles}")
        body = page.inner_text("body")
        log("clue", f"wechat mentions IQGG: {'IQGG' in body}")
        log("clue", f"wechat mentions 小 GOOD: {'小 GOOD' in body}")

        # 6. Social timeline
        visit("/social/timeline.html", "05-social", expect_text="朋友圈")
        imgs = page.locator("article.card img").count()
        log("dom", f"social timeline images: {imgs}")

        # 7. Admin gate
        visit("/admin/", "06-admin-gate", expect_text="OPERATIONS")
        log("admin", "trying wrong password")
        page.fill("input#pw", "wrong")
        page.click("button[type='submit']")
        page.wait_for_timeout(500)
        msg = page.inner_text("#msg")
        log("admin", f"wrong-pw msg: '{msg[:80]}'")
        shot(page, "06-admin-wrong")

        log("admin", "trying correct password GOOD")
        page.fill("input#pw", "GOOD")
        page.click("button[type='submit']")
        page.wait_for_timeout(800)
        dash_hidden = page.evaluate("document.getElementById('dash').hidden")
        gate_hidden = page.evaluate("document.getElementById('gate').hidden")
        log("admin", f"after-OK: gate hidden={gate_hidden}, dash hidden={dash_hidden}")
        shot(page, "07-admin-ok")

        # Read state to verify corruption level
        state = page.evaluate("""() => {
            const raw = {};
            for (let i=0; i<localStorage.length; i++) {
                const k = localStorage.key(i);
                raw[k] = localStorage.getItem(k);
            }
            return raw;
        }""")
        log("state", f"localStorage keys: {list(state.keys())}")
        log("state", f"corruption raw: {state.get('serene.corruption')}")
        log("state", f"unlocked raw: {state.get('serene.unlocked')}")

        # 8. Endings
        visit("/endings/logout.html", "08-end-logout", expect_text="登出")
        visit("/endings/accept.html", "09-end-accept", expect_text="48 号")
        visit("/endings/hidden.html", "10-end-hidden", expect_text="第 48 张脸")

        # 9. 404 page
        visit("/404.html", "11-404", expect_text="404")
        visit("/nonexistent", "12-404-fallback")

    except Exception as e:
        log("FATAL", traceback.format_exc())
        try:
            shot(page, "FATAL")
        except: pass

    finally:
        # Print summary of errors
        log("summary", f"console errors: {len(console_errors)}")
        for t, msg, url in console_errors[:20]:
            log("console-err", f"[{t}] {msg[:200]} (on {url})")
        log("summary", f"page errors: {len(page_errors)}")
        for m in page_errors[:10]:
            log("page-err", m[:200])
        log("summary", f"failed requests: {len(failed_requests)}")
        for url, f in failed_requests[:10]:
            log("net-err", f"{url} -- {f}")

        # Save report
        with open(os.path.join(OUT, "report.txt"), "w", encoding="utf-8") as fh:
            for step, msg in report:
                fh.write(f"[{step}] {msg}\n")

        context.close()
        browser.close()

print("\n=== DONE ===")
print(f"Report: {OUT}/report.txt")
print(f"Screenshots: {OUT}/")
