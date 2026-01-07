from playwright.sync_api import sync_playwright

def verify_ux_improvements():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173")

        # Wait for content to load
        page.wait_for_selector("h1")

        # 1. Verify Header subtitle contrast
        header_subtitle = page.locator("header p")
        # In Tailwind v4, classes are compiled, so we check computed style if possible,
        # or just class name existence. Checking class name is easier here.
        # But we really want to see it visually.

        # 2. Verify Controls year text
        controls = page.locator(".glass-panel-light").last # Assuming controls is the last panel

        # 3. Verify CountryChart theme (need to select a country first or check initial state)
        # Select 'China' to trigger chart loading
        # The Globe interaction is complex in headless, so we might need to rely on the 'TopCountriesChart'
        # clicking a bar in TopCountriesChart triggers selection.

        # Wait for TopCountriesChart to load bars
        page.wait_for_selector(".bar-group", timeout=10000)

        # Click the first bar
        page.locator(".bar-group").first.click()

        # Wait for overlay
        page.wait_for_selector("[role='dialog']")

        # Take a screenshot of the overlay which contains CountryChart
        page.screenshot(path="verification/ux_improvements.png")

        browser.close()

if __name__ == "__main__":
    verify_ux_improvements()
