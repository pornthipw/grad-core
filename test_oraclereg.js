var oracledb = require('oracledb');

oracledb.getConnection(
  {
    user          : "GRAD_USER01",
    password      : "rimbrpN1979",
    //connectString : "localhost/XE"
    connectString : "nuregist02.nu.local/NUREG"
    //connectString : "10.20.40.11:1521/NUREG"
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);
      return;
    }
    connection.execute(
      "SELECT LEVELID, LEVELNAME "
    + "FROM AVSREG.GRAD_LEVELID",
      {},
      function(err, result)
      {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result.rows);
      });
  });
