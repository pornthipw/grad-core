var app = angular.module('db_service', ['ngResource']);

var prefix = '/apps/core';
//var prefix = '';

app.factory('HMAC', function() {
  var generate = {
    run : function(req) {
      var key = 'nook123';
      var json_obj = {};
      var key_list = [];
      var str = '';
      for(var key in req.query) {
        key_list.push(key);
      };
      key_list.sort();
      key_list.forEach(function(key) {
        if(key in req.query) {
          json_obj[key] = req.query[key];
        } 
      });

      str += req.path+'/n'+JSON.stringify(json_obj);
      console.log("Client-->"+str);
      var MD5 = new Hashes.MD5;
      console.log('ClientMD5 -> '+MD5.b64_hmac(str,key));
    }
  };
  return generate;
});

app.factory('Level', function($resource) {
    var Level = $resource(
      prefix + '/reg/levelid/:id', 
      {},{
        query:{
          method:'GET', 
          params:{
           'select':JSON.stringify(['LEVELID', 'LEVELNAME']),
         //  'where':JSON.stringify({
         //    'str':"LEVELNAME LIKE '%โท%'",
         //    'json': []
         //  })
          },
          isArray:true
        }                         
      }
    );
    return Level;    
});


app.factory('Faculty', function($resource) {
    var Faculty = $resource(
      prefix + '/reg/faculty/:id', 
      {},{});                         
    return Faculty;    
});


app.factory('Program', function($resource) {
    var Program = $resource(
      prefix + '/reg/program_new/:id', 
      {},{});                         
    return Program;    
});

app.factory('Student', function($resource) {
    var Student = $resource(
      prefix + '/reg/studentinfo/:id', 
      {},{});                         
    return Student;    
});

app.factory('EnglishTest', function($resource) {
    var EnglishTest = $resource(
      prefix + '/reg/studentenglishtest/:id', 
      {},{});                         
    return EnglishTest;    
});

//app.factory('Transcript', function($resource) {
//    var Transcript = $resource(
//      prefix + '/reg/studentranscript/:id', 
//      {},{});                         
//    return Transcript;    
//});

app.factory('Staff', function($resource) {
    var Staff = $resource(
      prefix + '/hrnu/pundit/', 
      {},{});                         
    return Staff;    
});

app.factory('HrDB', function($resource) {
  var HrDB = $resource(prefix + '/hrnu/:table/', {},{}); 
  return HrDB;    
});

app.factory('RegDB', function($resource) {
  var RegDB = $resource(prefix + '/reg/:table/', {},{}); 
  return RegDB;    
});


app.factory('Education', function($resource) {
    var Education = $resource(
      prefix + '/hrnu/educationhis/', 
      {},{
        query:{
          method:'GET',
          params: {
           'select': JSON.stringify([
              'STAFFID',
              'BYTEDES',
              'DEGREENAMEABB',
              'DEGREENAME',
              'MAJORNAME',
              'UNIVERSITYNAME',
              'COUNTRYNAME'
           ])
         },
         isArray:true
        }
      });                         
    return Education;    
});


app.factory('GradStaff', function($resource) {
    var GradStaff = $resource(
      prefix + '/gradnu/hrnu_grad_gradstaff/', 
      {},{
        query:{
          method:'GET',
          params:{
            'select': JSON.stringify([
              'id',
              'prefix',
              'first_name',
              'last_name',
              'position',
              'faculty',
              'nu_staff'])
          },
          isArray:true
        }
      }
    );                         
    return GradStaff;    
});

app.factory('BibTex', function($resource) {
  var BibTex = $resource(
    prefix + '/gradnu/bibtex_entry/', 
    {},{
     'update':{'method':'PUT'}
    }
  );                         
  return BibTex;
});

app.factory('GradDB', function($resource) {
  var GradDB = $resource(
    prefix + '/gradnu/:table/', 
    {},{
     'post':{method:'POST'}
    }
  );                         
  return GradDB;
});


app.factory('QualifyingExam', function($resource) {
    var QualifyingExam = $resource(
      prefix + '/gradnu/regnu_grad_qualifyingexamination/', 
      {},{});                         
    return QualifyingExam;    
});

app.factory('GroupQualifyingExam', function($resource) {
    var GroupQualifyingExam = $resource(
      prefix + '/gradnu/regnu_grad_groupqualifyingexamination/', 
      {},{});                         
    return GroupQualifyingExam;    
});


