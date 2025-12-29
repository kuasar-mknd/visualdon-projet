from playwright.sync_api import sync_playwright

def verify_interaction():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Log console
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        try:
            print("Navigating...")
            page.goto("http://localhost:5173/")

            # Wait for loading to finish (h-screen loader)
            print("Waiting for load...")
            page.wait_for_selector('div[role="status"].h-screen', state='hidden', timeout=30000)

            # Wait for countries
            print("Waiting for countries...")
            page.wait_for_selector('path.country-path', timeout=10000)

            # Verify count
            count = page.locator('path.country-path').count()
            print(f"Countries: {count}")
            if count < 100:
                raise Exception("Too few countries")

            # Drag
            print("Dragging...")
            viewport = page.viewport_size
            cx, cy = viewport['width'] / 2, viewport['height'] / 2

            page.mouse.move(cx, cy)
            page.mouse.down()
            page.mouse.move(cx + 200, cy)
            page.mouse.up()

            # Wait for update
            page.wait_for_timeout(1000)

            # Screenshot
            print("Screenshot...")
            page.screenshot(path="verification/globe_interaction.png")
            print("Success.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_interaction.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_interaction()
