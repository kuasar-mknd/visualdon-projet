from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Browser Error: {exc}"))

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for loading to finish
            try:
                page.wait_for_selector('role=status', state='detached', timeout=10000)
                print("Loading complete.")
            except:
                print("Timed out waiting for loading to finish.")

            # Check for Globe existence
            globe = page.locator('svg').first
            if globe.is_visible():
                print("Globe is visible.")
            else:
                print("Globe NOT visible.")

            # Check for Controls
            controls = page.get_by_label("Play animation")
            if controls.is_visible():
                print("Controls are visible.")

            # Take screenshot
            page.screenshot(path="verification/app_screenshot_debug.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
