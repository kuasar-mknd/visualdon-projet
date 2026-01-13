from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        try:
            print("Navigating...")
            page.goto("http://localhost:3001")

            # Wait for any content to load (French default)
            expect(page.get_by_text("Histoire des Émissions de CO2")).to_be_visible(timeout=10000)
            print("App loaded (French).")

            # Switch to English
            print("Switching to English...")
            page.get_by_title("English").click()

            # Wait for English title
            expect(page.get_by_text("CO2 Emissions History")).to_be_visible(timeout=5000)
            print("Switched to English.")

            # 2. Check Legend
            page.wait_for_timeout(2000)
            page.screenshot(path="verification/verification_total.png")

            # Use specific role to avoid ambiguity
            legend = page.get_by_role("region", name="CO2 Emissions")
            expect(legend).to_contain_text("High")
            expect(legend).to_contain_text("MtCO₂")
            print("Total legend verified.")

            # 3. Switch to Per Capita
            select = page.get_by_label("Select emission category")
            select.select_option("Per Capita")

            page.wait_for_timeout(2000)
            page.screenshot(path="verification/verification_per_capita.png")

            expect(legend).to_contain_text("tCO₂/hab")
            print("Per Capita legend verified.")

            chart_title = page.locator(".chart-title")
            expect(chart_title).to_contain_text("Per Capita")
            print("Chart title verified.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
