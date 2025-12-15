from playwright.sync_api import sync_playwright, expect

def verify_aria_labels():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        try:
            page.goto("http://localhost:5173", timeout=30000)
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Error navigating: {e}")
            browser.close()
            return

        # Check for ARIA labels on controls

        # 1. Play/Pause button
        # It initially shows 'Play' (Lecture)
        play_button = page.locator("button:has-text('Lecture')")
        if not play_button.count():
             play_button = page.locator("button:has-text('Play')")

        # Verify it has aria-label.
        # Note: Language defaults to French based on context
        aria_label = play_button.get_attribute("aria-label")
        print(f"Play button aria-label: {aria_label}")

        # 2. Select Category
        select_category = page.locator("select").first
        select_aria = select_category.get_attribute("aria-label")
        print(f"Select category aria-label: {select_aria}")

        # 3. Year Range
        range_input = page.locator("input[type='range']")
        range_aria = range_input.get_attribute("aria-label")
        print(f"Range input aria-label: {range_aria}")

        # 4. Language Toggle
        # Switch to English
        lang_toggle = page.locator("button", has_text="EN")
        toggle_aria = lang_toggle.get_attribute("aria-label")
        print(f"Language toggle aria-label: {toggle_aria}")

        # Take a screenshot of controls
        controls_panel = page.locator(".glass-panel-light").first
        controls_panel.screenshot(path="verification/controls_aria.png")

        browser.close()

if __name__ == "__main__":
    verify_aria_labels()
