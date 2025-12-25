import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to app
        try:
            page.goto("http://localhost:3000", timeout=30000)
            print("Navigated to app")

            # Wait for content to load
            page.wait_for_selector('text=Visualisation des Émissions', timeout=10000)
            print("Header loaded")

            # Wait for Globe canvas/svg
            page.wait_for_selector('svg', timeout=10000)
            print("Globe SVG loaded")

            # Interact with Controls (Slider)
            slider = page.locator('input[type="range"]')
            slider.click()
            print("Clicked slider")

            time.sleep(2) # Wait for debounce/render

            page.screenshot(path="verification/app_loaded.png")
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
