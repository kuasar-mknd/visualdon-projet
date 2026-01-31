from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173/")

        # Wait for page to load
        page.wait_for_selector("body")

        # Wait for data to load and chart to appear
        print("Waiting for chart...")
        page.wait_for_selector(".bar-group", timeout=15000)

        # Wait for Globe
        print("Waiting for globe...")
        # Try both English and French labels just in case, or generic selector
        page.wait_for_selector(".sphere-path", timeout=15000)

        # Check for will-change property on bar groups
        # We can evaluate JS
        will_change = page.evaluate("""() => {
            const el = document.querySelector('.bar-group');
            return window.getComputedStyle(el).willChange;
        }""")
        print(f"will-change value: {will_change}")

        if "transform" in will_change and "opacity" in will_change:
            print("PASSED: will-change is correct.")
        else:
            print("FAILED: will-change is incorrect.")

        page.screenshot(path="verification/verification.png", full_page=True)
        print("Screenshot saved.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
