
const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

// Local machine: DB_SSL_CA contains the certificate file path.
// Render: DB_SSL_CA contains the certificate text.
const caValue = process.env.DB_SSL_CA;

const ca = caValue
    ? (caValue.includes("BEGIN CERTIFICATE")
        ? caValue.replace(/\\n/g, "\n")
        : fs.readFileSync(caValue, "utf8"))
    : undefined;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: ca
        ? {
            ca,
            minVersion: "TLSv1.2"
        }
        : undefined,

    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
