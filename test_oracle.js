var oracledb = require('oracledb');

oracledb.getConnection(
  {
    user          : "user",
    password      : "pass",
    //connectString : "localhost/XE"
    connectString : "host:port/databasename"
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);
      return;
    }
    var fetch_size = 90;
    var query = "SELECT * "
    + "FROM (SELECT a.*, ROWNUM AS rnum "
    + " FROM (SELECT * FROM PROMIS.V_NU_PUNDIT) a "
    + "WHERE ROWNUM <= :top) "
    + "WHERE rnum > :skip";
    var variable = {skip:0,top:0};
    var query_result = [];

    var i_query = function(query,variable) {
      variable.top += fetch_size;
      console.log(variable);
      connection.execute(
        query,
        variable,
        {outFormat: oracledb.OBJECT},
        function(err, result) {
          if (err) {
            console.error(err.message);
            add_result([]);
          }
          add_result(result.rows);
          if(result.rows.length == fetch_size) {
            variable.skip += fetch_size;
            i_query(query,variable);
          } else {
            console.log(query_result); 
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
