var oracle = require('db-oracle');
var config = require('../config');
new oracle.Database({
  hostname: config.hrnu_config.hostname,
  user: config.hrnu_config.user,
  charset:'Unicode',
  password: config.hrnu_config.password,
  database: config.hrnu_config.database
}).connect(function(error) {
    if(error) {
      console.log("CONNECTION ERROR: " + error);
    } else {
      this.query().select('*')
       .from('PROMIS.V_NU_EDUCATIONHIS')
       .where('STAFFID = ?',[6573])
      // .from('NLS_DATABASE_PARAMETERS')
       .execute(function(error, rows) {
       if(error) {
         return console.log('Error: '+error);
       }
       console.log(rows.length+' Rows');
       rows.forEach(function(row) {
         console.log(row);
       });
      });
    }
});
