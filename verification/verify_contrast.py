from playwright.sync_api import sync_playwright, expect
import time

def verify_contrast(page):
    print("Navigating to app...")
    page.goto("http://localhost:3000")

    print("Waiting for data to load...")
    page.locator('.h-screen[role="status"]').wait_for(state="hidden", timeout=15000)
    page.wait_for_selector('.chart-group', timeout=10000)

    print("Verifying Header contrast...")
    subtitle = page.locator('header p')
    expect(subtitle).to_have_class("text-slate-600 mt-0.5 text-sm font-normal")

    print("Selecting a country (e.g., USA) to show the overlay...")
    # Click on a country in the top countries chart to open the overlay
    # Assuming the first bar is USA or China, click it.
    page.locator('.bar-group').first.click()

    # Wait for overlay to appear
    page.wait_for_selector('[role="dialog"]', timeout=5000)

    # Now we are in the overlay, we can see the Stacked Chart toggle
    print("Switching to Stacked Area Chart in Overlay...")
    # Wait for animation
    time.sleep(1)

    # The toggle is inside the CountryChart component
    stacked_btn = page.get_by_role("button", name="Stacked Chart")
    # Or localized name? Default is French 'Graphique empilé' or 'Stacked Chart' if English.
    # The app starts in French by default? Let's check Header.
    # Header logic: default is 'fr'.
    # Translation 'fr' -> chart.stackedChart: "Graphique empilé"

    # Try localized name
    stacked_btn_fr = page.get_by_role("button", name="Graphique empilé")
    if stacked_btn_fr.count() > 0:
        stacked_btn_fr.click()
    else:
        # Fallback to English if somehow in English
        page.get_by_role("button", name="Stacked Chart").click()

    time.sleep(1)
    page.screenshot(path="verification/stacked_chart_view.png")

    print("Verifying Controls contrast...")
    controls_labels = page.locator('.glass-panel-light .font-mono.text-slate-600')
    expect(controls_labels).to_be_visible()

    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_contrast(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
