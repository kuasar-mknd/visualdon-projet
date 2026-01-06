
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print('Navigating to app...')
            page.goto('http://localhost:5173')

            # Wait for loading to finish (Year display is a good indicator)
            print('Waiting for app to load...')
            page.wait_for_selector('text=2024', timeout=60000)

            # Take screenshot
            print('Taking screenshot...')
            page.screenshot(path='verification/integrity_check.png')
            print('Screenshot saved to verification/integrity_check.png')

        except Exception as e:
            print(f'Error: {e}')
            page.screenshot(path='verification/error.png')
        finally:
            browser.close()

if __name__ == '__main__':
    run()
