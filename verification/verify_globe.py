from playwright.sync_api import sync_playwright

def verify_globe_render():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to local server
            page.goto("http://localhost:5173")

            # Set viewport large enough for side-by-side layout (Desktop)
            page.set_viewport_size({"width": 1400, "height": 900})

            # Wait for the Globe to be visible (it's lazy loaded)
            # The sphere path is a good indicator
            page.wait_for_selector(".sphere-path", timeout=10000)

            # Wait a bit for animation loop to settle/render
            page.wait_for_timeout(1000)

            # Take a screenshot of the whole page
            page.screenshot(path="verification/globe_desktop.png")
            print("Desktop screenshot taken.")

            # Now simulate a resize to a smaller window (Tablet)
            page.set_viewport_size({"width": 800, "height": 1000})

            # Wait for debounce (100ms) and re-render
            page.wait_for_timeout(1000)

            # Scroll to the globe if necessary (it might be below fold now)
            globe_locator = page.locator(".sphere-path").first
            globe_locator.scroll_into_view_if_needed()

            # Take screenshot
            page.screenshot(path="verification/globe_tablet_resized.png")
            print("Tablet resized screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_globe_render()
