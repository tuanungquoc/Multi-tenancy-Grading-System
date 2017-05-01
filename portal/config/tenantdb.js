// Load module
var mysql = require('mysql');
// Initialize pool
var pool      =    mysql.createPool({
    connectionLimit : 10,
    host     :  'localhost',//'cmpe281-trial.cc0elrk6bwst.us-west-1.rds.amazonaws.com',
    user     : 'root',
    password : '123456789',
    database : 'cmpe281',
    debug    :  false,
    multipleStatements:true
});

module.exports.pool = pool;
