const express = require('express');
const { scrappingTime, initializeBrowser, searchTargets } = require('./scrapper')
const { connectSQL, getProductById } = require('./database')
const { getItemid,formatNutrionInfoFromDB } = require('./formating')
const app = express();

app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
       const searchTerm = req.query.term
       const browser = await initializeBrowser();
       const searchResults = await searchTargets(browser, searchTerm);
       res.json(searchResults);
})

app.get('/api/item', async (req, res) => {
    let itemInfo;
    const itemUrl = req.query.url
    const id = getItemid(itemUrl)
    const sqlConnection = await connectSQL()
    const product = await getProductById(sqlConnection, id)
    if (product) {
    console.log("Database...")
    itemInfo = formatNutrionInfoFromDB(product);
    } else {
    console.log("Scrapping...")
    const browser = await initializeBrowser();
    itemInfo = await scrappingTime(browser, itemUrl);
    }

    res.json(itemInfo);
})

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
})
