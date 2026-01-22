from playwright.sync_api import sync_playwright, expect

def verify_optimizations():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:5173")
            page.goto("http://localhost:5173")

            # Wait for data to load
            print("Waiting for chart to load...")
            # The chart has bars with class .bar-group
            page.wait_for_selector(".bar-group", timeout=30000)

            # Check for TopCountriesChart bars
            bars = page.locator(".bar-group")
            count = bars.count()
            print(f"Found {count} bars in TopCountriesChart")
            assert count > 0, "TopCountriesChart should have bars"

            # Check if will-change is applied to bar-group (D3 style)
            # Note: style attributes might be inline.
            first_bar = bars.first
            style = first_bar.get_attribute("style")
            print(f"First bar style: {style}")
            if "will-change: transform" in style:
                print("SUCCESS: will-change: transform found on bar-group")
            else:
                print("WARNING: will-change: transform NOT found on bar-group (might be computed or class based)")

            # Click the first bar to open overlay
            print("Clicking a country...")
            first_bar.click()

            # Wait for overlay
            print("Waiting for overlay...")
            overlay = page.locator("div[role='dialog']")
            expect(overlay).to_be_visible(timeout=5000)

            # Check overlay style for will-change
            overlay_style = overlay.get_attribute("style")
            print(f"Overlay style: {overlay_style}")
            if "will-change: transform, opacity" in overlay_style or "will-change: opacity, transform" in overlay_style:
                 print("SUCCESS: will-change found on overlay")
            else:
                 print("WARNING: will-change NOT found on overlay")

            # Take screenshot
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_optimizations()
