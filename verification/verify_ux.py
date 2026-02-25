from playwright.sync_api import sync_playwright

def verify_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector("text=VisualDon", timeout=10000) # Wait for page to load

            # 1. Check View Mode Buttons (CountryChart.jsx)
            # Find the radiogroup for view mode
            view_mode_group = page.get_by_role("radiogroup", name="Select View Mode") # Using English text as fallback if t() fails? No, app defaults to French?
            # Actually, I should check what text is used. The memory says default is French.
            # So "Sélectionner le mode d'affichage" maybe? Or just look for the buttons.

            # Let's take a screenshot of the whole page first to be safe.
            page.screenshot(path="verification/full_page.png")
            print("Full page screenshot taken.")

            # Focus on the language toggle
            en_button = page.get_by_role("radio", name="Switch to English")
            if not en_button.is_visible():
                 en_button = page.get_by_role("radio", name="Passer en anglais") # French label?

            if en_button.is_visible():
                en_button.focus()
                page.screenshot(path="verification/language_focus.png")
                print("Language toggle focus screenshot taken.")
            else:
                print("Could not find language toggle button.")

            # Focus on the view mode buttons (might need to select a country first?)
            # CountryChart only appears when a country is selected?
            # Let's select a country from the list.
            # TopCountriesChart lists countries.

            # Find a country in the list and click it.
            # TopCountriesChart uses role="listitem".
            first_country = page.locator(".bar-group").first
            if first_country.is_visible():
                first_country.click()
                # Wait for CountryChart to appear
                # It has "Select View Mode" or similar.
                # In French: "Sélectionner le mode de vue"?

                # Let's just wait for the bubble chart or stacked chart toggle.
                # Symbols: 🫧 and 📈

                page.wait_for_timeout(2000) # Wait for animation/load
                page.screenshot(path="verification/country_view.png")
                print("Country view screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_accessibility()
