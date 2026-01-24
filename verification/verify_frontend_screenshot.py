from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/")
    try:
        page.wait_for_selector(".bar-group", timeout=15000)
    except:
        print("Timeout waiting for data load")
        browser.close()
        exit(1)

    # Open Overlay
    page.locator(".bar-group").first.click()
    page.wait_for_selector("[role='dialog']")
    page.wait_for_timeout(2000)

    # Screenshot Bubble Chart
    page.screenshot(path="verification/bubble_chart.png")
    print("Screenshot saved: verification/bubble_chart.png")

    # Switch to Stacked
    page.locator("[role='radio']").nth(1).click()
    page.wait_for_timeout(2000)

    # Screenshot Stacked Chart
    page.screenshot(path="verification/stacked_chart.png")
    print("Screenshot saved: verification/stacked_chart.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
