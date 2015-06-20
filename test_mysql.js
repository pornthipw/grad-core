/*var mysql = require('db-mysql');
new mysql.Database({
    hostname: 'localhost',
    user     : 'pornthip',
    password : 'mypass',
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
*/
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  socketPath : '/tmp/mysql.sock',
  user     : 'pornthip',
  password : 'mypass',
  database: 'grad_office'
});
connection.connect();
  //connection.query("use grad_office");
  var strQuery = "select * from hrnu_grad_gradstaffpublication LIMIT 2";	
  
  connection.query( strQuery, function(err, rows){
  	if(err)	{
  	//	throw err;
                console.log('Error while performing Query.');
  	}else{
  		console.log( rows );
  	}
  });
//connection.connect();

/*
connection.query('SELECT * From hrnu_grad_gradstaffpublication LIMIT 2', function(err, rows, fields) {
  if (!err){ 
    console.log('The solution is: ', rows);
  } else {
    console.log('Error while performing Query.');
  }
});
*/
connection.end();
