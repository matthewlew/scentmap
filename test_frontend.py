from playwright.sync_api import sync_playwright
import time

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.route("**/*", lambda route: route.continue_() if not route.request.url.startswith("https://") else route.abort())
        page.goto('http://localhost:8000/tests.html')
        time.sleep(2)
        page.evaluate("window.runAll()")
        page.wait_for_selector('#summary', timeout=10000)

        # Check if tests are passing
        fails = page.locator('.test-row.fail').all_inner_texts()
        for f in fails:
            print("Failed Test:", f.replace('\n', ' '))

        summary = page.locator('#summary').inner_text()
        print("Test summary:", summary.replace('\n', ' '))
        browser.close()

verify()
