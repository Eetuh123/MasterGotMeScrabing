// src/index.js
const express = require('express');  // We need to add this to package.json
const app = express();

app.get('/', (req, res) => {
    res.send(`
        <h1>Web Scraper Control Panel</h1>
        <p>The system is running! Current time: ${new Date().toLocaleString()}</p>
    `);
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Web interface is ready at http://localhost:3000');
});