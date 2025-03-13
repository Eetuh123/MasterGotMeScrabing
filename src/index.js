const puppeteer = require('puppeteer-core')
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
        <h1>Web Scraper Control Panel</h1>
        <p>The system is running! Current time: ${new Date().toLocaleString()}</p>`
    
    
    );
});
async function initializeBrowser() {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    await scrappingTime(browser)
    return browser;
}
async function scrappingTime(browser) {
    const page = await browser.newPage();
    await page.goto('https://www.s-kaupat.fi/tuote/chiquita-banaani/2000503600002');
    await page.locator('summary[tabindex="0"]').click();

    const prodName  = await page.$eval('h1[data-test-id="product-name"]', el => el.textContent)
    console.log(prodName)
    const priceInfo  = await page.$eval('span[data-test-id="display-price"]', el => el.textContent)
    console.log(priceInfo)

    console.log(prodName, priceInfo)

    const nutrionInfo = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('div.tableRow'));

        return rows.map(row => {
            const cells = row.querySelectorAll('div.cell')
            const nutrient = cells[0]?.textContent.trim();
            const value = cells[1]?.textContent.trim();

            return { nutrient, value};
        });
    });


    console.log(nutrionInfo)
}
app.listen(3000, '0.0.0.0', () => {
    initializeBrowser();
    console.log('Web interface is ready at http://localhost:3000');
});