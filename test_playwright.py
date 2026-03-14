from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:8000/tests.html')
    page.wait_for_timeout(3000)
    page.evaluate('window.runAll()')
    page.wait_for_selector('#summary')
    summary = page.locator('#summary').inner_text()
    print("Test Summary:", summary)
    browser.close()
