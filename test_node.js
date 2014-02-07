var http = require('http');
var fs = require('fs');
var os  = require('os');
var read = fs.readFileSync;
var request = require("request").defaults({ encoding: null });

//var config = require('./config_test');

/*
console.log(os.type());
console.log(os.arch());
console.log(os.release());
console.log(process.version);
*/

callAvgSpeed();

function calc(cb) {
  var time = process.hrtime();
  request('http://www.db.grad.nu.ac.th/apps/core/reg/LEVELID', function (error, response, body) {
    if (!error && response.statusCode == 200) {
     var diff_time = process.hrtime(time);
     cb(diff_time[0]*1e3 + diff_time[1]/1e6);
    }
  });
}
  
function callAvgSpeed(){
  var max=process.argv[2];
  var diff = [];
  var avg = 0.0;
  var finish_count = 0;
  for(var i=0;i<max;i++) {
    calc(function(time) {
      console.log(time);
      avg+=time/max;
      finish_count++;
      diff.push(time);
      if(finish_count == max) {
        console.log('AVG = '+avg);
      }
    });
  }
}


// node test_node.js > log.txt
