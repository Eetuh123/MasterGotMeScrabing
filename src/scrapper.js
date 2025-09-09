const puppeteer = require('puppeteer-core');
const { formatNutrienInfo } = require('./formating')
const { addPorductdb, connectSQL } = require('./database')

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

    let completeUrl = 'https://www.s-kaupat.fi/' + url

    let page = await browser.newPage();

    await page.goto(completeUrl);

    await page.locator('details[data-test-id="nutrients-info"] > summary').click();

    let prodName  = await page.$eval('h1[data-test-id="product-name"]', el => el.textContent)
    let priceInfo  = await page.$eval('span[data-test-id="display-price"]', el => el.textContent)

    let nutrionInfo = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('[data-test-id="nutrients-info-content"] tbody tr'));
        return rows.map(row => {
            let nutrient = row.querySelector('th')?.textContent.trim();
            let value = row.querySelector('td')?.textContent.trim();

            return { nutrient, value};
        });
    });
    console.log(nutrionInfo, "hehe")
    deconstructForDatabase(priceInfo, prodName, nutrionInfo, url ,completeUrl)
    let sortedData = formatNutrienInfo(priceInfo, prodName, nutrionInfo)
    return { sortedData, completeUrl }
}
async function deconstructForDatabase(price, name, nutrientData, url, completeUrl) {
    let id = parseFloat(url.replace(/[^0-9]/g, ""))
    const sqlConnection = await connectSQL()
    let cleanedPrice = parseFloat(price.replace(",",".").replace(/[^0-9.]/g, ""));
    const data = nutrientData.filter(item => item.value).map(item => {
        if (item.nutrient === "Energiaa") {
            const match = item.value.match(/(\d+)\s*kJ\s*\/\s*(\d+)\s*kcal/);
            return match ? parseFloat(match[2]) : null
        }
        return parseFloat(
            item.value.replace(",", ".").replace(/[^0-9.]/g, "")
        )
    }).filter(val => val !== null)
    const [calories, fat, fatSaturated, carbs, sugar, protein] = data;


    addPorductdb(sqlConnection, id ,name, cleanedPrice, calories, fat, fatSaturated, carbs, sugar, protein, completeUrl)
}

module.exports = { initializeBrowser, scrappingTime, searchTargets }