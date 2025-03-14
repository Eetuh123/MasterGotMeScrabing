const puppeteer = require('puppeteer-core')
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
       const searchTerm = req.query.term
       const browser = await initializeBrowser()
       const data = scrappingTime(browser, searchTerm);

})

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
    return browser;
}
async function scrappingTime(browser, itemName) {
    console.log(itemName)
    let page = await browser.newPage();
    await page.goto('https://www.s-kaupat.fi/');
    console.log('step1')
    await page.locator('input[placeholder="Hae tuotteita"]').fill(itemName);  
    
    const inputValue = await page.evaluate(() => {
        return document.querySelector('input[placeholder="Hae tuotteita"]').value;
    });  
    console.log('Step2:Input field value:', inputValue);
    await page.waitForSelector('article[data-test-id="search-product-suggestion"]');
    console.log('step3: Results found');
    const links = await page.$eval('article[data-test-id="search-product-suggestion"]', 
        (article) => Array.from(article.querySelectorAll('a')).map(a => a.getAttribute('href'))
    );
      
    await page.goto('https://www.s-kaupat.fi/' + links);

    await page.locator('summary[tabindex="0"]').click();

    let prodName  = await page.$eval('h1[data-test-id="product-name"]', el => el.textContent)
    console.log(prodName)
    let priceInfo  = await page.$eval('span[data-test-id="display-price"]', el => el.textContent)
    console.log(priceInfo)

    console.log(prodName, priceInfo)

    let nutrionInfo = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('div.tableRow'));

        return rows.map(row => {
            let cells = row.querySelectorAll('div.cell')
            let nutrient = cells[0]?.textContent.trim();
            let value = cells[1]?.textContent.trim();

            return { nutrient, value};
        });
    });


    console.log(nutrionInfo)
}
app.listen(3000, '0.0.0.0', () => {
    initializeBrowser();
    console.log('Web interface is ready at http://localhost:3000');
});