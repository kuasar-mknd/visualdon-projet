from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app (assuming default Vite port)
            page.goto("http://localhost:5173")

            # Wait for the main content to load
            page.wait_for_selector("#main-content", state="visible")

            # Wait for data to load (loading spinner to disappear)
            # The loading spinner has role="status"
            page.wait_for_selector('[role="status"]', state="detached", timeout=30000)

            # Wait a bit for the globe and charts to render
            page.wait_for_timeout(2000)

            # Check if critical elements are present
            # Header
            header = page.locator('header')
            if not header.is_visible():
                print("Error: Header not visible")

            # Controls
            controls = page.locator('button[aria-label="Play animation"], button[aria-label="Pause animation"]')
            if not controls.first.is_visible():
                print("Error: Controls not visible")

            # Take screenshot
            page.screenshot(path="verification/app_loaded.png")
            print("Screenshot saved to verification/app_loaded.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
