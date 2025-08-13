from playwright.sync_api import sync_playwright
from playwright.sync_api import expect


BASE_URL = "http://localhost:3000"


def test_hotel_booking_end_to_end():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)  # headless=True for headless mode
        page = browser.new_page()

        # ===================== FEATURE 1: DESTINATION SEARCH =====================
        print("Feature 1: Searching for destination...")
        page.goto(BASE_URL)

        # 1️⃣ Travel Booking header
        expect(page.locator('h1.text-5xl.md\\:text-6xl.font-light.tracking-\\[-0\\.02em\\].leading-\\[1\\.1\\].text-neutral-900')) \
            .to_have_text("Find Your Next Escape")

        # Step 1: Fill in destination
        print("Filling in destination...")
        page.fill('input[placeholder="Where are you going?"]', "Singapore")

        # Step 2: Click suggestion from dropdown
        print("Clicking suggested option...")
        page.click('li:has-text("Singapore, Singapore")')

        print("Clicking on calendar...")
        page.click('svg[aria-label="calendar"]')

        # Step 3: Pick check-in date
        print("Picking calendar dates...")
        page.click('div[aria-label="20 Aug 2025"]')
        page.click('div[aria-label="22 Aug 2025"]')

        # Step 4: Select OK button
        print("Clicking OK Button...")
        page.get_by_role("button", name="OK").click()

        # Step 7: Click search
        print("Clicking the search button...")
        page.locator(
            "button.h-11.w-full.rounded-lg.bg-blue-600.font-semibold.text-white.transition.hover\\:bg-blue-700.md\\:w-auto.md\\:px-6"
        ).click()

        # ===================== FEATURE 2: HOTEL SEARCH RESULTS =====================
        print("Feature 2: Viewing and filtering hotel results...")

        # 2️⃣ Hotels Found header
        
        with page.expect_navigation():
            expect(page.get_by_role("heading", name="Search results")).to_be_visible()

        # Click the first hotel card in the grid
        page.locator("div.cursor-pointer").first.click()

        # Optionally wait or assert results updated
        page.wait_for_timeout(3000)

        # ===================== FEATURE 3: HOTEL ROOM DETAILS =====================
        print("Feature 3: Selecting a room...")
        page.locator('input[type="radio"][name="room"]').first.check()
        page.get_by_role("button", name="Continue to Booking").click()

        # ===================== FEATURE 4: BOOKING DATA & PAYMENT =====================
        print("Feature 4: Entering booking details...")

         # 4️⃣ Booking Summary header
        expect(page.locator("h2", has_text="Booking Summary")).to_be_visible()
        
        # Fill form fields 
        page.fill("input[name='firstName']", "John")
        page.fill("input[name='lastName']", "Doe")
        page.fill("input[name='email']", "john.doe@example.com")
        page.fill("input[name='phone']", "123456789")
        page.fill("textarea[name='specialRequests']", "Extra Mattress")
        page.fill("input[name='cardNumber']", "4111111111111111")
        page.fill("input[name='expiry']", "12/28")
        page.fill('input[name="cvv"]', '123')
        page.fill("input[name='billingAddress']", "123 Example Street")

        # Click "Book Now" button
        page.locator("button", has_text="Book Now").click()

        # Keep browser open for review
        page.wait_for_timeout(5000)
        
        print("✅ E2E Hotel Booking Test Passed Successfully")

        # Close browser
        browser.close()


if __name__ == "__main__":
    test_hotel_booking_end_to_end()
