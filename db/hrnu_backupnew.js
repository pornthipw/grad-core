var oracle = require('oracledb');
var generic_pool = require('generic-pool');

var Hrnu = function(config) {
  var pool = generic_pool.Pool({
    name:'hrnu_pool',
    max:config.hrnu_config.max_connection||1,
    create: function(callback) {
      oracle.getConnection({
       connectString: 
         config.hrnu_config.hostname+":"+
         config.hrnu_config.port+"/"+
         config.hrnu_config.database, 
       user: config.hrnu_config.user,
       password: config.hrnu_config.password,
       //charset: 'TH8TISASCII',
       //ncharset: 'AL32UTF8'
      },
      function(err, connection) {
        if(err) {
          console.log("CONNECTION ERROR: " + error);
        } else {
          callback(err,connection);
        }
      });
    },
    destroy:function(db) {
    }
  });

  
  this.list_table = function(req, res) {
    pool.acquire(function(err, db) {
      console.log(req.query.select);
      console.log(req.params.table);
      var ret = {'value':0};
      var select_fields = '';
      if(req.query.select) {
      } else {
      }
      select_fields = '*';
      var from_table = 'PROMIS.V_NU_'+req.params.table.toUpperCase();
      if(req.query.where) {
       // var where_obj = JSON.parse(req.query.where);
       // c_db.where(where_obj.str,where_obj.json);
      }
    
      // query for each 10 rows
      db.execute('SELECT '+select_fields+
       ' FROM '+from_table+
       ' WHERE ROWNUM <= 10',
      // ' WHERE ROWNUM <= 20'
       [],
       {outFormat: oracle.OBJECT},
       function(err, result) {
         pool.release(db);
         if (err) {
           console.error(err.message);
           return res.json([]);
         }
         res.json(result.rows);
       
      });
    });
  };

};


exports.hrnu = Hrnu;
