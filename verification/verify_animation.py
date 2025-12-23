from playwright.sync_api import sync_playwright

def verify_animation_handlers():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173")

        # Wait for loading to finish
        page.wait_for_selector('role=status', state='detached')

        # Wait for the globe to appear
        globe = page.wait_for_selector('svg')

        # Try finding the button by its role only, the label might be translated or dynamic
        # The button is the first one in the controls.
        play_button = page.locator("button").first

        # Click play to trigger animation loop
        play_button.click()

        # Wait a bit for animation to run
        page.wait_for_timeout(2000)

        # Take a screenshot to verify it didn't crash and looks okay
        page.screenshot(path="verification/animation_check.png")

        # Click pause
        play_button.click()

        browser.close()

if __name__ == "__main__":
    verify_animation_handlers()
