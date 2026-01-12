from playwright.sync_api import sync_playwright

def verify_a11y_attributes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173")

            # 1. Check App.jsx Loading state replacement (hard to catch in fast load, but we check structure)
            page.wait_for_selector("header")

            # 2. Check HeaderContent.jsx ARIA labels
            # Wait for translation to load/apply
            page.wait_for_selector("button:has-text('EN')")

            # Check attribute
            en_button = page.locator("button:has-text('EN')")
            aria_label = en_button.get_attribute("aria-label")
            print(f"EN Button Aria-Label: {aria_label}")

            if aria_label != "Passer en anglais":
                print("FAILURE: EN button aria-label incorrect.")

            # 3. Check Timeline.jsx aria-orientation
            slider = page.locator("input[type='range']")
            orientation = slider.get_attribute("aria-orientation")
            print(f"Slider Orientation: {orientation}")
            if orientation != "horizontal":
                 print("FAILURE: Slider missing aria-orientation='horizontal'")

            # 4. Check PlayControls.jsx select title
            select = page.locator("select")
            title = select.get_attribute("title")
            print(f"Select Title: {title}")
            # t('aria.selectCategory') in FR -> "Sélectionner la catégorie d'émission"
            if title != "Sélectionner la catégorie d'émission":
                print("FAILURE: Select missing title")

            # 5. Check Charts ARIA roles
            # Now using simpler role description: "graphique à barres"

            # Wait for the SVG to appear.
            page.wait_for_selector("svg[role='graphics-document']", timeout=15000)

            # Find the bar chart specifically by part of its description
            bar_chart = page.locator("svg[role='graphics-document'][aria-roledescription='graphique à barres']")

            if bar_chart.count() > 0:
                 print("Bar Chart Found with correct role description.")
            else:
                 print("FAILURE: Bar Chart not found or description mismatch.")
                 # Print all graphics documents to debug
                 graphics = page.locator("svg[role='graphics-document']").all()
                 for g in graphics:
                     print(f"Found graphic with desc: {g.get_attribute('aria-roledescription')}")

            # Globe
            # "globe 3D interactif"
            globe = page.locator("svg[role='img'][aria-roledescription='globe 3D interactif']")
            if globe.count() > 0:
                print("Globe Found with correct role description.")
            else:
                 print("FAILURE: Globe not found or description mismatch.")

            # Screenshot
            page.screenshot(path="verification/verification.png")
            print("Verification complete. Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_a11y_attributes()
