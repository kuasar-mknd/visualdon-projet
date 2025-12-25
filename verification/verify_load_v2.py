import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Try port 3001
            page.goto("http://localhost:3001", timeout=30000)
            print("Navigated to app on 3001")

            # Check page title or any text
            print("Page title:", page.title())

            # Wait for content
            # Header might use translation keys initially if not loaded?
            # 'Visualisation des Émissions' is from 'subtitle' or 'title' in fr.json?
            # Default might be EN.

            page.wait_for_selector('body', timeout=5000)

            time.sleep(5)

            page.screenshot(path="verification/app_loaded_v2.png")
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_v2.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
