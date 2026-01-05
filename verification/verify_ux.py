from playwright.sync_api import sync_playwright, expect
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:4173/")

            # Wait for loading to finish - wait for the main content to be visible
            # The loading indicator is removed when data is loaded.
            print("Waiting for main content...")
            page.wait_for_selector('#main-content', timeout=20000)
            print("App loaded.")

            # Wait for TopCountriesChart to be visible
            print("Waiting for chart...")
            page.wait_for_selector(".chart-group", timeout=10000)

            # Click on the first bar in TopCountriesChart to select a country
            print("Selecting a country...")
            # We need to target the rect or the group correctly
            # Let's try to click the first rect inside .bar-group
            first_bar = page.locator(".bar-group rect").first
            first_bar.click()

            # Wait for CountryDetailsOverlay
            print("Waiting for overlay...")
            page.wait_for_selector('[role="dialog"]', timeout=5000)

            # Inside the overlay, we should see the CountryChart
            # We need to check the "Split by Sector" checkbox style
            print("Checking checkbox style...")
            # Wait for the label to be visible
            checkbox_label = page.locator('label').filter(has_text="Split by Sector").first
            # Note: The text might be "Séparer par secteur" if language is FR (default)
            if not checkbox_label.is_visible():
                 checkbox_label = page.locator('label').filter(has_text="Séparer par secteur").first

            if checkbox_label.is_visible():
                print("Checkbox found.")
                # Wait for view mode toggle to be visible and ensure we are in 'bubbles' mode (default)
                # Try finding button by French or English text
                bubbles_btn = page.get_by_role("button", name="Bubbles")
                if not bubbles_btn.is_visible():
                     bubbles_btn = page.get_by_role("button", name="Bulles")

                if bubbles_btn.is_visible():
                     bubbles_btn.click()

                # Take screenshot of the checkbox area
                checkbox_label.scroll_into_view_if_needed()
                page.screenshot(path="verification/checkbox_style.png")
                print("Screenshot 'checkbox_style.png' taken.")

                # Now switch to Stacked Area Chart to check localized axes
                print("Switching to Stacked Chart...")
                stacked_btn = page.get_by_role("button", name="Stacked Chart")
                if not stacked_btn.is_visible():
                     stacked_btn = page.get_by_role("button", name="Graphique empilé")

                stacked_btn.click()

                # Wait for transition
                time.sleep(2)

                page.screenshot(path="verification/stacked_chart_labels.png")
                print("Screenshot 'stacked_chart_labels.png' taken.")
            else:
                print("Checkbox not found. Taking screenshot of overlay.")
                page.screenshot(path="verification/overlay_debug.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_changes()
