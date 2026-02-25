from playwright.sync_api import sync_playwright

def verify_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector("text=Histoire des Émissions de CO2", timeout=10000)

            print("Page loaded.")

            # 1. Verify Language Toggle Group
            lang_group = page.get_by_role("radiogroup", name="Changer de langue") # Assuming "aria.toggleLanguage" translates to this or similar
            # Or try searching by role radiogroup generally
            radiogroups = page.get_by_role("radiogroup").all()
            print(f"Found {len(radiogroups)} radiogroups.")

            # 2. Click a country to show CountryChart
            # Find "Chine" in the list (it's the top one usually)
            china_bar = page.locator(".bar-group").first
            china_bar.click()
            print("Clicked first country bar.")

            # Wait for the chart to appear
            # Look for "Sélectionner le mode d'affichage" (Select View Mode)
            # Or just wait for the buttons "Bulles" (Bubbles) / "Graphique empilé" (Stacked Chart)

            page.wait_for_timeout(2000)

            # Check for the view mode radiogroup
            view_mode_group = page.get_by_role("radiogroup", name="Sélectionner le mode d'affichage")

            if view_mode_group.count() > 0:
                 print("Found View Mode radiogroup.")
                 view_mode_group.first.scroll_into_view_if_needed()
                 page.screenshot(path="verification/country_chart_view_mode.png")
            else:
                 print("Could not find View Mode radiogroup by name. Taking generic screenshot.")
                 page.screenshot(path="verification/country_chart_generic.png")

            # Verify hidden emojis
            # We can't easily check aria-hidden via screenshot, but we can check if they are rendered.
            # But the attribute check is better done via JS evaluation if needed.

            # Check for hidden SVGs in GlobeHint
            # Locate the hint container
            hint_container = page.locator("div.cursor-help").first
            # Check if SVG inside has aria-hidden
            is_hidden = hint_container.locator("svg").get_attribute("aria-hidden")
            print(f"GlobeHint SVG aria-hidden: {is_hidden}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_fixed.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_accessibility()
