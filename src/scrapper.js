const puppeteer = require('puppeteer-core');
const { dataSorting } = require('./formating')

async function initializeBrowser() {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    return browser;
}

async function scrappingTime(browser, itemName) {
    let page = await browser.newPage();
    await page.goto('https://www.s-kaupat.fi/');
    await page.locator('input[placeholder="Hae tuotteita"]').fill(itemName);  
    
    const inputValue = await page.evaluate(() => {
        return document.querySelector('input[placeholder="Hae tuotteita"]').value;
    });  
    await page.waitForSelector('article[data-test-id="search-product-suggestion"]');
    const links = await page.$eval('article[data-test-id="search-product-suggestion"]', 
        (article) => Array.from(article.querySelectorAll('a')).map(a => a.getAttribute('href'))
    );
    console.log(links)
      
    await page.goto('https://www.s-kaupat.fi/' + links);

    await page.locator('summary[tabindex="0"]').click();

    let prodName  = await page.$eval('h1[data-test-id="product-name"]', el => el.textContent)
    let priceInfo  = await page.$eval('span[data-test-id="display-price"]', el => el.textContent)

    let nutrionInfo = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('div.tableRow'));
        return rows.map(row => {
            let cells = row.querySelectorAll('div.cell')
            let nutrient = cells[0]?.textContent.trim();
            let value = cells[1]?.textContent.trim();

            return { nutrient, value};
        });
    });
    let sortedData = dataSorting(priceInfo, prodName, nutrionInfo)
    return { sortedData }
}

module.exports = { initializeBrowser, scrappingTime }