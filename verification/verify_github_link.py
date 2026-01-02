from playwright.sync_api import sync_playwright, expect

def verify_github_link_aria_label():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navigate to the app
            page.goto("http://localhost:5173")

            # Wait for content to load
            page.wait_for_selector("footer")

            # 2. Check Default (French) aria-label
            footer_link = page.locator("footer a[href*='github.com']")
            aria_label_fr = footer_link.get_attribute("aria-label")
            print(f"Default (French) aria-label: {aria_label_fr}")

            if aria_label_fr != "Dépôt GitHub (s'ouvre dans un nouvel onglet)":
                print("❌ Default (French) aria-label mismatch!")
            else:
                print("✅ Default (French) aria-label correct.")

            # 3. Switch to English
            # Click the EN button
            en_button = page.get_by_role("button", name="EN")
            en_button.click()

            # Wait a bit for state update
            page.wait_for_timeout(1000)

            # 4. Check English aria-label
            aria_label_en = footer_link.get_attribute("aria-label")
            print(f"English aria-label: {aria_label_en}")

            if aria_label_en != "GitHub Repository (opens in a new tab)":
                print("❌ English aria-label mismatch!")
            else:
                print("✅ English aria-label correct.")

            # Take a screenshot for the record
            page.screenshot(path="verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_github_link_aria_label()
