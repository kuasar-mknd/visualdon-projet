from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    # 1. Focus on Language Toggle
    # Wait for page to load
    page.wait_for_selector("button[title='English']")

    # Focus English button
    page.focus("button[title='English']")
    page.screenshot(path="verification/focus_header.png")

    # 2. Focus on View Mode Toggle (requires selecting a country first)
    # This might be tricky in a quick test without data mocking,
    # but we can check if the elements exist and have the classes.

    # 3. Focus on Timeline
    # The timeline is always visible
    page.focus("input[type='range']")
    page.screenshot(path="verification/focus_timeline.png")

    # 4. Check Globe Legend role
    legend = page.locator("div[role='region'][aria-label='Niveaux d\\'émissions']")
    # Note: Label depends on default language (French) -> "Niveaux d'émissions"
    # Or "Emissions Levels" if English.
    # Let's check if we can find it by role only first.
    legend_region = page.locator("div[role='region']")
    count = legend_region.count()
    print(f"Found {count} regions")

    # 5. Check Globe Hint aria-hidden
    hint = page.locator(".absolute.bottom-4.right-4")
    hidden_attr = hint.get_attribute("aria-hidden")
    print(f"Globe Hint aria-hidden: {hidden_attr}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
