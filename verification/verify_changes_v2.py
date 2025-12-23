
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

        # 2. Check "YEAR" label contrast (Header)
        # Capture header screenshot
        header = page.locator('header')
        header.screenshot(path="verification/header_contrast.png")
        print("Header screenshot taken")

        # 3. Check TopCountriesChart focus
        # Find the chart group
        chart_svg = page.locator('svg[role="graphics-document"]').first
        if chart_svg.is_visible():
             # Find first bar
             first_bar = chart_svg.locator('.bar-group').first
             if first_bar.is_visible():
                 first_bar.focus()
                 print("Focused first bar")
                 time.sleep(0.5) # Wait for transition
                 # Screenshot the chart
                 chart_svg.screenshot(path="verification/chart_focus_corrected.png")
                 print("Chart focus screenshot taken")
             else:
                 print("Bar group not found inside chart")
        else:
            print("Chart SVG not found")

        # 4. Check Footer contrast
        footer = page.locator('footer')
        footer.screenshot(path="verification/footer_contrast.png")
        print("Footer screenshot taken")

        # 5. Check Globe interactions (screenshot whole app to see context)
        page.screenshot(path="verification/full_page_v2.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
