from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local preview server
        page.goto("http://localhost:3000")

        # Wait for the main app to load (checking for the skip link or header)
        page.wait_for_selector("#main-content", state="visible", timeout=10000)

        # Open browser console to capture any logs (though our logger suppresses them in prod)
        logs = []
        page.on("console", lambda msg: logs.append(f"{msg.type}: {msg.text}"))

        # Interact a bit to trigger any potential logs or errors
        # Click on the play button
        play_button = page.locator("button[aria-label*='Play']").first
        if play_button.is_visible():
            play_button.click()
            page.wait_for_timeout(1000)

        # Take a screenshot
        page.screenshot(path="verification/app_running.png")

        print("Console logs during run:")
        for log in logs:
            print(log)

        browser.close()

if __name__ == "__main__":
    verify_frontend()
