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
      //where =:{"str":"FNAME LIKE '%ภูพงษ์%' OR LNAME LIKE '%ภูพงษ์%'","json":[]}
      //console.log(req.query.select);
      var from_table = 'PROMIS.V_NU_'+req.params.table.toUpperCase();
      console.log(req.params.table);
      if (err) {
        console.error(err.message);
        return;
      }
      var fetch_size = 90;
      var nook_key = 'nookep';
      var variable = {skip:0,top:0};
      console.log(variable);
      if (req.query.where){
        
        var where_obj = JSON.parse(req.query.where);
        var arr = where_obj.str.split("?");
        var where_clause = '';
        var idx = 0;
        for(var i=0;i<arr.length;i++) {
          if(arr[i].indexOf("=") > -1) {
            var key_idx=nook_key+idx;
            where_clause += arr[i]+':'+key_idx;
            variable[key_idx]=where_obj.json[idx];
            idx++;
          }
        }
      //console.log(where_clause);
        if (where_obj.json == '') {
          var query = "SELECT * "
          + "FROM (SELECT a.*, ROWNUM AS rnum "
          + " FROM (SELECT * FROM "+from_table
          + " WHERE "+where_obj.str
          + " ) a "
          + "WHERE ROWNUM <= :top) "
          + "WHERE rnum > :skip";
        } else {
          var query = "SELECT * "
          + "FROM (SELECT a.*, ROWNUM AS rnum "
          + " FROM (SELECT * FROM "+from_table
          + " WHERE "+where_clause
          + " ) a "
          + "WHERE ROWNUM <= :top) "
          + "WHERE rnum > :skip";
        }
      } 
      if (req.query.select){
        var selected_fields = JSON.parse(req.query.select);
        if (where_obj.json == '') {
          var query = "SELECT "+selected_fields
          + "FROM (SELECT a.*, ROWNUM AS rnum "
          + " FROM (SELECT * FROM "+from_table
          + " WHERE "+where_obj.str
          + " ) a "
          + "WHERE ROWNUM <= :top) "
          + "WHERE rnum > :skip";
        } else {
          var query = "SELECT "+selected_fields
          + "FROM (SELECT a.*, ROWNUM AS rnum "
          + " FROM (SELECT * FROM "+from_table
          + " WHERE "+where_clause
          + " ) a "
          + "WHERE ROWNUM <= :top) "
          + "WHERE rnum > :skip";
        }


      }else{

          var query = "SELECT * "
          + "FROM (SELECT a.*, ROWNUM AS rnum "
          + " FROM (SELECT * FROM "+from_table
          + " ) a "
          + "WHERE ROWNUM <= :top) "
          + "WHERE rnum > :skip";
      }

      var query_result = [];

      var i_query = function(query,variable) {
        variable.top += fetch_size;
        console.log(variable);
        db.execute(
          query,
          variable,
          {outFormat: oracle.OBJECT},
          function(err, result) {
            pool.release(db);
            if (err) {
              console.error(err.message);
              add_result([]);
            }
              
            add_result(result.rows);
            if(result.rows.length == fetch_size) {
              variable.skip += fetch_size;
              i_query(query,variable);
            } else {
              //console.log(query_result);
              res.json(query_result);
            }
          });
      };
      var add_result = function(result) {
        for(var i=0;i<result.length;i++) {
          query_result.push(result[i]);
        }
        console.log(query_result.length);
      }
      i_query(query,variable);
    });
    /*
    var add_result = function(result) {
      for(var i=0;i<result.length;i++) {
        query_result.push(result[i]);
      }
     console.log(query_result.length);
    }
    */

  };

};


exports.hrnu = Hrnu;
