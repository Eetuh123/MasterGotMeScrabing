const puppeteer = require('puppeteer-core');
const { formatNutrienInfo } = require('./formating')

let browser;

async function initializeBrowser() {
    if(!browser) {
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
    }
    return browser;
}

async function searchTargets(browser, itemName) {

    let page = await browser.newPage();

    await page.goto('https://www.s-kaupat.fi/');
    await page.locator('input[placeholder="Hae tuotteita"]').fill(itemName);  
    
    const inputValue = await page.evaluate(() => {
        return document.querySelector('input[placeholder="Hae tuotteita"]').value;
    });  
    await page.waitForSelector('article[data-test-id="search-product-suggestion"]');
    const links = await page.$$eval(
        'article[data-test-id="search-product-suggestion"]', 
        (articles) => { 
            return articles.map(article => {
                return {
                    name: article.querySelector('span')?.innerText,
                    link: article.querySelector('a')?.getAttribute('href'),
                    price: article.querySelector('span[data-test-id="display-price"]')?.innerText.trim(),
                    pricePerKg: article.querySelector('span[data-test-id="search-product-suggestion__product-price__comparisonPrice"] span')?.innerText.trim(),
                }
            })
        }
    );
    await page.close();
    return links
}

async function scrappingTime(browser, url) {

    let page = await browser.newPage();

    await page.goto('https://www.s-kaupat.fi/' + url);

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
    let sortedData = formatNutrienInfo(priceInfo, prodName, nutrionInfo)
    return { sortedData }
}

module.exports = { initializeBrowser, scrappingTime, searchTargets }