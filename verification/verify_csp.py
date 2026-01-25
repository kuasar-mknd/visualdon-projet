from playwright.sync_api import sync_playwright

def verify_headers(page):
    print("Navigating to home page...")
    page.goto("http://localhost:5173")

    print("Checking title...")
    title = page.title()
    print(f"Title: {title}")

    # Check for Meta CSP
    print("Checking for Meta CSP...")
    meta_csp = page.locator('meta[http-equiv="Content-Security-Policy"]')
    if meta_csp.count() > 0:
        content = meta_csp.get_attribute("content")
        print(f"Meta CSP found: {content}")
    else:
        print("Meta CSP NOT found!")

    # Check for console errors (CSP violations usually show up here)
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

    print("Taking screenshot...")
    page.screenshot(path="verification/csp_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_headers(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
