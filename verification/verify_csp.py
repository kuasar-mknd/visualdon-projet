from playwright.sync_api import sync_playwright

def verify_app(page):
    page.goto("http://localhost:3000")
    # Wait for the app to load
    page.wait_for_selector('h1', state='visible')

    # Check if the title is present (verifying the app loaded correctly)
    # The title text depends on language but we can check for a common element
    # The H1 should be visible

    # Take a screenshot to verify the app renders
    page.screenshot(path="verification/app_screenshot.png")

    # Also we want to verify the CSP is present in the meta tags
    # We can do this by executing javascript or checking the page content
    csp_content = page.evaluate("document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]').content")
    print(f"CSP Content: {csp_content}")

    if "default-src 'self'" in csp_content:
        print("CSP verification successful")
    else:
        print("CSP verification failed")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_app(page)
        finally:
            browser.close()
