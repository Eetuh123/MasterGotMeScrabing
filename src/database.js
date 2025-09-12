const mysql = require('mysql2/promise');

const nutritionCols = [
  "kcal",
  "fat",
  "fatSaturated",
  "carbs",
  "carbsSugar",
  "protein",
  "salt",
  "fibre"
];

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

async function addPorductdb(connection, itemData) {
  const columns = ["id", "name", "price", ...nutritionCols, "url"];

  const values = [
    itemData.id,
    itemData.name,
    itemData.info.price,
    ...nutritionCols.map(col => itemData.info.nutrition?.[col] ?? null),
    itemData.info.url,
  ];

  const placeholders = columns.map(() => "?").join(", ");

  const updateClause = columns
    .filter(col => col !== "id")
    .map(col => `${col} = VALUES(${col})`)
    .join(", ");

  const sql = `
    INSERT INTO products (${columns.join(", ")})
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updateClause};
  `;

  await connection.execute(sql, values);

  const [rows] = await connection.execute("SELECT * FROM products");
  console.log(rows);
}

module.exports = { connectSQL, addPorductdb, getProductById }