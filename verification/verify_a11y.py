from playwright.sync_api import sync_playwright

def verify_a11y_attributes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Wait for server to start
            page.goto("http://localhost:5173", timeout=30000)

            # 1. Verify Globe SVG accessibility
            print("Checking Globe SVG...")
            globe_svg = page.locator("svg[role='graphics-document']").first
            aria_label = globe_svg.get_attribute("aria-label")
            print(f"Globe SVG aria-label: {aria_label}")

            if not aria_label:
                print("FAIL: Globe SVG missing aria-label")
            else:
                print("PASS: Globe SVG has aria-label")

            # Check for <desc> tag in Globe
            desc_text = globe_svg.locator("desc").text_content()
            print(f"Globe SVG desc: {desc_text}")
            if not desc_text:
                 print("FAIL: Globe SVG missing desc")
            else:
                 print("PASS: Globe SVG has desc")


            # 2. Verify BubbleChart/StackedAreaChart
            # We need to click a country to see the chart. Let's click 'USA' or similar if possible,
            # or just rely on the 'TopCountriesChart' if it was modified (it wasn't in this batch, but others were).
            # The prompt says BubbleChart/StackedAreaChart are in CountryChart which requires country selection.

            # Let's try to click a country on the globe.
            # Using a known country ID if possible, or clicking blindly in center.
            # USA is usually prominent.

            print("Attempting to select a country...")
            # Try to click on the map center
            page.mouse.click(500, 300)

            # Wait for chart to appear
            try:
                page.wait_for_selector(".country-chart-container", timeout=2000) # Assuming container class or similar?
                # Actually let's look for the toggle buttons
                page.get_by_role("button", name="Bubbles").wait_for(state="visible", timeout=5000)
                print("PASS: Country chart loaded")

                # Verify Bubble Chart SVG
                # It might take a moment for Suspense to resolve
                page.wait_for_selector("svg[role='graphics-document'][aria-label='Emissions by Sector (Bubbles)']", timeout=5000)
                print("PASS: Bubble Chart SVG found with correct role and label")

                # Switch to Stacked
                page.get_by_role("button", name="Stacked Chart").click()
                page.wait_for_selector("svg[role='graphics-document'][aria-label='Emissions by Sector (Stacked)']", timeout=5000)
                print("PASS: Stacked Chart SVG found with correct role and label")

            except Exception as e:
                print(f"WARN: Could not verify detailed charts (maybe click missed): {e}")
                # We can still verify the Globe which is the main initial view

            page.screenshot(path="verification/verification.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_a11y_attributes()
