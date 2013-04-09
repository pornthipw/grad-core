var app = angular.module('db_service', ['ngResource']);

var prefix = '/apps/core';
//var prefix = '';

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

app.factory('Student', function($resource) {
    var Student = $resource(
      prefix + '/reg/studentinfo/:id', 
      {},{});                         
    return Student;    
});

app.factory('Staff', function($resource) {
    var Staff = $resource(
      prefix + '/hrnu/pundit/', 
      {},{});                         
    return Staff;    
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


app.factory('AdvisorAssignment', function($resource) {
    var AdvisorAssignment = $resource(
      prefix + '/gradnu/regnu_grad_advisorassignment/', 
      {},{});                         
    return AdvisorAssignment;    
});
