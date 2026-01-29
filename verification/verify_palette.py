from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:5173", timeout=60000)
        except Exception as e:
            print(f"Error navigating: {e}")
            return

        # Wait for Globe to be visible (it replaces the loading spinner)
        # The container has role="application"
        print("Waiting for Globe...")
        try:
            globe = page.locator("[role='application']")
            globe.wait_for(state="visible", timeout=30000)
            print("Globe loaded.")
        except:
             print("Globe did not load in time.")
             # Dump content to debug
             # print(page.content())
             pass

        # 2. Check Globe Hint for sr-only text
        print("Checking Globe Hint...")
        hint = page.locator("text=Raccourcis clavier")
        if hint.count() > 0:
            print("Globe hint found.")
        else:
            print("Globe hint NOT found.")

        # 3. Check Globe Interaction
        print("Interacting with Globe...")
        globe_container = page.locator("[role='application']")
        if globe_container.is_visible():
            globe_container.focus()
            page.keyboard.press("ArrowRight")
            page.keyboard.press("ArrowRight")
            page.keyboard.press("+")

        # 4. Check TopCountriesChart role
        print("Checking Chart Role...")
        chart_list = page.locator(".chart-group[role='list']")
        if chart_list.count() > 0:
             print("Chart list role found.")
        else:
             print("Chart list role NOT found.")

        # 5. Screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/palette_verification_v3.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
