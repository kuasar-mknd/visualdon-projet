from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Wait for server to start
            page.goto("http://localhost:5173", timeout=60000)

            # Wait for ANY text content to load
            page.wait_for_load_state("networkidle")

            # Take screenshot of main page
            page.screenshot(path="verification/dashboard.png")
            print("Dashboard screenshot taken")

            # Check inputs exist
            year_input = page.locator('input[type="range"]')
            if year_input.is_visible():
                print("Year input visible")

            # Interact with the year input to test clamp/validation
            year_input.fill("2020")
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/dashboard_interacted.png")
            print("Interacted screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
