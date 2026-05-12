// =============================================
//   config/db.js — MySQL Connection Pool
// =============================================

const mysql = require('mysql2');
require('dotenv').config();

// createPool is better than createConnection
// Pool keeps multiple connections ready and reuses them
// So if 2 requests hit server at same time, both get served
const pool = mysql.createPool({
  host: process.env.DB_HOST,      // localhost
  user: process.env.DB_USER,      // root
  password: process.env.DB_PASSWORD,  // yourpassword
  database: process.env.DB_NAME,      // laundry_db
  waitForConnections: true,
  connectionLimit: 10,                // max 10 simultaneous connections
  queueLimit: 0,
});

// .promise() lets us use async/await instead of old callback style
module.exports = pool.promise();
