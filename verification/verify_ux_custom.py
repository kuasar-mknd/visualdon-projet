from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for TopCountriesChart to render
            print("Waiting for chart...")
            expect(page.locator(".chart-group")).to_be_visible(timeout=10000)

            # Wait for data to load and bars to appear
            expect(page.locator(".bar-group").first).to_be_visible(timeout=10000)

            print("Chart visible. Taking screenshot...")
            page.screenshot(path="verification/performance_fix_screenshot.png")

            print("Verification complete.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_screenshot.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
