const mysql = require('mysql2/promise');
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
};

console.log("Database Configuration:", dbConfig);

let connection;

const connectDB = async () => {
  if (connection) {
    return connection;
  }
  let retries = 5;

  while (retries) {
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log("Database connected successfully");
      return connection;
    } catch (error) {
      console.error(`Database connection attempt failed (${retries} retries left):`, error);
      retries -= 1;

      if (retries === 0) {
        console.error("Failed to connect to database after multiple attempts");
        // Không thoát process để nodemon có thể restart
        // process.exit(1);
        return null;
      }

      // Đợi 5 giây trước khi thử lại
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;