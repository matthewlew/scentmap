from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to the tests page
        page.goto('http://localhost:8000/tests.html')

        # Wait for the test app frame to load
        page.wait_for_timeout(2000)

        # Evaluate window.runAll()
        page.evaluate("window.runAll()")

        # Wait for summary
        page.wait_for_selector("#summary")

        # Get the summary text
        summary_text = page.locator("#summary").inner_text()
        print("Test Summary:")
        print(summary_text)

        # If there are failures, print them
        failed_tests = page.locator(".test-row.fail").all()
        if failed_tests:
            print(f"Found {len(failed_tests)} failed tests:")
            for fail in failed_tests:
                print(fail.inner_text())
        else:
            print("All tests passed.")

        browser.close()

if __name__ == "__main__":
    run_tests()