from playwright.sync_api import sync_playwright, expect

def verify_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to homepage...")
            page.goto("http://localhost:5173", timeout=60000)

            # Wait for title
            print("Checking title...")
            expect(page).to_have_title("Global CO2 Emissions Visualization | VisualDon")

            # Wait for header
            header = page.get_by_role("heading", level=1)
            expect(header).to_be_visible()

            print("Taking screenshot...")
            page.screenshot(path="verification/homepage.png")
            print("Screenshot saved to verification/homepage.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_homepage()
