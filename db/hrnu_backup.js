var oracle = require('oracledb');
var generic_pool = require('generic-pool');

var Hrnu = function(config) {
  var pool = generic_pool.Pool({
    name:'hrnu_pool',
    max:config.hrnu_config.max_connection||1,
    create: function(callback) {
      oracledb.getConnection({
       connectString: ???
       user: config.hrnu_config.user,
       password: config.hrnu_config.password,
       //charset: 'TH8TISASCII',
       //ncharset: 'AL32UTF8'
      }).connect(function(error) {
        if(error) {
          console.log("CONNECTION ERROR: " + error);
        } else {
          callback(error,this);
        }
      });
    },
    destroy:function(db) {
    }
  });
  
  this.list_table = function(req, res) {
    pool.acquire(function(err, db) {
      //console.log(req.query.select);
      var ret = {'value':0};
      var c_db =  db.query();
      if(req.query.select) {
        c_db.select(JSON.parse(req.query.select));
      } else {
        c_db.select('*');
      }
      c_db.from('PROMIS.V_NU_'+req.params.table.toUpperCase());
      if(req.query.where) {
        var where_obj = JSON.parse(req.query.where);
        c_db.where(where_obj.str,where_obj.json);
      }
      //console.log(c_db.sql());
      c_db.execute(function(error, rows) {
        pool.release(db);
        if (error) {
          console.log(error);
          res.json([]);
        } else {

          //res.json(rows);
          if(req.params.num) {
            ret['value']=parseInt(req.params.num)+1;
          }
          res.json(rows);
          /*
          res.json({'rows':rows,'ret':ret});
          */
        }
      });
    });
  };

};


exports.hrnu = Hrnu;
