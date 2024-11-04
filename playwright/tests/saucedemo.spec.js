const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe("multiple test", async () => {
    test.describe.configure({ mode: 'serial'});
    slowMode: 12000 
    test.beforeEach(async ({ page }) => {
     // Navigate to the "All Items" page
     await page.goto('https://www.saucedemo.com/');

     // Login to the application
     await page.fill('#user-name', 'standard_user');
     await page.fill('#password', 'secret_sauce');
     await page.click('#login-button');    
    })

    test('Verify Z-A Sorting on All Items page', async ({ page }) => {       
        // Select the sorting option “Z-A”
        await page.selectOption('.product_sort_container', 'za');

        // Validate that the items are listed in the correct order
        const productNames = await page.$$eval('.inventory_item_name', items =>
            items.map(item => item.textContent)
        );

        const sortedNames = [...productNames].sort().reverse(); // Z-A sorting
        expect(productNames).toEqual(sortedNames);
         // Capture screenshot for visual comparison
        expect(await page.screenshot()).toMatchSnapshot('za-sorted-items.png', {
            // Set threshold to ignore small pixel differences
            maxDiffPixelRatio: 0.09 // Allows up to 5% difference between the screenshots);
        })  
        
    });
    test('Verify Price Sorting High to Low on All Items page', async ({ page }) => {       
      
        //Select the sorting option “Price (high-low)”
        await page.selectOption('.product_sort_container', 'hilo');
      
        // Validate that the prices are displayed from highest to lowest
        const productPrices = await page.$$eval('.inventory_item_price', items =>
          items.map(item => parseFloat(item.textContent.replace('$', '')))
        );
      
        const sortedPrices = [...productPrices].sort((a, b) => b - a); // High to low sorting
        expect(productPrices).toEqual(sortedPrices);
        // Capture screenshot for visual comparison
        expect(await page.screenshot()).toMatchSnapshot('price-high-low.png', {
            // Set threshold to ignore small pixel differences
            maxDiffPixelRatio: 0.09 // Allows up to 5% difference between the screenshots);
        })    
    });
    test('Add multiple items to the cart and complete the checkout process', async ({ page }) => {
        // Add 2 or 3 items to the cart
        await page.click('.inventory_item:nth-child(1) button');  // Add first item
        await page.click('.inventory_item:nth-child(2) button');  // Add second item
      
        //  Go to the cart
        await page.click('.shopping_cart_link');
      
        // Proceed to checkout
        await page.click('#checkout');
      
        //  Complete the checkout process
        await page.fill('#first-name', 'Test');
        await page.fill('#last-name', 'checkout');
        await page.fill('#postal-code', '12345');
        await page.click('#continue');
      
        //  Validate the order summary page
        await expect(page.locator('.summary_total_label')).toBeVisible();
        await page.click('#finish');
      
        // Verify successful checkout
        await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    });    
    test('Accessibility test for Z-A sorting on All Items page @accessibility', async ({ page }) => {
        // Apply Z-A sorting
        await page.selectOption('.product_sort_container', 'za');
    
        // Inject axe for accessibility testing
        await injectAxe(page);
    
        // Run accessibility checks
        await checkA11y(page);
    });
    
    
})