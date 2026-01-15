from playwright.sync_api import sync_playwright, expect
import time

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:5173", timeout=30000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        # Check for loading
        try:
             # Wait for Title (French or English)
             expect(page.get_by_text("Histoire des Émissions de CO2").or_(page.get_by_text("CO2 Emissions History"))).to_be_visible(timeout=20000)
        except Exception as e:
             print(f"Title not found: {e}")
             page.screenshot(path="verification/error_load_2.png")
             browser.close()
             return

        print("App loaded.")

        # Find slider
        slider = page.get_by_role("slider")
        if slider.count() > 0:
            slider = slider.first
            print("Found slider.")
            slider.fill("2000")
            time.sleep(1)

            # Check for 2000 value on slider
            expect(slider).to_have_value("2000")
            print("Slider updated to 2000.")
        else:
            print("Slider not found.")

        page.screenshot(path="verification/security_check.png")
        print("Screenshot taken.")
        browser.close()

if __name__ == "__main__":
    verify_changes()
