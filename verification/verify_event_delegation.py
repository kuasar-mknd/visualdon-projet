from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        page.goto("http://localhost:5173")

        print("Waiting for globe to load...")
        page.wait_for_selector("path.country-path", timeout=30000)

        # Try to find a nice large country visible at 0,0
        # DZA (Algeria), MLI (Mali), NER (Niger), NGA (Nigeria)
        target_ids = ['DZA', 'MLI', 'NER', 'NGA', 'FRA']

        path = None
        for cid in target_ids:
            p = page.locator(f'path[data-id="{cid}"]')
            if p.count() > 0 and p.is_visible():
                path = p
                print(f"Found visible target: {cid}")
                break

        if not path:
             print("Specific targets not found or not visible, using first visible path")
             path = page.locator("path.country-path").first

        country_id = path.get_attribute("data-id")
        print(f"Targeting country: {country_id}")

        # Hover
        print(f"Hovering over {country_id}...")
        path.hover(force=True)
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/hover_state.png")
        print("Hover screenshot taken")

        # Click
        print(f"Clicking {country_id}...")
        path.click(force=True)

        # Check overlay
        try:
            expect(page.get_by_role("dialog")).to_be_visible(timeout=5000)
            print("Overlay visible!")
        except Exception as e:
            print(f"Overlay not visible: {e}")

            # Debug: check if any other element intercepted the click?
            # Or if event didn't fire.

        page.screenshot(path="verification/click_state.png")
        print("Click screenshot taken")

        browser.close()

if __name__ == "__main__":
    run()
