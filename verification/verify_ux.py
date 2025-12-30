from playwright.sync_api import sync_playwright

def verify_ux_improvements():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming Vite default port 5173)
        page.goto("http://localhost:5173")

        # Wait for the app to load
        page.wait_for_selector("header")

        # 1. Verify Header Language Toggles have titles
        print("Verifying Header Language Toggles...")
        en_btn = page.get_by_role("button", name="EN")
        fr_btn = page.get_by_role("button", name="FR")

        assert en_btn.get_attribute("title") == "English", "EN button missing title 'English'"
        assert fr_btn.get_attribute("title") == "Français", "FR button missing title 'Français'"
        print("✅ Header Language Toggles verified.")

        # 2. Verify Controls Category Select has title
        print("Verifying Category Select...")
        # Note: Default language is FR, so title should be "Sélectionner la catégorie d'émission"
        select = page.locator("select")
        expected_title_fr = "Sélectionner la catégorie d'émission"
        actual_title = select.get_attribute("title")

        # Check against FR title (default)
        assert actual_title == expected_title_fr, f"Category select missing title. Expected '{expected_title_fr}', Found: '{actual_title}'"
        print("✅ Category Select verified.")

        # 3. Verify CountryChart view buttons have titles
        print("Verifying Chart View Buttons...")
        # Buttons are not visible until a country is selected? No, TopCountriesChart is always there, but CountryChart requires selection?
        # CountryChart says "Select a country to view details" if no country code.
        # But wait, the view mode toggle buttons are visible in CountryChart ONLY if country is selected?
        # Let's check CountryChart.jsx

        # <div className="w-full h-full flex flex-col">
        #   {/* View Mode Toggle */}
        #   <div className="flex items-center gap-3 mb-4 flex-wrap">

        # This whole block is AFTER `if (!countryCode) return ...`
        # So yes, we need to select a country first.

        # Let's select a country from the TopCountriesChart (which is visible)
        # Or click on the Globe? Globe is harder to click blindly.
        # TopCountriesChart has bars.

        # Wait for TopCountriesChart to render bars.
        # The data loads async.
        page.wait_for_selector(".bar-rect", timeout=10000)

        # Click the first bar
        page.locator(".bar-rect").first.click()

        # Now CountryChart should load.
        # Wait for the buttons.
        bubbles_btn = page.locator("button[title='Bulles']") # localized title in FR
        stacked_btn = page.locator("button[title='Graphique empilé']") # localized title in FR

        # Wait for them to appear
        bubbles_btn.wait_for(state="visible")

        assert bubbles_btn.get_attribute("title") == "Bulles", "Bubbles button missing title"
        assert stacked_btn.get_attribute("title") == "Graphique empilé", "Stacked Chart button missing title"
        print("✅ Chart View Buttons verified.")

        # 4. Verify Sector Checkbox has title
        print("Verifying Sector Checkbox...")
        # The checkbox is visible only in bubbles mode (default)
        # Title in FR: "Séparer par secteur"
        checkbox_label = page.locator("label[title='Séparer par secteur']")
        assert checkbox_label.is_visible(), "Sector checkbox label with title not found"
        print("✅ Sector Checkbox verified.")

        # 5. Screenshot
        page.screenshot(path="/home/jules/verification/ux_verification.png")
        print("📸 Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_ux_improvements()
