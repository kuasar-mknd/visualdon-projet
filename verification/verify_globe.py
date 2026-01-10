from playwright.sync_api import sync_playwright

def verify_globe(page):
    # Go to app
    page.goto("http://localhost:5173")

    # Wait for the main content to appear, meaning loading is done.
    # We can check for a specific element that appears after loading, e.g., the Header or Controls
    page.wait_for_selector('#main-content', timeout=60000)

    # Wait for Globe to render (look for sphere-path)
    page.wait_for_selector('.sphere-path', timeout=60000)

    # Wait a bit for globe to initialize
    page.wait_for_timeout(3000)

    # Take screenshot
    page.screenshot(path="verification/globe_check.png")
    print("Screenshot saved to verification/globe_check.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_globe(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
