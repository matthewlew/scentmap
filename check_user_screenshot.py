from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1200, "height": 800})
        page.goto("http://localhost:8000/index.html")
        page.wait_for_timeout(1000)

        gear = page.locator("#settings-btn")
        gear.click()
        page.wait_for_timeout(500)
        page.screenshot(path="my_menu.png")

        browser.close()

if __name__ == "__main__":
    run()
