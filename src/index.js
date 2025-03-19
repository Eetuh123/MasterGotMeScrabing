const express = require('express');
const { scrappingTime, initializeBrowser } = require('./scrapper')
const { connectSQL } = require('./database')
const app = express();

app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
       const searchTerm = req.query.term
       const browser = await initializeBrowser()
       const connection = await connectSQL();
       const data = await scrappingTime(browser, searchTerm);
       res.json(data)
})

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
})
