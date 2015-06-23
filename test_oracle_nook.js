var oracledb = require('oracledb');
 //var where_params = {'str':'STUDENTSTATUS = ? AND ADMITACADYEAR = ? ','json':[40,2556]}; 
//var where_params = {'str':'STAFFID = ? OR STAFFID = ? ','json':[16363,16363]}; 
//var where_params = {"str":"PROGRAMID = ? or PROGRAMID = ? and (STUDENTSTATUS = 10 or STUDENTSTATUS = 11)","json":[330275845,330275845]}
var where_params = {"str":"PROGRAMID = ? and (STUDENTSTATUS = 10 or STUDENTSTATUS = 11)","json":[330275845,]}
//var where_params = {'str':'STUDENTCODE = ? OR STUDENTCODE = ?','json':[54030867,54030867]}; 
//var select_params = ["FNAME"];
oracledb.getConnection(
  {
    user: 'user',
    password: 'pass',
    connectString : "host:port/dbname"
    //user          : "d_pundit",
    //password      : "123456",
    //connectString : "10.20.10.116:1521/HRNU"
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);

      return;
    }
    var from_table = 'AVSREG.GRAD_STUDENTINFO';
    //var from_table = 'PROMIS.V_NU_'+req.params.table.toUpperCase();
    var fetch_size = 90;
    var nook_key = 'nookep'
    var arr = where_params.str.split("?");
    var str_wh = JSON.stringify(where_params.json); 
    var where_clause = '';
    var variable = {skip:0,top:0};
    var idx = 0;

    if (str_wh.search(',')) {
      var arr1 = str_wh.split(",");
        console.log(arr1);
        var num = arr1.length;
        console.log(num); 
    }else{
      var num = str_wh.length;
    } 

    for(var i=0;i<num;i++) {
      if(arr[i].indexOf("=") > -1) {
        var key_idx=nook_key+idx;     
        console.log(key_idx);
        where_clause += arr[i]+':'+key_idx;     
        variable[key_idx]=where_params.json[idx];
        idx++;
      }
    }
    for(var j=num;j<arr.length;j++) {
      var where_o = where_clause+" "+arr[j];
      console.log(where_o);
    }
    //for(var i=0;i<arr1.length;i++) {
    //  if(arr1[i].indexOf("=") > -1) {
    //  }
    //}
    /*
    for(var i=0;i<arr.length;i++) {
      if(arr[i].indexOf("=") > -1) {
        //console.log(arr[i]);
        var key_idx=nook_key+idx;     
        where_clause += arr[i]+':'+key_idx;     
        variable[key_idx]=where_params.json[idx];
        idx++;
        console.log(idx);
      }
  
    }
    */
    console.log(where_clause);
    console.log(variable);

    var query = "SELECT * "
    + "FROM (SELECT a.*, ROWNUM AS rnum "
    //+ " FROM (SELECT * FROM PROMIS.V_NU_PUNDIT "
    + " FROM (SELECT * FROM "+from_table
    //+ " WHERE "+where_clause
    + " WHERE "+where_o
    + " ) a "
    + "WHERE ROWNUM <= :top) "
    + "WHERE rnum > :skip";
    console.log(query);
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
