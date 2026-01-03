from playwright.sync_api import sync_playwright, expect
import time

def verify_controls_accessibility():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Navigate to app
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for loading to finish
            page.wait_for_selector("[role='status']", state="visible", timeout=10000)
            time.sleep(2)

            print("Verifying Year Slider accessibility...")
            slider = page.locator("input[type='range']")
            expect(slider).to_be_visible()

            # Get current year from the YearDisplay
            year_display = page.locator("[role='status'] div.text-3xl").first
            displayed_year = year_display.inner_text()
            print(f"Displayed Year on UI: {displayed_year}")

            # Check aria-valuetext matches the displayed year
            value_text = slider.get_attribute("aria-valuetext")
            print(f"Slider aria-valuetext: {value_text}")

            # Expected format: "Année [displayed_year]" (since default is FR)
            expected_text_fr = f"Année {displayed_year}"
            expected_text_en = f"Year {displayed_year}"

            if value_text != expected_text_fr and value_text != expected_text_en:
                 raise AssertionError(f"Mismatch! Expected '{expected_text_fr}' or '{expected_text_en}', got '{value_text}'")

            print("Verifying Category Select accessibility...")
            select = page.locator("select")
            expect(select).to_be_visible()

            title = select.get_attribute("title")
            print(f"Select title: {title}")

            if not title:
                raise AssertionError("Select element missing title attribute")

            # Take screenshot of the controls area
            controls_panel = page.locator(".glass-panel-light").first
            controls_panel.screenshot(path="verification/controls_panel.png")

            print("Verification successful!")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error_state.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_controls_accessibility()
