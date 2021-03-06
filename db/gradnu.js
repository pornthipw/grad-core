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
      console.log(db);
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
        var c_db =  db.query();
        var ret = {'value':0};
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

  //test external 
  
  this.get_assign = function(req, res) {
    pool.acquire(function(err, db) {
      var callback_fn = req.query.callback;
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        //db.select('*').from('regnu_grad_advisorassignment')
        c_db.select('*').from(req.params.table)
        .where('advisor_id = ?',[req.params.id]);
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
            if (rows.length > 0 ) {
              rows.forEach(function(mapping) {
                //pool.release(db);
                bibtex_list.push(mapping);
                if(bibtex_list.length == rows.length) {
                    pool.release(db);
                    if(callback_fn) {
                     res.send(callback_fn+'('+JSON.stringify(bibtex_list)+');');
                     console.log("m");
                    } else {
                     res.json(bibtex_list);
                    }
                }
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

  this.get_englishdb = function(req, res) {
    pool.acquire(function(err, db) {
      var callback_fn = req.query.callback;
      //console.log(callback_fn);
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        console.log(c_db);
        c_db.select('*').from(req.params.table)
        //c_db.select('*').from('regnu_grad_permit')
        .where('STUDENTCODE = ? AND pass_test = 1 ',[req.params.id]);
        var object_list = [];
        c_db.execute(function(err, rows) {
          //console.log(rows.length);
          if(err) {
            pool.release(db);
            if(callback_fn) {
              res.send(callback_fn+'([]);');
            } else {
              res.json([]);
            }
          } else {
            if (rows.length > 0 ) {
              rows.forEach(function(mapping) {
                object_list.push(rows[0]);
                console.log(object_list.length);
                if(object_list.length == rows.length) {
                    pool.release(db);
                    if(callback_fn) {
                     res.send(callback_fn+'('+JSON.stringify(object_list)+');');
                     console.log("n");
                    } else {
                     res.json(object_list);
                    }
                }
              });
            }else {
              pool.release(db);
              if(callback_fn) {
               //res.send(callback_fn+'([]);');
               var a = [{'STUDENTCODE':req.params.id,'pass_test':0}];
               res.send(callback_fn+'('+JSON.stringify(a)+');');
              } else {
               res.json([]);
              }
             //});
            }
          }
        });
      });
    });
  }

  this.get_graddb = function(req, res) {
    pool.acquire(function(err, db) {
      var callback_fn = req.query.callback;
      //console.log(callback_fn);
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        console.log(c_db);
        c_db.select('*').from(req.params.table)
        .where('student = ?',[req.params.id]);
        var object_list = [];
        c_db.execute(function(err, rows) {
          //console.log(rows.length);
          if(err) {
            pool.release(db);
            if(callback_fn) {
              res.send(callback_fn+'([]);');
            } else {
              res.json([]);
            }
          } else {
            if (rows.length > 0 ) {
              //rows.forEach(function(mapping) {
                object_list.push(rows[0]);
                //console.log(object_list.length);
                if(object_list.length == rows.length) {
                    pool.release(db);
                    if(callback_fn) {
                     res.send(callback_fn+'('+JSON.stringify(object_list)+');');
                     console.log(object_list);
                    } else {
                     res.json(object_list);
                    }
                }
              //});
            }else {
              pool.release(db);
              if(callback_fn) {
               var a = [{'student':req.params.id,'permit_date':'','exam_date':'','thesiscomplete_date':'','publication_date':''}]
               res.send(callback_fn+'('+JSON.stringify(a)+');');
               //res.send(callback_fn+'([]);');
              } else {
               res.json([]);
              }
            }
          }
        });
      });
    });
  }

  this.get_qedb = function(req, res) {
    pool.acquire(function(err, db) {
      var callback_fn = req.query.callback;
      console.log(db);
      db.query('SET names utf8').execute(function(err) {
        var c_db =  db.query()
        c_db.select('*').from('regnu_grad_groupqualifyingexamination')
        .where('student = ? AND result = 1' ,[req.params.id]);
        var qe_list = [];
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
              //rows.forEach(function(mapping) {
                  qe_list.push(rows[0]);
                  if(qe_list.length == rows.length) {
                    pool.release(db);
                    if(callback_fn) {
                     res.send(callback_fn+'('+JSON.stringify(qe_list)+');');
                    } else {
                     res.json(qe_list);
                    }
                  }
              //});
            } else {
              pool.release(db);
              if(callback_fn) {
               var a = [{'student':req.params.id,'result':0}]
               res.send(callback_fn+'('+JSON.stringify(a)+');');
               //res.send(callback_fn+'([]);');
              } else {
               res.json([]);
              }
            }
          }
        });
      });
    });
  }
  

};

exports.gradnu = Gradnu;
