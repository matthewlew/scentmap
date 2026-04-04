from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # Navigate to a comparison deep-link
        page.goto('http://localhost:8000/app.html#compare/santal-33/another-13')

        # Wait for the results container to load
        page.wait_for_selector('.cmp-pair-card-scores')
        page.wait_for_timeout(1000)

        # Screenshot
        page.screenshot(path='/home/jules/verification/verification.png', full_page=True)
        browser.close()

if __name__ == "__main__":
    verify()
