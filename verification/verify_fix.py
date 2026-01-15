from playwright.sync_api import sync_playwright, expect

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Force French locale just in case
        context = browser.new_context(locale="fr-FR")
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173", wait_until="domcontentloaded")
            page.wait_for_load_state("networkidle")

            # Globe
            print("Checking Globe...")
            globe = page.locator("svg[role='graphics-document'][aria-label*='Globe 3D interactif']")
            expect(globe).to_be_visible(timeout=10000)
            expect(globe.locator("title")).to_contain_text("Globe 3D interactif")
            expect(globe.locator("desc")).to_contain_text("Visualisation")

            # Details
            print("Opening details...")
            # Click the list item in Top 10
            china_btn = page.locator("g[role='listitem'][aria-label^='Chine:']")
            expect(china_btn.first).to_be_visible()
            china_btn.first.click()

            # Wait for overlay
            overlay = page.locator("div[role='dialog']")
            expect(overlay).to_be_visible()

            # Bubble
            print("Checking Bubble Chart...")
            bubble = page.locator("svg[role='graphics-document'][aria-label='Émissions par Secteur (Bulles)']")
            expect(bubble).to_be_visible(timeout=10000)
            expect(bubble.locator("title")).to_have_text("Émissions par Secteur (Bulles)")
            expect(bubble.locator("desc")).to_contain_text("Visualisation")

            # Stacked
            print("Checking Stacked Chart...")
            page.get_by_role("button", name="Graphique empilé").click()
            stacked = page.locator("svg[role='graphics-document'][aria-label='Émissions par Secteur (Empilé)']")
            expect(stacked).to_be_visible(timeout=10000)
            expect(stacked.locator("title")).to_have_text("Émissions par Secteur (Empilé)")

            print("SUCCESS")
            page.screenshot(path="verification/final_fix.png")

        except Exception as e:
            print(f"FAILURE: {e}")
            page.screenshot(path="verification/failure.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
