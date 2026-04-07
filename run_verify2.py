from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.goto('http://localhost:8000/app.html')
    # Set up some owned fragrances for layering
    page.evaluate('window.localStorage.setItem("owned", JSON.stringify(["another-13", "santal-33", "mojave-ghost"]))')

    # Reload and navigate to layering suggestions for another-13
    page.goto('http://localhost:8000/app.html#frag=another-13')

    page.wait_for_timeout(2000)
    page.evaluate('document.querySelector(".sheet").scrollTo(0, 1500)')
    page.wait_for_timeout(1000)
    page.screenshot(path='/home/jules/verification/layering_math_screenshot.png')

    # Go to comparison view
    page.goto('http://localhost:8000/app.html#compare/another-13/santal-33')
    page.wait_for_timeout(2000)
    page.evaluate('window.scrollTo(0, 500)')
    page.wait_for_timeout(1000)
    page.screenshot(path='/home/jules/verification/compare_math_screenshot.png')

    browser.close()
