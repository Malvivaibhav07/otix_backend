const mysql = require('mysql');
let dotenv = require('dotenv');
dotenv.config();

let db_config = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0
};

let pool;

function handleDisconnect() {
    pool = mysql.createPool(db_config);

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error when connecting to DB:', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Database Connected.....!');
            connection.release(); 
        }
    });

    pool.on('error', function (err) {
        console.error('DB Pool Error:', err);
        if (
            err.code === 'PROTOCOL_CONNECTION_LOST' ||
             err.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER'
        ) {
            console.log('Reinitializing pool after connection loss...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

module.exports = pool;
module.exports.handleDisconnect = handleDisconnect;
