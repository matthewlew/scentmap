from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            record_video_dir="verification/",
            viewport={'width': 480, 'height': 800}
        )
        page = context.new_page()

        # Navigate to a pre-filled comparison via deep-link
        page.goto("http://localhost:8000/app.html#compare/another-13/santal-33")
        page.wait_for_selector("#cmp-score-match", state="visible", timeout=10000)
        page.wait_for_timeout(500)

        # Click similarity score to open the education modal
        page.locator("#cmp-score-match").click()
        page.wait_for_selector(".cmp-edu-overlay.open", state="visible", timeout=5000)

        # Scroll to bottom
        page.evaluate("document.querySelector('.cmp-edu-body').scrollTo(0, document.querySelector('.cmp-edu-body').scrollHeight)")

        # Wait for any animations
        page.wait_for_timeout(1000)

        # Capture screenshot
        page.screenshot(path="verification/verification_scroll.png")

        # Click pairing to verify the other tab as well
        page.locator("#cmp-edu-close").click()
        page.wait_for_selector(".cmp-edu-overlay.open", state="hidden", timeout=5000)

        page.locator("#cmp-score-layer").click()
        page.wait_for_selector(".cmp-edu-overlay.open", state="visible", timeout=5000)

        # Scroll to bottom
        page.evaluate("document.querySelector('.cmp-edu-body').scrollTo(0, document.querySelector('.cmp-edu-body').scrollHeight)")

        # Wait for any animations
        page.wait_for_timeout(1000)

        # Capture screenshot
        page.screenshot(path="verification/verification_layering_scroll.png")

        # Close context and browser to save video
        context.close()
        browser.close()

if __name__ == "__main__":
    main()
