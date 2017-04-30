// Load module
var mysql = require('mysql');
// Initialize pool
var pool      =    mysql.createPool({
    connectionLimit : 10,
    host     : '127.0.0.1',
    user     : 'root',
    password : '123456789',
    database : 'cmpe281',
    debug    :  false,
    multipleStatements:true
});

module.exports.pool = pool;
