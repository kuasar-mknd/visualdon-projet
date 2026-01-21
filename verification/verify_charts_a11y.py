import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173")

    # 1. Switch to English to ensure predictable text
    # Wait for the EN button
    try:
        page.get_by_text("EN", exact=True).click()
        print("Switched to English")
        time.sleep(1)
    except:
        print("Could not switch to English, continuing...")

    # 2. Open Overlay by clicking a country in Top 10 list
    # The bars have class 'bar-group' or role 'listitem'
    print("Clicking a country to open overlay...")
    # Wait for the chart to render
    page.wait_for_selector(".bar-group", state="visible")
    # Click the first one
    page.locator(".bar-group").first.click()

    # 3. Wait for overlay
    print("Waiting for overlay...")
    page.wait_for_selector("[role='dialog']", state="visible")

    # 4. Wait for 'Bubbles' button (indicates CountryChart is ready)
    # The overlay might take a moment to fetch data and show the chart
    print("Waiting for chart controls...")
    # 'Bubbles' text is in the button
    page.wait_for_selector("text=Bubbles", state="visible")

    # 5. Verify Bubble Chart Accessibility
    print("Verifying Bubble Chart Accessibility...")

    # Ensure we are in Bubbles mode
    page.get_by_role("button", name="Bubbles").click()
    time.sleep(2) # Wait for D3 transition

    # Check for title element in Bubble Chart SVG
    # The chart is inside the dialog
    overlay = page.locator("[role='dialog']")
    bubble_title = overlay.locator("svg title").first
    bubble_title.wait_for(state="attached")

    print(f"Bubble Chart Title: {bubble_title.text_content()}")

    # Screenshot Bubble Chart
    page.screenshot(path="verification/bubble_chart_a11y.png")

    # 6. Verify Stacked Area Chart Accessibility
    print("Verifying Stacked Area Chart Accessibility...")
    page.get_by_role("button", name="Stacked Chart").click()
    time.sleep(2) # Wait for D3 transition

    # Check for title element in Stacked Chart SVG
    stacked_title = overlay.locator("svg title").first
    stacked_title.wait_for(state="attached")
    print(f"Stacked Chart Title: {stacked_title.text_content()}")

    # Screenshot Stacked Chart
    page.screenshot(path="verification/stacked_chart_a11y.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
