from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app
            page.goto("http://localhost:5173")

            # Wait for any SVG content (charts, globe)
            page.wait_for_selector("svg", timeout=15000)

            # Use a more generic text wait
            page.wait_for_selector("body", timeout=15000)

            # Take a screenshot
            page.screenshot(path="verification/frontend_check.png")
            print("Screenshot taken successfully")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_frontend()
