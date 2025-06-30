let mysql = require('mysql');
const { exec } = require('child_process');
let dotenv = require('dotenv');
dotenv.config();

let db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

let connection;

function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) { // The server is either down
        if (err) { // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }
        else {
            console.log("Database Connected.....!");
        } // to avoid a hot loop, and to allow our node script to
    }); // process asynchronous requests in the meantime.
    // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_PACKETS_OUT_OF_ORDER') { // Connection to the MySQL server is usually
            handleDisconnect(); // lost due to either server restart, or a
            const command = process.env.APP_ENV === 'production' ? 'pm2 restart otix-api-live' : 'pm2 restart otix-api-dev';
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error executing command: ${err}`);
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
        } else { // connnection idle timeout (the wait_timeout
            throw err; // server variable configures this)
        }
    });
}

handleDisconnect();

module.exports = connection;
module.exports.handleDisconnect = handleDisconnect;