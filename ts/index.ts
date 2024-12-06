import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
dotenv.config();

async function scrapePurchaseItems() {
     // Launch a new browser instance
    const browser = await puppeteer.launch();

    try {
        // Retrieve login Credentials and URL from .env file
        const email : any = process.env.email;
        const pwd : any = process.env.password;
        const url : any = process.env.url;

        const page = await browser.newPage();

        // Navigate to the login page
        await page.goto(url+'account/login');

        // Waiting for login page to load
        await page.waitForSelector('#CustomerLoginForm');
        await page.waitForSelector('#CustomerEmail'); 
        await page.waitForSelector('#CustomerPassword'); 
        await page.waitForSelector('button.btn.btn--full');

        await page.type('#CustomerEmail', email);
        await page.type('#CustomerPassword', pwd);

        await page.waitForSelector('button.btn.btn--full', { visible: true });
        await page.click('button.btn.btn--full');

        // Waiting for the login page to complete and the next page to load
        await page.waitForNavigation();

        // Navigate to the "purchased items" page
        await page.goto(url+'account');

        // Scraping the purchased items
        const purchasedItems = await page.evaluate(() => {

            const table = document.querySelector('.table--responsive');

            if (!table) {
                return 'Oops! No orders placed yet';
            }

            const tableRows = Array.from(document.querySelectorAll('tr'));

            const tableHeaders = Array.from(tableRows[0].querySelectorAll('th')).map(th => th.innerText.trim());

            return tableRows.slice(1).map(row => {
                const tableCells = Array.from(row.querySelectorAll('td'));
                let rowData: { [key: string]: string } = {};

                tableCells.forEach((cell, index) => {
                    if (tableHeaders[index]) {
                        rowData[tableHeaders[index]] = cell.innerText.trim();
                    }
                });

                return rowData;
            
            });
            
        }); 

        if (typeof purchasedItems === 'string' && purchasedItems.startsWith('Error')) {
            console.log(purchasedItems);
        } else {
            console.log(JSON.stringify(purchasedItems, null, 2));
        }

    } catch (error) {
        console.error("Error: " + error);
    } finally {
        await browser.close();
    }
}

scrapePurchaseItems();