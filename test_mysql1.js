var mysqlDriver = require('db-mysql');

var mysql = require('db-mysql');
new mysql.Database({
    hostname: 'localhost',
    user: 'user',
    password: 'pass',
    database: 'mydb'
}).connect(function(error) {
    if (error) {
        return console.log("CONNECTION ERROR: " + error);
    }

    this.query().select('*').from('officers_person').execute(function(error, rows) {
        if (error) {
            return console.log('ERROR: ' + error);
        }
        console.log(rows.length + ' ROWS');
    });
});
