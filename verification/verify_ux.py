from playwright.sync_api import sync_playwright, expect
import time

def verify_ux_improvement():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800}) # Set a viewport

        # Navigate to the local dev server
        page.goto("http://localhost:5173")

        # Wait for the page to load
        page.wait_for_load_state("networkidle")

        # Wait for TopCountriesChart to render bars
        # The bars have class 'bar-group'
        bar = page.locator(".bar-group").first
        bar.wait_for(state="visible", timeout=20000)

        print("Bars are visible. Clicking...")
        # Click the first bar to select a country
        bar.click(force=True)

        # Wait for the overlay to appear
        # The overlay has role="dialog"
        overlay = page.get_by_role("dialog")
        overlay.wait_for(state="visible", timeout=5000)

        print("Overlay visible.")

        # Check if the "Split by Sector" checkbox exists
        # In French it might be "Répartition par secteur" or similar
        # We look for the checkbox input and its parent label
        checkbox_label = page.locator("label:has(input[type='checkbox'])")
        expect(checkbox_label).to_be_visible()

        # Take a screenshot of the overlay with the new checkbox style
        page.screenshot(path="verification/ux_improvement_overlay.png")

        print("Screenshot taken at verification/ux_improvement_overlay.png")
        browser.close()

if __name__ == "__main__":
    verify_ux_improvement()
