var mysqlDriver = require('db-mysql');

var mysql = require('db-mysql');
new mysql.Database({
    hostname: 'localhost',
    user: 'pornthip',
    password: 'mypass',
    database: 'grad_office'
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
