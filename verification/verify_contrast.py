from playwright.sync_api import sync_playwright

def verify_contrast(page):
    # Navigate to the app
    page.goto("http://localhost:5173")

    # Wait for the app to load
    page.wait_for_selector("header")

    # Wait for data to load (YearDisplay should be visible)
    page.wait_for_selector(".text-3xl.font-mono")

    # 1. Verify Header Language Buttons (inactive state)
    # We look for the "FR" button which is inactive by default (EN is active)
    # Class should contain text-slate-600
    fr_btn = page.locator("button[title='Français']")
    fr_class = fr_btn.get_attribute("class")
    print(f"FR Button Class: {fr_class}")
    if "text-slate-600" not in fr_class:
        print("ERROR: FR button missing text-slate-600")
    else:
        print("PASS: FR button has text-slate-600")

    # 2. Verify CountryChart View Mode Buttons (inactive state)
    # Click a country to open the chart/overlay
    # We need to simulate a click on the globe or search.
    # Since Globe is canvas/svg, let's try to click a path if we can find one.
    # The GlobePaths use role="button" and aria-label.
    # Let's try to click 'USA' or 'United States'
    # Wait for globe paths to render
    page.wait_for_selector(".country-path")

    # Try to find a path with aria-label containing 'United States'
    usa_path = page.locator("path[aria-label='United States']")
    if usa_path.count() > 0:
        usa_path.first.click(force=True)
        print("Clicked USA path")

        # Wait for overlay
        page.wait_for_selector("div[role='dialog']")

        # Check View Mode buttons in CountryChart
        # Find button with text "Stacked Chart" (inactive by default)
        stacked_btn = page.get_by_role("button", name="Stacked Chart")
        stacked_class = stacked_btn.get_attribute("class")
        print(f"Stacked Btn Class: {stacked_class}")

        if "text-slate-600" not in stacked_class:
            print("ERROR: Stacked button missing text-slate-600")
        else:
            print("PASS: Stacked button has text-slate-600")

        # 3. Verify Helper Text
        helper_text = page.locator("div.text-xs.italic")
        helper_class = helper_text.get_attribute("class")
        if "text-slate-600" not in helper_class:
             print("ERROR: Helper text missing text-slate-600")
        else:
             print("PASS: Helper text has text-slate-600")

    # 4. Verify Globe Paths Title Attribute
    # Check if paths have 'title' attribute
    first_path = page.locator(".country-path").first
    title_attr = first_path.get_attribute("title")
    print(f"Path Title: {title_attr}")
    if not title_attr:
        print("ERROR: Globe path missing title attribute")
    else:
        print("PASS: Globe path has title attribute")

    # Take screenshot
    page.screenshot(path="verification/contrast_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_contrast(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
