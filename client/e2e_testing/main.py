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
        expect(page.locator("h1.text-4xl.font-bold.tracking-tight.text-gray-900.sm\\:text-6xl")) \
            .to_have_text("Travel Booking")

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
        page.get_by_role("button", name="OK").click()

        # Step 5: Select number of guests (2)
        page.select_option(
            'select.w-full.border.border-gray-300.rounded-lg.px-4.py-2 >> nth=0',
            '2'
        )

        # step 6: Select number of rooms (1)
        page.select_option(
            'select.w-full.border.border-gray-300.rounded-lg.px-4.py-2 >> nth=1', 
            '1'
        )

        # Step 7: Click search
        page.click('button.bg-indigo-600', timeout=5000)

        # ===================== FEATURE 2: HOTEL SEARCH RESULTS =====================
        print("Feature 2: Viewing and filtering hotel results...")

        # 2️⃣ Hotels Found header
        expect(page.locator("h1.text-2xl.font-bold.text-gray-900.mb-2")) \
            .to_have_text("Hotels Found")

        # # Click "Show Filters" button
        # print("Click 'Show Filters' button")
        # page.click('button:has-text("Show Filters")')

        # max_costs = page.locator('input[placeholder="1000"]')

        #  # Type 10 into first input
        # page.fill('input[placeholder="0"].w-full.px-3.py-2.border.border-gray-300.rounded-md', "10")


        # # Type 2000 into second input
        # max_costs.type("2000", delay=200)


        # # Locate all matching selects
        # selects = page.locator(
        #     'select.w-full.px-3.py-2.border.border-gray-300.rounded-md.focus\\:outline-none.focus\\:ring-2.focus\\:ring-indigo-500'
        # )
        # # First dropdown - select "Any Rating"
        # selects.nth(0).select_option('')
        # # Second dropdown - select "Any Rating"
        # selects.nth(1).select_option('')


        # # Select "Hotel Name" from the dropdown
        # page.select_option(
        #     'select.w-full.px-3.py-2.border.border-gray-300.rounded-md.focus\\:outline-none.focus\\:ring-2.focus\\:ring-indigo-500',
        #     'name'
        # )

        # Click the first hotel card in the grid
        page.click('div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6.mb-8 div.cursor-pointer')


        # Optionally wait or assert results updated
        page.wait_for_timeout(3000)

        # ===================== FEATURE 3: HOTEL ROOM DETAILS =====================
        print("Feature 3: Selecting a room...")

        # 3️⃣ Book This Hotel button
        expect(page.locator("button.bg-blue-600.text-white.px-6.py-2.rounded-lg.hover\\:bg-blue-700.transition.font-medium")) \
            .to_be_visible()
        
        page.click('button:has-text("Book This Hotel")')


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
        page.click("button:has-text('Book Now - Calculating...')")

        # Keep browser open for review
        page.wait_for_timeout(5000)
        

        print("✅ E2E Hotel Booking Test Passed Successfully")

        # Close browser
        browser.close()


if __name__ == "__main__":
    test_hotel_booking_end_to_end()
