var oracle = require('oracledb');
var http     = require('http');
var url      = require('url');
var generic_pool = require('generic-pool');
var Regnu = function(config) {

  this.list_table = function(req,res){
    console.log(req.query);
    console.log(req.params);
    var pool = oracle.createPool({
      user          : "GRAD_USER01",
      password      : "rimbrpN1979",
      connectString : "nuregist02.nu.local/NUREG",
      poolMax       : 2,
      poolMin       : 1
    },
    function(err,pool)
    {
      if (err) {
        console.error("createPool() callback:" + err.message);
        return;
      }else{
        console.log("test"+pool);
        pool.getConnection(function(err,connection) 
        {
          if (err) {
              console.error(err.message);
              return;
          }
          //console.log(connection);
            
           if(req.query.select) {
             var select_obj = JSON.parse(req.query.select);
             var sql = "SELECT"+ select_obj
                       + " FROM AVSREG.GRAD_"+req.params.table.toUpperCase();
           } else {
             var sql = "SELECT * FROM AVSREG.GRAD_"
                     +req.params.table.toUpperCase();
           }
           if(req.query.where){
             var where_obj = JSON.parse(req.query.where);
             console.log(where_obj)
             //c_db.where(where_obj.str,where_obj.json);
           }
           console.log(sql);
           connection.execute(sql,{},function(err, result) {
             //console.log(result.metaData);
             //console.log(result.rows);
              //res.json(result.rows); 
           });

         });
       }
     });
    }
 /*
  var pool = generic_pool.Pool({
    name:'regnu_pool',
    max:config.regnu_config.max_connection||1,
    create: function(callback) {
      new oracle.getConnection({
       user: "GRAD_USER01",
       password: "rimbrpN1979",
       connectString: "nuregist02.nu.local/NUREG"
      }).connect(function(error) {
        if(error) {
          console.error(err.message);
          return;
          //console.log("CONNECTION ERROR: " + error);
        } else {
          //callback(error,this);
          callback(error,this);

        }
      });
    },
    destroy:function(db) {
    }
  });

  /* 
  this.list_table = function(req, res) {
    pool.acquire(function(err, db) {
      var ret = {'value':0};
      console.log(req.params.num);
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
         
          //res.json(rows);
          if(req.params.num) {
            ret['value']=parseInt(req.params.num)+1;
          }
          res.json(rows);
          //res.json({'rows':rows,'ret':ret});
          
        }
      });
    });
  };
  */
// Report an error

};

exports.regnu = Regnu;
