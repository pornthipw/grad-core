var oracle = require('db-oracle');
var generic_pool = require('generic-pool');

var Regnu = function(config) {
  var pool = generic_pool.Pool({
    name:'regnu_pool',
    max:config.regnu_config.max_connection||1,
    create: function(callback) {
      new oracle.Database({
       hostname: config.regnu_config.hostname,
       user: config.regnu_config.user,
       password: config.regnu_config.password,
       database: config.regnu_config.database
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
      console.log(req.query.select);
      var c_db =  db.query()
        .select(JSON.parse(req.query.select))
        .from('AVSREG.GRAD_'+req.params.table.toUpperCase());
      if(req.query.where) {
        var where_obj = JSON.parse(req.query.where);
        c_db.where(where_obj.str,where_obj.json);
      }
      console.log(c_db.sql());
      c_db.execute(function(error, rows) {
        pool.release(db);
        if (error) {
          console.log(error);
          res.json([]);
        } else {
          res.json(rows);
        }
      });
    });
  };

};

exports.regnu = Regnu;
