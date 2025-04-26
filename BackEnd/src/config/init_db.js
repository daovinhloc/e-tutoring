const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

async function initializeDatabase() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database successfully");

    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'create_requests_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split the SQL file into individual statements
    const statements = sql.split(';').filter(statement => statement.trim());

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log("Executed SQL statement successfully");
      }
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase(); 