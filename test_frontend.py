from playwright.sync_api import sync_playwright
import time

def test_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1200, "height": 800})

        # Go to a valid compare URL
        page.goto("http://localhost:8000/?c=byredo_mixed-emotions+byredo_accord-oud")

        # Wait for the view to load
        page.wait_for_selector(".cmp-pair-card", timeout=5000)
        time.sleep(2)

        # Take desktop screenshot
        page.screenshot(path="desktop_layout.png", full_page=True)

        # Click the chart to open the overlay
        page.locator("#cmp-score-character").click()
        page.wait_for_selector("#cmp-edu-overlay.open", timeout=5000)
        time.sleep(1)

        # Take overlay screenshot
        page.screenshot(path="desktop_overlay.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    test_frontend()
