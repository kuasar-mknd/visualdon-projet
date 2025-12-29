from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming default Vite port)
        try:
            page.goto("http://localhost:5173", timeout=30000)
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Failed to load page: {e}")
            browser.close()
            return

        print("Page loaded")

        # 1. Verify Header language toggle titles
        # Use exact match to avoid matching country paths ending in EN (e.g., BEN, SEN)
        en_button = page.get_by_role("button", name="EN", exact=True)
        fr_button = page.get_by_role("button", name="FR", exact=True)

        print(f"EN button title: {en_button.get_attribute('title')}")
        print(f"FR button title: {fr_button.get_attribute('title')}")

        # 2. Verify Select focus style
        # Use get_by_role 'combobox'
        category_select = page.get_by_role("combobox")
        # Force wait for element to be attached
        category_select.wait_for(state="attached")

        classes = category_select.get_attribute("class")
        if "focus-visible:ring-2" in classes:
            print("Success: Select has focus-visible:ring-2")
        else:
            print(f"Failure: Select classes: {classes}")

        # 3. Verify Range Input aria-valuetext
        # Wait for data load
        page.wait_for_timeout(2000)

        # Use get_by_role 'slider' and check first one if multiple (though likely unique)
        range_input = page.get_by_role("slider").first
        aria_valuetext = range_input.get_attribute("aria-valuetext")
        print(f"Range input aria-valuetext: {aria_valuetext}")

        # Taking a screenshot of the main view
        page.screenshot(path="verification/main_view.png")
        print("Screenshot saved to verification/main_view.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
