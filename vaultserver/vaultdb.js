var mysql = require('mysql');
var Config  = require('../config/config');

var connection_pool;

connection_pool=mysql.createPool(Config.vaultdb_config);


module.exports=connection_pool;

/*

var con ;
function handleDisconnect() {
  console.log("Connecting to the VaultDB");

  con = mysql.createConnection(Config.vaultdb_config);


con.on('error', function(err) {
  console.log('db error', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    handleDisconnect();                         // lost due to either server restart, or a
  } else {                                      // connnection idle timeout (the wait_timeout
    throw err;                                  // server variable configures this)
  }
});

con.connect(function(err) {              // The server is either down
  if(err) {                                     // or restarting (takes a while sometimes).
    console.log('error when connecting to vaultdb:', err);
    setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    return;
  }      
  console.log("Connected To Vault DB");                        // to avoid a hot loop, and to allow our node script to
});                                     // process asynchronous requests in the meantime.
                                        // If you're also serving http, display a 503 error.
}

handleDisconnect();

*/