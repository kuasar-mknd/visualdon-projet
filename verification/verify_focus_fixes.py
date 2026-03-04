from playwright.sync_api import sync_playwright

def verify_focus_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")
        page.wait_for_timeout(3000) # Wait for page to load despite missing token

        # 3. Take a screenshot of the skip-to-content link (by focusing it)
        page.keyboard.press("Tab")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/skip-link-focused.png")

        # 1. Take a screenshot of the Header language buttons
        page.keyboard.press("Tab") # Move past skip link
        page.keyboard.press("Tab") # Move to EN button
        page.wait_for_timeout(500)
        page.screenshot(path="verification/header-en-focused.png")

        page.keyboard.press("Tab") # Move to FR button
        page.wait_for_timeout(500)
        page.screenshot(path="verification/header-fr-focused.png")

        # 2. Take a screenshot of the Controls select element
        for _ in range(3): # Tab to select dropdown
            page.keyboard.press("Tab")

        page.wait_for_timeout(500)
        page.screenshot(path="verification/controls-select-focused.png")

        # 4. Take a screenshot of the footer
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        for _ in range(10): # Tab down to the footer link
             page.keyboard.press("Tab")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/footer.png")

        browser.close()

if __name__ == "__main__":
    verify_focus_fixes()
