from playwright.sync_api import sync_playwright, expect
import time

def verify_app(page):
    # Go to app
    page.goto("http://localhost:5173")

    # Wait for year display to appear (indicating data loaded)
    # The loading spinner has role="status", but so does the YearDisplay
    # We should wait for the specific loading text to disappear

    # Wait for "Loading..." to detach
    try:
        page.get_by_text("Loading...", exact=False).wait_for(state="detached", timeout=20000)
    except:
        print("Loading indicator stuck?")

    # Wait for Globe
    expect(page.get_by_role("img", name="Globe visualization")).to_be_visible(timeout=30000)

    # Wait for Chart
    expect(page.get_by_role("graphics-document")).to_be_visible()

    # Take screenshot
    page.screenshot(path="verification/app_loaded.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_app(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
