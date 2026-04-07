from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    # Setup local storage
    page.goto('http://localhost:8000/app.html')
    page.evaluate('window.localStorage.setItem("owned", JSON.stringify(["another-13", "santal-33"]))')

    # Go to a detail page with layering
    page.goto('http://localhost:8000/app.html#frag=santal-33')
    page.wait_for_selector('.cmp-m-below-section')

    # Click to show layering if needed, or scroll
    page.evaluate('document.querySelector(".sheet").scrollTo(0, 2000)')
    page.wait_for_timeout(500)

    page.screenshot(path='/home/jules/verification/layering_math.png')

    # Go to comparison page
    page.goto('http://localhost:8000/app.html#compare/another-13/santal-33')
    page.wait_for_selector('#cmp-best-pairings')
    page.evaluate('window.scrollTo(0, 1000)')
    page.wait_for_timeout(500)

    page.screenshot(path='/home/jules/verification/compare_math.png')

    browser.close()
