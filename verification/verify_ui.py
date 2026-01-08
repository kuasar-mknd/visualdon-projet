from playwright.sync_api import sync_playwright

def verify_controls_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming standard Vite port 5173)
        page.goto("http://localhost:5173")

        # Wait for the controls to be visible
        # We can look for the year slider or the play button
        page.wait_for_selector('input[type="range"]')

        # Take a screenshot of the controls area
        # We target the controls container
        controls = page.locator('.glass-panel-light').first
        controls.screenshot(path="verification/controls_ui.png")

        # Verify aria-valuetext exists on the slider
        slider = page.locator('input[type="range"]')
        aria_valuetext = slider.get_attribute("aria-valuetext")
        print(f"ARIA Valuetext: {aria_valuetext}")

        if not aria_valuetext:
            print("ERROR: aria-valuetext is missing!")
        elif "Year" not in aria_valuetext and "Année" not in aria_valuetext:
             # Depending on default language which is French in memory
            print(f"ERROR: aria-valuetext '{aria_valuetext}' does not contain 'Year' or 'Année'")
        else:
            print("SUCCESS: aria-valuetext is present and correct.")

        browser.close()

if __name__ == "__main__":
    verify_controls_ui()
