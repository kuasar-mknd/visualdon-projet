from playwright.sync_api import sync_playwright, expect
import time

def verify_optimizations():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create context with explicit viewport size to simulate real desktop
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for loading to finish (LoadingPlaceholder should disappear)
            # We look for the main content or header to be visible
            print("Waiting for load...")
            page.wait_for_selector("header", timeout=15000)

            # Verify Header is visible
            print("Verifying header...")
            # Default language is FR: "Histoire des Émissions de CO2"
            expect(page.get_by_role("heading", name="Histoire des Émissions de CO2")).to_be_visible()

            # Verify Controls are visible (Play button)
            print("Verifying controls...")
            # FR: "Lecture" might be hidden or icon only?
            # In Controls.jsx: aria-label={isPlaying ? t('aria.pause') : t('aria.play')}
            # In FR: aria.play = "Démarrer l'animation"
            expect(page.get_by_label("Démarrer l'animation")).to_be_visible()

            # Verify Charts are loaded (Top Countries)
            print("Verifying charts...")
            # FR: "Top 10 Émetteurs"
            # We pick the visible text element (SVG text), not the <title> tag which is hidden
            expect(page.locator("text=Top 10 Émetteurs").last).to_be_visible()

            # Wait for map to render (canvas or svg)
            page.wait_for_selector(".sphere-path", timeout=10000)

            # Take screenshot of initial state
            print("Taking screenshot...")
            page.screenshot(path="verification/optimization_check.png")

            # Interaction test: Click Play
            print("Testing interaction...")
            play_btn = page.get_by_label("Démarrer l'animation")
            play_btn.click()

            # Wait a bit for animation
            time.sleep(1)

            # Pause
            play_btn.click()

            print("Taking interaction screenshot...")
            page.screenshot(path="verification/optimization_interaction.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_optimizations()
