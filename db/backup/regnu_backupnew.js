var oracle = require('oracledb');
var generic_pool = require('generic-pool');
var Regnu = function(config) {
  var pool = generic_pool.Pool({
    name:'regnu_pool',
    max:config.regnu_config.max_connection||1,
    create: function(callback) {
      oracle.getConnection({
       connectString: 
         config.regnu_config.hostname+":"+
         config.regnu_config.port+"/"+
         config.regnu_config.database, 
       user: config.regnu_config.user,
       password: config.regnu_config.password,
      },
        function(err,connection) {
        if(err) {
          console.log("CONNECTION ERROR: " + err);
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
      var ret = {'value':0};
      var select_fields = '';
      
      var from_table = 'AVSREG.GRAD_'+req.params.table.toUpperCase();
      if(req.query.select) {
        select_fields = JSON.parse(req.query.select);
        var sql_obj ='SELECT '+select_fields+
        ' FROM '+from_table+
        ' WHERE ROWNUM <= 10';
      } else {
        select_fields ='*';
        var sql_obj ='SELECT '+select_fields+
        ' FROM '+from_table+
        ' WHERE ROWNUM <= 10';
      }
      //select_fields ='*';
      if(req.query.where) {
        var where_obj = JSON.parse(req.query.where);
        console.log(where_obj);
        console.log(where_obj.str);
        console.log(where_obj.json);
        var old_str = where_obj.str;
        var new_str;
        new_str = old_str.replace(/(?)/g,'');
        var sql_obj ='SELECT '+select_fields+
        ' FROM '+from_table+
        ' WHERE '+new_str +''+where_obj.json
        +' ROWNUM <= 10';
        console.log(sql_obj);
        //c_db.where(where_obj.str,where_obj.json);
      }
      //console.log(c_db.sql());
      db.execute(sql_obj,
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
// Report an error

};

exports.regnu = Regnu;
