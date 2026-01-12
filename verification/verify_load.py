from playwright.sync_api import sync_playwright

def verify_app_load():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        print("Waiting for title...")
        page.wait_for_selector("text=Visualisation des émissions de CO2", timeout=10000)

        print("Waiting for data load (Globe sphere)...")
        # .sphere-path is rendered by Globe.jsx
        page.wait_for_selector(".sphere-path", timeout=20000)

        print("Waiting for chart bars...")
        # .bar-rect is rendered by TopCountriesChart.jsx
        page.wait_for_selector(".bar-rect", timeout=20000)

        print("Taking screenshot...")
        page.screenshot(path="verification/verification.png")

        print("Verification complete!")
        browser.close()

if __name__ == "__main__":
    verify_app_load()
