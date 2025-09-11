const puppeteer = require('puppeteer-core');
const { formatNutrienInfoFromScrape, getItemid } = require('./formating')
const { addPorductdb, connectSQL } = require('./database')

let browser;

const nutrientAliases = {
  kcal: ["energia", "energi", "energy", "calories", "kcal", "kj"],
  fat: ["rasva", "rasvaa", "rasvat", "kokonaisrasva", "fat", "fats", "lipid"],
  fatSaturated: ["tyydyttyne", "tyydyttyneita", "saturated", "saturates"],
  carbs: ["hiilihydraattia", "hh", "carbohydrate", "carbohydrates", "carb", "carbs"],
  carbsSugar: ["soker", "sokereita", "sugar", "sugars", "added sugars", "of which sugars"],
  protein: ["protei", "proteiinia", "protein", "proteins", "prot"],
  salt: ["suola", "suolaa", "salt", "salts", "table salt"],
  fibre: ["ravintokuitua", "kuitu", "fiber", "fibre", "dietary fiber", "dietary fibre"],
};

const aliasToKey = {}
const allALiases = []
for (const [key, aliases] of Object.entries(nutrientAliases)) {
    for (const alias of aliases) {
        const a = alias.toLowerCase()
        aliasToKey[a] = key
        allALiases.push(a)
    }
}

const pattern = allALiases
    .sort((a,b) => b.length - a.length)
    .map(a => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

const nutrientRegex = new RegExp(`\\b(${pattern})\\b`, "i");

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
            let nutrient = row.querySelector('th')?.textContent.toLocaleLowerCase().trim().replace(/[-–•]/g, "").replace(/\s+/g, " ");
            let value = row.querySelector('td')?.textContent.trim();
            return {nutrient, value};
        });
    });
    let formatedNutrient = filterData(priceInfo, prodName, nutrionInfo, url ,completeUrl)
    return formatedNutrient
}

async function filterData(price, name ,nutrientData, url, completeUrl){
    let formatedNutrient = {
        id: getItemid(url),
        name : name,
        info : {
            price : parseFloat(price.replace(",",".").replace(/[^0-9.]/g, "")),
            nutrition : {
            },
        scrappingTime: null,
        url: completeUrl
        }
    }
    nutrientData.forEach(dataRow => {
        const matchedAlias = dataRow.nutrient.replace(/ä/g, "a").replace(/ö/g, "o").match(nutrientRegex)?.[1]?.toLowerCase();
        const nutrientName = aliasToKey[matchedAlias]
        if (nutrientName){
            if (nutrientName == "kcal")formatedNutrient.info.nutrition[nutrientName] = parseFloat(dataRow.value.match(/\d+(?:\s*\d+)*/g)?.[1])
            else formatedNutrient.info.nutrition[nutrientName] = parseFloat(dataRow.value.replace(",",".").replace("g",""))
        }
    });

    return formatedNutrient
}

module.exports = { initializeBrowser, scrappingTime, searchTargets }