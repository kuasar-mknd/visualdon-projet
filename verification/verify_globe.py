from playwright.sync_api import sync_playwright

def verify_globe_render():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173/")

            # Wait for loading to finish (Year display appears)
            print("Waiting for data load...")
            page.wait_for_selector('role=status', state='hidden', timeout=30000)

            # Wait for Globe canvas/svg to be visible
            print("Waiting for Globe...")
            page.wait_for_selector('path.sphere-path', timeout=10000)

            # Check if countries are rendered
            print("Checking countries...")
            countries = page.locator('path.country-path').count()
            print(f"Found {countries} countries")

            if countries == 0:
                raise Exception("No countries rendered!")

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/globe_render.png")
            print("Screenshot saved to verification/globe_render.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_globe_render()
