var http = require('http');
var querystring = require('querystring');

var prefix = 'http://www.db.grad.nu.ac.th/apps/core';

var options = {
  hostname:'www.db.grad.nu.ac.th',
  port:80,
};


var request = function(url,cb) { 
 http.get(prefix+url, function(res) {
  var content='';
  res.on('data', function(chunk) {
   content+=chunk;
  });
  res.on('end', function() {
   cb(JSON.parse(content));
  });
 });
};


var student_map = function() {

request('/gradnu/regnu_grad_studentpublication', function(result) {
 result.forEach(function(test) {
  console.log('Updating '+test.student);
  // get student
  var where = JSON.stringify({'str':'STUDENTCODE = ?','json':[test.student]});
  request('/reg/studentinfo/?where='+where,function(students) {
    var student = students[0];
    var author = student.STUDENTNAME+' '+student.STUDENTSURNAME;

    var q = {
     'values': JSON.stringify({'author':author}),
     'where': JSON.stringify({ 
       'str': 'id = ?',
       'json': [test.bibtex_id]
     })
    };
    var q_string = querystring.stringify(q);

    var req = http.request({
     'hostname':'www.db.grad.nu.ac.th',
     'path':'/apps/core/gradnu/bibtex_entry',
     'method':'PUT',
     'headers':{
       'Content-Length':q_string.length,
       'Content-Type':'application/x-www-form-urlencoded',
     }}, function(res) {

     var content='';
     res.on('data', function(chunk) {
      content+=chunk;
     });

     res.on('end', function() {
      console.log(JSON.parse(content));
     });

    });
    req.write(q_string);
    req.end();
  });
 });
});

};

var faculty_map = function() {
 request('/gradnu/hrnu_grad_gradstaffpublication', function(result) {
  result.forEach(function(test) {
   console.log('Updating '+test.grad_staff_id);
   // get staff
   var where = JSON.stringify({'str':'id = ?','json':[test.grad_staff_id]});
   request('/gradnu/hrnu_grad_gradstaff/?where='+where,function(gradstaffs) {
    var gradstaff = gradstaffs[0];
    var author = gradstaff.first_name+' '+gradstaff.last_name;
    var q = {
     'values': JSON.stringify({'author':author}),
     'where': JSON.stringify({ 
       'str': 'id = ?',
       'json': [test.bibtex_id]
     })
    };
    var q_string = querystring.stringify(q);

    var req = http.request({
     'hostname':'www.db.grad.nu.ac.th',
     'path':'/apps/core/gradnu/bibtex_entry',
     'method':'PUT',
     'headers':{
       'Content-Length':q_string.length,
       'Content-Type':'application/x-www-form-urlencoded',
     }}, function(res) {

     var content='';
     res.on('data', function(chunk) {
      content+=chunk;
     });

     res.on('end', function() {
      console.log(JSON.parse(content));
     });
    });
    req.write(q_string);
    req.end();
   });
  });
 });
};


faculty_map();
  
/*

    var q_string = querystring.stringify(q);

    var req = http.request({
     'hostname':'www.db.grad.nu.ac.th',
     'path':'/apps/core/gradnu/bibtex_entry',
     'method':'PUT',
     'headers':{
       'Content-Length':q_string.length,
       'Content-Type':'application/x-www-form-urlencoded',
     }}, function(res) {

     var content='';
     res.on('data', function(chunk) {
      content+=chunk;
     });

     res.on('end', function() {
      console.log(JSON.parse(content));
     });

    });
    req.write(q_string);
    req.end();
  });
 });
});

};
*/
