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
    var query = '';
    pool.acquire(function(err, db) {
        //console.log(req.query.select);
      console.log(req.params.table);
      var from_table = 'AVSREG.GRAD_'+req.params.table.toUpperCase();

      if (err) {
        console.error(err.message);
        return;
      }
      var fetch_size = 90;
      var nook_key = 'nookep';
      var variable = {skip:0,top:0};
      console.log(variable);
      if (req.query.select){
        var selected_fields = JSON.parse(req.query.select);
        console.log(selected_fields);
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
          if (where_obj.json == '') {
            var query = "SELECT "+selected_fields
            + " FROM (SELECT a.*, ROWNUM AS rnum "
            + " FROM (SELECT * FROM "+from_table
            + " WHERE "+where_obj.str
            + " ) a "
            + "WHERE ROWNUM <= :top) "
            + "WHERE rnum > :skip";
          } else {
            var query = "SELECT "+selected_fields
            + " FROM (SELECT a.*, ROWNUM AS rnum "
            + " FROM (SELECT * FROM "+from_table
            + " WHERE "+where_clause
            + " ) a "
            + "WHERE ROWNUM <= :top) "
            + "WHERE rnum > :skip";
            console.log(query);
          }
        } else {

          var query = "SELECT "+selected_fields
          + " FROM (SELECT a.*, ROWNUM AS rnum "
          + " FROM (SELECT * FROM "+from_table
          + " ) a "
          + "WHERE ROWNUM <= :top) "
          + "WHERE rnum > :skip";

        }

      } else {
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
            query = "SELECT * "
            + " FROM (SELECT a.*, ROWNUM AS rnum "
            + " FROM (SELECT * FROM "+ from_table
            + " WHERE "+where_obj.str
            + " ) a "
            + "WHERE ROWNUM <= :top) "
            + "WHERE rnum > :skip";
          } else {
            query = "SELECT * "
            + " FROM (SELECT a.*, ROWNUM AS rnum "
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
        //console.log(query_result.length);
      }
      console.log(query);
      i_query(query,variable);
    });
 
  };
// Report an error

};

exports.regnu = Regnu;
