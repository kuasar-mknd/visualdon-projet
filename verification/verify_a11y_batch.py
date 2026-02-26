from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to local app
        page.goto("http://localhost:5173")
        try:
             page.wait_for_selector("h1", timeout=10000)
             print("Found H1 title")
        except:
             print("Could not find H1 title")
             browser.close()
             return

        # 1. Verify PlayControls select
        select = page.locator("select").first
        title = select.get_attribute("title")
        print(f"Select title: {title}")

        # 2. Verify Timeline badge aria-hidden
        timeline_badge = page.locator(".text-blue-600.bg-blue-50").first
        aria_hidden = timeline_badge.get_attribute("aria-hidden")
        print(f"Timeline badge aria-hidden: {aria_hidden}")

        # 3. Verify Globe keyboard hint
        try:
            # The span is sr-only, so use get_by_role or id
            globe_desc = page.locator("#globe-controls-desc")
            if globe_desc.count() > 0:
                 print(f"Globe desc text: {globe_desc.text_content()}")
            else:
                 print("Globe desc element not found")
        except:
            print("Globe desc check failed")

        # 4. Verify Close Button attributes (open overlay first)
        try:
            # Wait for any chart group to appear
            page.wait_for_selector(".bar-group", timeout=10000)
            page.locator(".bar-group").first.click()

            # Wait for overlay animation
            time.sleep(1)

            # Use specific aria-label which is language dependent, or class
            close_btn = page.locator("button.bg-white\\/50")

            if close_btn.count() > 0:
                 print(f"Close button title: {close_btn.first.get_attribute('title')}")
                 print(f"Close button shortcuts: {close_btn.first.get_attribute('aria-keyshortcuts')}")
            else:
                 print("Close button not found")

        except Exception as e:
            print(f"Could not verify overlay: {e}")

        page.screenshot(path="verification/a11y_batch.png")
        browser.close()

if __name__ == "__main__":
    run()
