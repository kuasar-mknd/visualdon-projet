from playwright.sync_api import sync_playwright
import time

def verify(page):
    print("Navigating to home...")
    page.goto("http://localhost:5173")

    print("Waiting for chart to load...")
    # Wait for at least one bar group to be visible
    page.wait_for_selector(".bar-group", timeout=20000)

    # 1. Verify TopCountriesChart interaction (Delegation)
    print("Hovering over first bar...")
    bars = page.locator(".bar-group")
    count = bars.count()
    print(f"Found {count} bars.")
    if count == 0:
        raise Exception("No bars found")

    first_bar = bars.first
    first_bar.hover()
    time.sleep(1) # Wait for transition/tooltip logic

    # Check if opacity changed (visual verification via screenshot)
    page.screenshot(path="verification/screenshot_top_countries.png")
    print("Screenshot 1 taken.")

    # 2. Open Overlay (Click bar)
    print("Clicking first bar to open overlay...")
    first_bar.click()

    print("Waiting for overlay and bubbles...")
    page.wait_for_selector(".bubble", timeout=20000)

    # 3. Verify BubbleChart interaction (Delegation)
    print("Hovering over a bubble...")
    bubbles = page.locator(".bubble")
    bubble_count = bubbles.count()
    print(f"Found {bubble_count} bubbles.")

    if bubble_count > 0:
        target_bubble = bubbles.nth(bubble_count // 2) # Middle bubble
        target_bubble.hover()
        time.sleep(1)
        page.screenshot(path="verification/screenshot_bubble.png")
        print("Screenshot 2 taken.")
    else:
        print("No bubbles found?")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
