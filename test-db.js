const mysql = require('mysql2/promise');

async function testDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '',
            database: 'expense_tracker'
        });

        console.log('MySQL CONNECTED!');

        const [rows] = await connection.query('SHOW TABLES');

        console.log('Tables:');
        console.log(rows);

        await connection.end();
    } catch (error) {
        console.error('MYSQL ERROR:');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
    }
}

testDatabase();