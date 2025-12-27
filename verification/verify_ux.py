from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming default Vite port 5173)
        try:
            page.goto("http://localhost:5173", timeout=10000)
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Failed to load page: {e}")
            # Try 3000 just in case
            try:
                page.goto("http://localhost:3000", timeout=10000)
                page.wait_for_load_state("networkidle")
            except Exception as e2:
                print(f"Failed to load page on 3000: {e2}")
                return

        # 1. Verify aria-valuetext on year slider
        slider = page.locator('input[type="range"]')
        if slider.count() > 0:
            aria_valuetext = slider.get_attribute("aria-valuetext")
            print(f"Slider aria-valuetext: {aria_valuetext}")

            # Change value and check update
            slider.fill("2020")
            page.wait_for_timeout(100) # Wait for debounce
            aria_valuetext_updated = slider.get_attribute("aria-valuetext")
            print(f"Slider aria-valuetext updated: {aria_valuetext_updated}")
        else:
            print("Slider not found")

        # 2. Focus interaction on charts (taking screenshots)
        # We can't easily visualize focus in a headless screenshot unless we force it via CSS or JS,
        # but we can try to tab into elements.

        # Focus on a chart element if possible.
        # Since these are D3 SVGs, locating them might be tricky without specific IDs.
        # Let's try to focus the first bubble or bar.

        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        # Assuming tabs eventually reach the charts.

        # Taking a screenshot of the whole page to inspect generally.
        page.screenshot(path="verification/verification.png")
        print("Screenshot saved to verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
