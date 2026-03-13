from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:5173')
        page.wait_for_selector('body', state='visible')
        time.sleep(2) # Give it a moment to render everything

        # Focus the EN button
        page.keyboard.press('Tab')
        page.keyboard.press('Tab')
        page.screenshot(path='verification/focus_en.png')

        # Focus the Select dropdown
        page.keyboard.press('Tab')
        page.keyboard.press('Tab')
        page.keyboard.press('Tab')
        page.keyboard.press('Tab')
        page.screenshot(path='verification/focus_select.png')

        browser.close()

run()
