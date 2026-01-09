from playwright.sync_api import sync_playwright

def verify_palette(page):
    # Go to app
    page.goto("http://localhost:5173")

    # Wait for loading to finish (wait for YearDisplay to show year)
    page.wait_for_selector("[role='status']", state="visible")

    # 1. Verify Header Language Buttons
    # Use exact match for EN button
    en_btn = page.get_by_role("button", name="EN", exact=True)
    en_btn.hover()
    title = en_btn.get_attribute("title")
    print(f"EN Button Title: {title}")
    assert title == "English"

    # 2. Verify Controls Year Input
    # Check aria-valuetext
    # The language might be French by default, so check for "Sélectionner l'année" or "Select year"
    try:
        slider = page.get_by_role("slider", name="Select year")
        slider.wait_for(timeout=2000)
    except:
        slider = page.get_by_role("slider", name="Sélectionner l'année")

    aria_valuetext = slider.get_attribute("aria-valuetext")
    print(f"Slider aria-valuetext: {aria_valuetext}")
    assert "Year" in aria_valuetext or "Année" in aria_valuetext

    # 3. Verify Globe Accessibility
    globe_svg = page.locator("svg[role='img']")
    aria_label = globe_svg.get_attribute("aria-label")
    print(f"Globe aria-label: {aria_label}")
    assert "globe" in aria_label.lower()

    # 4. Verify Footer Link
    # Check for French or English label
    try:
        footer_link = page.get_by_role("link", name="GitHub Repository")
        footer_link.wait_for(timeout=2000)
    except:
        # If language is French, the aria-label might differ if I didn't verify translation
        # But my code uses `aria-label={`GitHub Repository ${t('aria.openInNewTab')}`}`
        # Wait, "GitHub Repository" is hardcoded in English in the JSX?
        # Let's check Footer.jsx
        pass

    footer_link = page.locator("footer a")
    link_title = footer_link.get_attribute("title")
    print(f"Footer Link Title: {link_title}")
    assert "(opens in a new tab)" in link_title or "(ouvre un nouvel onglet)" in link_title

    # Take screenshot
    page.screenshot(path="/home/jules/verification/palette_verify.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_palette(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="/home/jules/verification/palette_fail.png")
            raise e
        finally:
            browser.close()
