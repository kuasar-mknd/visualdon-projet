from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming Vite runs on 5173)
        page.goto("http://localhost:5173")

        # Wait for data to load
        page.wait_for_selector(".animate-pulse", state="detached", timeout=30000)

        # Check for Language Toggle (FR/EN)
        # Use exact match to avoid matching countries like KEN, BEN, etc.
        expect(page.get_by_role("button", name="EN", exact=True)).to_be_visible()

        # If we can see EN button, the Header is rendered.

        # Now check Controls.
        # Maybe "Select Category" translation key is missing or different?
        # Let's try to find the select element directly
        expect(page.locator("select")).to_be_visible()

        page.screenshot(path="verification/optimizations.png")

        browser.close()

if __name__ == "__main__":
    run()
