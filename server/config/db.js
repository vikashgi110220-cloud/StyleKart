
const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_CA),
        minVersion: "TLSv1.2"
    },

    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
