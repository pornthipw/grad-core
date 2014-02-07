var generic_pool = require('generic-pool');
var mysql = require('db-mysql');

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

  this.get_bibtex = function(req, res) {
    pool.acquire(function(err, db) {
      var callback_fn = req.query.callback;
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        c_db.select('*').from('hrnu_grad_gradstaffpublication')
        .where('nu_id = ?',[req.params.id]);
        var bibtex_list = [];
        c_db.execute(function(err, rows) {
          if(err) {
            pool.release(db);
            if(callback_fn) {
             res.send(callback_fn+'([]);');
            } else {
             res.json([]);
            }
          } else {
            if(rows.length > 0) {
              rows.forEach(function(mapping) {
                var b_db=db.query();
                b_db.select('*').from('bibtex_entry')
                  .where('id = ?',[mapping.bibtex_id]);
                b_db.execute(function(b_err, b_entry) {
                  if(b_err) {
                    bibtex_list.push({});
                  } else { 
                    bibtex_list.push(b_entry[0]);
                  }
                  if(bibtex_list.length == rows.length) {
                    pool.release(db);
                    if(callback_fn) {
                     res.send(callback_fn+'('+JSON.stringify(bibtex_list)+');');
                    } else {
                     res.json(bibtex_list);
                    }
                  }
                });
              });
            } else {
              pool.release(db);
              if(callback_fn) {
               res.send(callback_fn+'([]);');
              } else {
               res.json([]);
              }
            }
          }
        });
      });
    });
  }
  
  this.list_table = function(req, res) {
    pool.acquire(function(err, db) {
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
            //Start process
            //End Process
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
        //console.log(req.body);
        c_db.update(req.params.table);
        if(req.body.values) {
          c_db.set(JSON.parse(req.body.values));
        }
        var where_obj = JSON.parse(req.body.where);
        c_db.where(where_obj.str,where_obj.json);
        //console.log(c_db.sql());
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

  this.delete_table = function(req, res) {
    pool.acquire(function(err, db) {
      db.query('SET names utf8').execute(function(err) {
       try {
        var c_db =  db.query()
        //console.log("test--"+req.body);
        c_db.delete().from(req.params.table);
        var where_obj = JSON.parse(req.body.where);
        c_db.where(where_obj.str,where_obj.json);
        //console.log(c_db.sql());
        c_db.execute(function(err,result) {
          if(err) {
            pool.release(db);
            res.json({});
          } else {
            pool.release(db);
            res.json(result);
          }
        });
       } catch(err) {
         res.json({});
         pool.release(db);
       }
     });
    });
  };

  this.insert_bibtex = function(req, res) {
    pool.acquire(function(err, db) {
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        //console.log(req.body);
        c_db.insert('bibtex_entry', 
          JSON.parse(req.body.fields), 
          JSON.parse(req.body.values));
        //c_db.insert(req.params.table, 
        //  JSON.parse(req.body.fields), 
        //  JSON.parse(req.body.values));
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

};

exports.gradnu = Gradnu;
