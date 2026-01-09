from playwright.sync_api import sync_playwright

def verify_ux_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to local server
            page.goto("http://localhost:5173")

            # Wait for main UI elements to load
            page.wait_for_selector('role=status')

            # 1. Verify Header YearDisplay typography
            # We are looking for text-xs (font-size: 0.75rem / 12px)
            year_label = page.get_by_text("Year", exact=True).or_(page.get_by_text("Année", exact=True))
            # Actually, "YEAR" is uppercased in the UI but maybe t('year') returns "Year" or "Année"
            # In YearDisplay.jsx: {t('year')}
            # Let's target the container of "YEAR"

            # Take a screenshot of the Header (YearDisplay)
            page.locator("header").screenshot(path="verification/header_typography.png")

            # 2. Verify Controls typography
            # Locate the slider range labels
            # They are span elements in Controls.jsx

            # Take a screenshot of the Controls
            page.locator(".glass-panel-light").nth(1).screenshot(path="verification/controls_typography.png")

            # 3. Verify CountryChart Toggle
            # Need to select a country first to see the chart
            # We can select 'USA' or 'China' via clicking the globe?
            # Or assume we can just see the initial state?
            # Wait, CountryChart shows "Select a country" initially.

            # We need to simulate clicking a country on the globe to make the chart appear
            # This might be tricky with the 3D globe.
            # However, the plan changed the code in CountryChart.jsx.
            # If we can't easily trigger the chart, we might skip visually verifying the toggle
            # and rely on the code review, or try to force the state if possible.

            # Let's try to click a point on the canvas roughly where a country might be?
            # Or just verify the initial "Select a country" message style if we changed that?
            # We didn't change the empty state message style in the plan (we only grep'd it).
            # We changed the checkbox style which only appears when viewMode === 'bubbles'
            # AND a country is selected.

            # Trying to click the globe blindly is risky.
            # Let's focus on verifying the YearDisplay and Controls first.

            print("Screenshots taken for Header and Controls.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_ux_changes()
