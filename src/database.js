const mysql = require('mysql2/promise');

async function connectSQL() {
    const connection = await mysql.createConnection({
        host: 'db',
        user: 'root',
        password: 'your_password',
        database: 'scraper_db'
    });

    console.log("Connected to MySQL database");
    return connection
}
async function getProductById(connection, id){
    const [rows] = await connection.execute(`SELECT * FROM products WHERE id = ?`, [id])
    return rows.length > 0 ? rows[0] : null;
}

async function addPorductdb(connection, id, name, price, kcal ,fat = 0, fatSaturated = 0, carbs = 0, carbsSugar = 0, protein = 0, url) {
    const query =`
    INSERT INTO products (id, name, price, kcal, fat, fatSaturated, carbs, carbsSugar, protein, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
        id = VALUES(id),
        name = VALUES(name), 
        price = VALUES(price), 
        kcal = VALUES(kcal),
        fat = VALUES(fat), 
        fatSaturated = VALUES(fatSaturated), 
        carbs = VALUES(carbs), 
        carbsSugar = VALUES(carbsSugar), 
        protein = VALUES(protein), 
        url = VALUES(url);`;

    await connection.execute(query, [id, name, price, kcal, fat, fatSaturated, carbs, carbsSugar, protein, url])

    const [rows] = await connection.execute("SELECT * FROM products");
    // console.log(rows);
}

module.exports = { connectSQL, addPorductdb, getProductById }