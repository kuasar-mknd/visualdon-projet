from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/")
    page.wait_for_selector("body")

    print("Verifying A11y Batch Changes...")
    errors = []

    # 1. Header Language Toggles
    # Check for span with lang attribute inside buttons
    # Add a wait to ensure header is rendered
    page.wait_for_selector("header")

    en_btn = page.locator("button span[lang='en']")
    if en_btn.count() == 0:
        # Fallback check if the button itself has lang (though I implemented span)
        print("Warning: explicit span[lang='en'] not found")
        # Debug: print HTML of buttons
        print(page.locator("div[role='group']").inner_html())
        errors.append("Missing lang='en' on EN button")

    fr_btn = page.locator("button span[lang='fr']")
    if fr_btn.count() == 0:
        errors.append("Missing lang='fr' on FR button")

    # 2. CountryChart View Mode Toggles
    # Wait for TopCountriesChart data
    try:
        page.wait_for_selector(".bar-group", timeout=10000)
    except:
        print("Timeout waiting for TopCountriesChart bars. Data might be loading.")
        # If timeout, we can't proceed with overlay checks
        errors.append("Timeout loading data")
        return errors

    # Click the first bar to open overlay
    page.locator(".bar-group").first.click()

    # Wait for overlay
    try:
        page.wait_for_selector("[role='dialog']", timeout=5000)
    except:
        errors.append("Overlay did not open")
        return errors

    # Check Radio Group
    radiogroup = page.locator("[role='radiogroup']")
    if radiogroup.count() == 0:
        errors.append("Missing role='radiogroup' in CountryChart")

    radio_btns = page.locator("[role='radio']")
    if radio_btns.count() < 2:
         errors.append(f"Expected at least 2 radio buttons, found {radio_btns.count()}")
    else:
        # Verify aria-checked is present
        checked = radio_btns.first.get_attribute("aria-checked")
        if checked not in ["true", "false"]:
            errors.append("Missing aria-checked on radio button")

    # 3. Check Chart Titles (Bubble/Stacked) inside the overlay
    # Default view is Bubbles.
    # Check for BubbleChart title
    # Note: text might be "Émissions par Secteur" or "Emissions by Sector"
    # We look for ANY title tag inside the overlay's SVG

    # Wait for chart to render
    page.wait_for_timeout(2000)

    titles = page.locator("[role='dialog'] svg title")
    if titles.count() == 0:
        errors.append("Missing SVG title in BubbleChart")
    else:
        # Use text_content for SVG elements
        print(f"Found BubbleChart title: {titles.first.text_content()}")

    # Switch to Stacked
    # Find the radio button for 'Graphique empilé' (FR) or 'Stacked Chart' (EN)
    if radio_btns.count() >= 2:
        stacked_btn = radio_btns.nth(1)
        stacked_btn.click()

        page.wait_for_timeout(2000) # Wait for suspense/render

        titles_stacked = page.locator("[role='dialog'] svg title")
        # Note: The BubbleChart might still be in DOM if not unmounted, but React should replace it.
        # We assume the visible SVG has the title.

        # Verify title text contains "History" or "Historique"
        txt = titles_stacked.first.text_content()
        print(f"Found StackedChart title: {txt}")
        if "Historique" not in txt and "History" not in txt:
             errors.append(f"StackedChart title incorrect: {txt}")

    if len(errors) > 0:
        print("ERRORS FOUND:")
        for e in errors:
            print(f"- {e}")
        exit(1)
    else:
        print("ALL CHECKS PASSED")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
