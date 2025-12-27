from playwright.sync_api import sync_playwright

def verify_language_toggle():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate
        try:
            page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Error navigating: {e}")
            browser.close()
            return

        # Wait for header
        page.wait_for_selector('header')

        # Take a screenshot of the initial state
        header = page.locator('header')

        # Try to find the group by its role.
        # Since the label changes based on language (French default: "Changer de langue"),
        # we can just find the group inside the header without name restriction first
        # or use the French label.

        # First, let's see what we have.
        page.wait_for_timeout(1000) # Wait for hydration/translation

        # In FR mode
        header.screenshot(path="verification/header_initial_fr.png")

        # Find the EN button inside the header
        # We can select by role button and text "EN"
        en_button = header.get_by_role("button", name="EN")

        # Check if it is visible
        if en_button.is_visible():
            en_button.click()
            page.wait_for_timeout(500)
            header.screenshot(path="verification/header_switched_to_en.png")
        else:
            print("EN button not found")

        # Now in EN mode, the group label should be "Switch language"
        # Find FR button
        fr_button = header.get_by_role("button", name="FR")
        if fr_button.is_visible():
            fr_button.click()
            page.wait_for_timeout(500)
            header.screenshot(path="verification/header_switched_back_to_fr.png")
        else:
            print("FR button not found")

        browser.close()

if __name__ == "__main__":
    verify_language_toggle()
