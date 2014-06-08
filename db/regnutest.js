var oracle = require('db-oracle');
var generic_pool = require('generic-pool');

var RegnuTest = function(config) {
  var pool = generic_pool.Pool({
    name:'regnutest_pool',
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
    //  console.log(req.query.select);
      var ret = {'value':0};
      var c_db =  db.query()
      if(req.query.select) {
        c_db.select(JSON.parse(req.query.select));
      } else {
        c_db.select('*');
      }
      c_db.from('AVSREG.GRAD_'+req.params.table.toUpperCase());
      if(req.query.where) {
        var where_obj = JSON.parse(req.query.where);
        c_db.where(where_obj.str,where_obj.json);
      }
      //console.log(c_db.sql());
      c_db.execute(function(error, rows) {
        pool.release(db);
        if (error) {
    //      console.log(error);
          res.json([]);
        } else {
         
          if(req.params.num) {
            ret['value']=parseInt(req.params.num)+1;
          }
          res.json({'rows':rows,'ret':ret});
        }
      });
    });
  };

};


exports.regnutest = RegnuTest;
