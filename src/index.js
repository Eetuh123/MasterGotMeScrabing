const express = require('express');
const { scrappingTime, initializeBrowser, searchTargets } = require('./scrapper')
const { connectSQL } = require('./database')
const app = express();

app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
       const searchTerm = req.query.term
       const browser = await initializeBrowser();
       const searchResults = await searchTargets(browser, searchTerm);
       res.json(searchResults);
})

app.get('/api/item', async (req, res) => {
    const itemUrl = req.query.url
    const browser = await initializeBrowser();
    const itemInfo = await scrappingTime(browser, itemUrl);
    res.json(itemInfo);
})

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
})
