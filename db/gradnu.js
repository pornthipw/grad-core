var mysql = require('db-mysql');
var generic_pool = require('generic-pool');

var Gradnu = function(config) {
  var pool = generic_pool.Pool({
    name:'gradnu_pool',
    max:config.gradnu_config.max_connection||1,
    create: function(callback) {
      new mysql.Database({
       hostname: config.gradnu_config.hostname,
       user: config.gradnu_config.user,
       password: config.gradnu_config.password,
       database: config.gradnu_config.database
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
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        if(req.query.select) {
          c_db.select(JSON.parse(req.query.select));
        } else {
          c_db.select('*');
        }
        c_db.from(req.params.table);
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
    });
  };

  this.insert_table = function(req, res) {
    pool.acquire(function(err, db) {
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        console.log(req.body);
        c_db.insert(req.params.table, 
          JSON.parse(req.body.fields), 
          JSON.parse(req.body.values));
        c_db.execute(function(err,result) {
          if(err) {
            pool.release(db);
            res.json([]);
          } else {
            pool.release(db);
            res.json(result);
          }
        });
     });
    });
  };

  this.update_table = function(req, res) {
    pool.acquire(function(err, db) {
      db.query('SET names utf8').execute(function(err) {
       try {
        var c_db =  db.query()
        console.log(req.body);
        c_db.update(req.params.table);
        if(req.body.values) {
          c_db.set(JSON.parse(req.body.values));
        }
        var where_obj = JSON.parse(req.body.where);
        c_db.where(where_obj.str,where_obj.json);
        console.log(c_db.sql());
        c_db.execute(function(err,result) {
          if(err) {
            pool.release(db);
            res.json([]);
          } else {
            pool.release(db);
            res.json(result);
          }
        });
       } catch(err) {
         res.json([]);
         pool.release(db);
       }
     });
    });
  };
};

exports.gradnu = Gradnu;
