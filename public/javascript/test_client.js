
app.config(function($routeProvider) {
  $routeProvider.when('/test/client/:loop', {
    controller:TestController, 
    templateUrl:'static/test.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/test/noauth/:loop', {
    controller:TestNosecureController, 
    templateUrl:'static/test2.html'
  });
});


app.config(function($routeProvider) {
  $routeProvider.when('/faculty/program/test/:loop', {
    controller:TestdbController,
    templateUrl:'static/faculty/list_new.html'
  });
});
app.config(function($routeProvider) {
  $routeProvider.when('/test/di/program/:id/:loop', {
    controller:IntegrationController,
    templateUrl:'static/faculty/integrate.html'
  });
});

/*

app.config(function($routeProvider) {
  $routeProvider.when('/faculty/:id/programs/test/:loop', {
    controller:ProgramdbController,
    templateUrl:'static/faculty/program_list_new.html'
  });
});
*/

function TestController($scope,$http,$rootScope,$routeParams,Test) {
  var count=0;
  var interval = 1000;  // 1000 = 1 second, 3000 = 3 seconds
  var max=parseInt($routeParams.loop);
  Core_HMAC.key = 'RimbrpN1979';   
  console.time('atime');
  for (var i=1; i<max; i++) {
    var timest = ''+(new Date()).getTime();
    var query = {'num':i};
    var sign = Core_HMAC.generate({'query':
       {'timestamp':timest},'path':'/test/'+i});
    Test.get({'num':i,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey}, function(result){
        count++;   
        if (count==max-1) {
          console.timeEnd('atime');
        }
     }); 
    }
};

function TestNosecureController($scope,$http,$rootScope,$routeParams,Test2) {
  var count=0;
  var interval = 1000;  // 1000 = 1 second, 3000 = 3 seconds
  var max=parseInt($routeParams.loop);
  console.time('atime');
  for (var i=1; i<max; i++) {
    var timest = ''+(new Date()).getTime();
    Test2.get({'num':i},
      function(result){
        count++;   
        if (count==max-1) {
          console.timeEnd('atime');
        }
     }); 
    }
};

function TestdbController($scope,$http,$rootScope,$routeParams,RegDB) {
  console.log("test");
  console.log($routeParams.loop);
  var interval = 1000;  // 1000 = 1 second, 3000 = 3 seconds
  var count=0;
  var max=parseInt($routeParams.loop);
  console.time('atime');
  for (var i=1; i<max; i++) {
    var timest = ''+(new Date()).getTime();
    RegDB.query({'table':'faculty','num':i},function(result){
      console.log(result);
      RegDB.query({'table':'faculty','num':i},function(result){
      //$scope.faculty_list = result.rows;
        count++;   
        if (count==max-1) {
          console.timeEnd('atime');
        }
      });
     }); 
    }
};


function IntegrationController($scope, $routeParams, Student, Program, GradDB,
  Staff,HrDB,Faculty,RegDB,Education){
  var count=0;
  var count2=0;
  var count3=0;
  var json = null;
  var max=parseInt($routeParams.loop);
  console.time('atime');
  for (var i=1; i<max; i++) {
      var program_model = new ProgramModel();
      var faculty_model = new FacultyModel();
      var gradstaff_model = new GradStaffModel();
      program_model.get_program_test(RegDB,$routeParams.id,i,function(program_obj) {
        $scope.program = program_obj;
        program_obj.list_by_name_test(RegDB, i, function(program_list) {
        var student_active = [];
        var student_finish = [];
          for (var idx=0;idx<program_list.length;idx++){
             var program = program_list[idx];
             console.log(program.json.PROGRAMID);
             if(program.json.PROGRAMID == 330274645) continue;
             console.log(program.json.PROGRAMID);
                
          //angular.forEach(program_list, function(program) {
             program.students_test(RegDB, i, function(student_list) {
                 //for (var idx=0;idx<500;idx++){
                   //var student = student_list[idx];
                 angular.forEach(student_list, function(student){
                     if(student.active()){
                         student.get_assign_test(GradDB,i, function(a_res){
                              student.assign = a_res;
                              if(student.assign.json) {
                                  gradstaff_model.get_test(GradDB,
                                    student.assign.json.advisor_id,i,
                                    function(gs) {
                                    gs.nustaff_info_test(HrDB, i,
                                      function(staffmodel){
                                        //staffmodel.display_name_test(HrDB, i, 
                                          //function(result){
                                            //student.assign.advisor_name = result;
                                            count++;   
                                            if (count==max-1) {
                                              console.log($routeParams.loop);
                                              console.timeEnd('atime');
                                            }
                                              console.log(staffmodel);
                                         //});
                                    });
                                  });
                              }
                         });
                         student_active.push(student);
                         //console.log(student);
                     //} 
                     } else {
                         student_finish.push(student);
                     }
                 });

             });
          //});
          }
          console.log(student_active);
          //$scope.program.student_active_list = student_active;
        });
      });
  }

}


