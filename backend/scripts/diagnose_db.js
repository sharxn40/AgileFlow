const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function diagnose() {
    const { DB_HOST, DB_USER, DB_PASS } = process.env;
    console.log(`Attempting connection to ${DB_HOST} with user ${DB_USER}...`);

    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASS,
        });
        console.log("SUCCESS: Connection established!");
        await connection.end();
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error("ERROR: Connection Refused. MySQL server is likely NOT running.");
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("ERROR: Access Denied. Incorrect username or password.");
        } else {
            console.error("ERROR: " + error.message);
        }
    }
}

diagnose();
