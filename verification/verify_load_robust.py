from playwright.sync_api import sync_playwright

def verify_app_load_robust():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        # Increase timeout for initial load
        page.goto("http://localhost:5173", timeout=30000)

        # Take a screenshot immediately to see what's happening
        page.screenshot(path="verification/debug_initial.png")

        print("Waiting for ANY content...")
        # Wait for the main container
        page.wait_for_selector("#main-content", timeout=10000)

        print("Taking verification screenshot...")
        page.screenshot(path="verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_app_load_robust()
