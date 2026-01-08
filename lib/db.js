var mysql = require('mysql');

var db = mysql.createConnection({
    host : 'localhost',
    user : 'nodejs',
    password : 'nodejs',
    database : 'webdb2024',
    multipleStatements: true
});

  
db.connect();
module.exports = db;