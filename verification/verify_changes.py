
from playwright.sync_api import sync_playwright
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Wait for loading to finish
        try:
            page.wait_for_selector('text=Loading', state='hidden', timeout=10000)
        except:
            print("Loading indicator didn't disappear or wasn't found")

        print("App loaded")
        time.sleep(2) # Extra wait for animations

        # 2. Check "No Data" Contrast in Legend (GlobeLegend)
        # We can't easily check color via playwright logic without eval, but we can check existence
        # This is more for the screenshot

        # 3. Check "YEAR" label contrast (Header)
        # Capture header screenshot
        header = page.locator('header')
        header.screenshot(path="verification/header_contrast.png")
        print("Header screenshot taken")

        # 4. Check TopCountriesChart focus
        # Tab into the chart
        # Find the first bar group
        # Force focus on it

        first_bar = page.locator('.bar-group').first
        if first_bar.is_visible():
            first_bar.focus()
            print("Focused first bar")
            time.sleep(0.5) # Wait for transition
            # Capture chart screenshot
            chart = page.locator('.chart-group')
            # Take screenshot of the chart area
            page.locator('.glass-panel-light').nth(1).screenshot(path="verification/chart_focus.png")
            print("Chart focus screenshot taken")
        else:
            print("Bar group not found")

        # 5. Check Footer contrast
        footer = page.locator('footer')
        footer.screenshot(path="verification/footer_contrast.png")
        print("Footer screenshot taken")

        # 6. Check Globe cursor
        # Hover over globe
        globe = page.locator('svg').nth(1) # Assuming 2nd svg is globe? Header has svg icons
        # Actually Globe is in the middle panel.

        # Let's take a full page screenshot
        page.screenshot(path="verification/full_page.png")
        print("Full page screenshot taken")

        browser.close()

if __name__ == "__main__":
    verify_changes()
