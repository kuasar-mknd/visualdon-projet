from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Wait for Globe
        globe = page.locator("svg[role='img']")
        expect(globe).to_be_visible(timeout=10000)

        # Wait for Top Countries Chart
        chart = page.locator("svg[role='graphics-document']")
        expect(chart).to_be_visible()

        print("Page loaded and charts visible.")

        # Screenshot Initial
        page.screenshot(path="verification/1_initial.png")

        # Test Zoom (updates glow circle)
        # Center of screen is likely where globe is.
        # Globe container is 8 columns out of 12.
        # Let's target the globe element.
        box = globe.bounding_box()
        if box:
            cx = box['x'] + box['width'] / 2
            cy = box['y'] + box['height'] / 2
            page.mouse.move(cx, cy)
            page.mouse.wheel(0, -1000) # Zoom in
            time.sleep(1) # Wait for zoom transition/update

            print("Zoomed in.")
            page.screenshot(path="verification/2_zoomed.png")

        # Test Overlay (Click a country)
        # Try to find a country path.
        # USA usually has large area.
        usa = page.locator("path[aria-label='United States of America']").first
        if not usa.is_visible():
            usa = page.locator("path[aria-label='United States']").first

        if usa.is_visible():
            usa.click(force=True)
            print("Clicked USA.")

            overlay = page.locator("div[role='dialog']")
            expect(overlay).to_be_visible(timeout=5000)
            print("Overlay visible.")
            time.sleep(1) # Wait for animation
            page.screenshot(path="verification/3_overlay.png")
        else:
            print("USA path not found/visible.")
            # Try clicking center
            page.mouse.click(cx, cy)
            time.sleep(1)
            page.screenshot(path="verification/3_click_center.png")

        browser.close()

if __name__ == "__main__":
    run()
