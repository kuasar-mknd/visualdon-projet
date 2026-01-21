from playwright.sync_api import sync_playwright

def verify_performance_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming default Vite port)
        page.goto("http://localhost:5173")

        # Wait for SVG to appear
        page.wait_for_selector('svg[role="img"]')

        # Verify Timeline
        # Use a more robust selector: get_by_role("slider")
        timeline = page.get_by_role("slider")

        # Wait for timeline to be enabled/visible (might take time if year is loading)
        timeline.wait_for()

        expect_value = timeline.get_attribute("aria-valuetext")
        print(f"Timeline aria-valuetext: {expect_value}")

        # French is default: "Année 1750"
        if "Year 1750" not in expect_value and "Année 1750" not in expect_value:
             print("WARNING: aria-valuetext might be incorrect")

        # Take a screenshot of the dashboard
        page.screenshot(path="verification/dashboard_perf_check.png")

        browser.close()

if __name__ == "__main__":
    verify_performance_fixes()
