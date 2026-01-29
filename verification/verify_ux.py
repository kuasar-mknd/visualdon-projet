from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    # 1. Verify default language is French (context default)
    # Wait for page to load
    page.wait_for_selector("body")

    # Check html lang attribute
    lang = page.evaluate("document.documentElement.lang")
    print(f"Initial lang: {lang}")
    if lang != 'fr':
        print("Expected initial lang to be 'fr'")

    # 2. Click 'Switch to English'
    # Since we are in French, the label is "Passer à l'anglais"
    # Wait for the button to appear

    # Debug: print all buttons
    # buttons = page.get_by_role("button").all()
    # for b in buttons:
    #    print(f"Button: {b.get_attribute('aria-label')} | {b.inner_text()}")

    if lang == 'fr':
        en_btn = page.get_by_label("Passer à l'anglais")
    else:
        en_btn = page.get_by_label("Switch to English")

    en_btn.click()

    # 3. Verify language changed to English
    # Wait for the html lang to change
    page.wait_for_function("document.documentElement.lang === 'en'")
    print("Language switched to 'en'")

    # 4. Verify TopCountriesChart rows have hit area
    # Wait for chart to render (might take time for data to load)
    # We can wait for "United States" or similar text in the chart
    try:
        page.wait_for_selector(".bar-group", timeout=10000)
    except:
        print("Timeout waiting for bar-group. Check data loading.")

    # Check if the transparent rect exists
    # We look for a rect with fill="transparent" inside a .bar-group
    hit_area_count = page.locator(".bar-group rect[fill='transparent']").count()
    print(f"Found {hit_area_count} hit areas")

    if hit_area_count == 0:
        print("FAILED: No transparent hit areas found in chart rows.")
    else:
        print("PASSED: Hit areas found.")

    # Take screenshot of the chart area
    page.screenshot(path="verification/ux_verification.png", full_page=True)
    print("Screenshot saved to verification/ux_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
