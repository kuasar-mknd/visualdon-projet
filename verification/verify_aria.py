from playwright.sync_api import sync_playwright

def verify_year_slider_aria(page):
    print("Navigating to home page...")
    page.goto("http://localhost:5173")

    print("Waiting for controls...")
    # Wait for the slider to be present
    slider = page.wait_for_selector('input[type="range"]')

    print("Checking aria-valuetext...")
    # Get the aria-valuetext attribute
    aria_text = slider.get_attribute("aria-valuetext")
    print(f"aria-valuetext: {aria_text}")

    # Check if it matches expected format
    if not aria_text or ("Year" not in aria_text and "Année" not in aria_text):
        raise Exception(f"aria-valuetext missing or incorrect format: {aria_text}")

    print("Success: aria-valuetext is present and correct.")

    # Take a screenshot of the controls area
    controls = page.locator(".glass-panel-light").first
    controls.screenshot(path="verification/controls_aria.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_year_slider_aria(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
