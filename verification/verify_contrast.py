from playwright.sync_api import sync_playwright

def verify_contrast():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            # Load local file if possible, or assume server is running on 3000/5173
            # Since I am in a container, I might not have a running server yet.
            # I will try to start one in background or just mock it?
            # Actually, I can serve the static files if I build, but dev server is better.
            # Let uses assume port 5173 (Vite default)
            page.goto("http://localhost:5173")

            # Wait for content to load
            page.wait_for_selector("header")

            # Take screenshots of key areas
            page.screenshot(path="verification/full_page.png")

            # Zoom in on header
            header = page.locator("header")
            header.screenshot(path="verification/header.png")

            # Zoom in on controls
            controls = page.locator(".glass-panel-light").nth(1) # Assuming controls is second glass panel
            controls.screenshot(path="verification/controls.png")

            print("Screenshots taken")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_contrast()
