// This file sets up and exports the MySQL connection pool.
// Using a pool is more efficient than creating a new connection for every query.

import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Saumya@1234",
  database: process.env.DB_NAME || "kce",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log("✅ DB connected successfully");
        connection.release();
    })
    .catch(err => {
        console.error("❌ DB connection failed:", err.message);
    });

export default pool;
