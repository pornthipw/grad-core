
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
  $routeProvider.when('/faculty/:id/programs/test/:loop', {
    controller:TestProgramController,
    templateUrl:'static/faculty/program_list_new.html'
  });
});

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

function TestdbController($scope,$http,$rootScope,$routeParams,Test2) {
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

function TestProgramController($scope, Student, 
  Faculty, Program, $routeParams, Level, GradDB, RegDB,$rootScope){
  var count=0;
  var interval = 1000;  // 1000 = 1 second, 3000 = 3 seconds
  var max=parseInt($routeParams.loop);
  console.time('atime');
  //for (var i=1; i<max; i++) {
    var timest = ''+(new Date()).getTime();


  var self = this;

  var f_status = {};

  this.get_student_status = function(student_list, idx, level_id, callback) {
    var student = student_list[idx];

    var admit_year = student.json.ADMITACADYEAR;
    if(!(admit_year in f_status[level_id]['admit_year'])) {
      f_status[level_id]['admit_year'][admit_year] = {
        'students':0,
        'assign':0,
        'permit':0,
        'exam':0,
        'qeexam':0,
        'thesiscomplete':0,
        'englishresult':0,
        'publication':0
      };
    }

    student.is_assign(GradDB, function(is_assign) { 
      if(is_assign) {
        f_status[level_id]['admit_year'][admit_year].assign++;
      }
      student.is_permit(GradDB,function(is_permit) {
        if(is_permit) {
          f_status[level_id]['admit_year'][admit_year].permit++;
        }
        student.is_exam(GradDB,function(is_exam) {
          if(is_exam) {
            f_status[level_id]['admit_year'][admit_year].exam++;
          } 
          student.is_qeExam(GradDB,function(is_qeExam) {
            if(is_qeExam) {
              f_status[level_id]['admit_year'][admit_year].qeexam++;
            }
            student.is_thesiscomplete(GradDB,function(is_thesiscomplete) {
              if(is_thesiscomplete) {
                f_status[level_id]['admit_year'][admit_year].thesiscomplete++;
              } 

              student.is_publication(GradDB,function(is_publication) {
                if(is_publication) {
                  f_status[level_id]['admit_year'][admit_year].publication++;
                } 

              student.is_engresult(GradDB,function(is_engresult) {
                if(is_engresult) {
                  f_status[level_id]['admit_year'][admit_year].englishresult++;
                } 
                f_status[level_id]['admit_year'][admit_year].students++;
                $scope.retrieved_student++;
                //console.log('Student IDX '+idx);
                if((idx+1)==student_list.length) {
                  callback();
                } else {
                  self.get_student_status(student_list, idx+1,level_id, callback);
                }
              });

              });
            });
          });
        });
      });
    });
  };
  this.list_sync_program = function(program_list, idx, level_id, callback) {
    var program = program_list[idx];
    if(program) {
      //console.log('Program IDX '+idx + ' ['+program.student_active_list.length+']');
      if(program.student_active_list.length == 0) {
        self.list_sync_program(program_list, idx+1,level_id, callback);
      } else {

        if(level_id == program.level_id) {
          if(!(level_id in f_status)) {
            f_status[level_id]={'name':'','admit_year':{}};
            LevelModel.get(Level, level_id, function(level) {
              f_status[level_id].name = level.json.LEVELNAME;
              f_status[level_id].master = level.is_master();
            });
          }

          self.get_student_status(program.student_active_list,0,level_id,function() {
            if(program_list.length == (idx+1)) {
              callback();
            } else {
              self.list_sync_program(program_list, idx+1,level_id,callback);
            }
          });
        } else {
          self.list_sync_program(program_list, idx+1,level_id, callback);
        }
      }
    }
  };
  $scope.report_by_level = function(level_id) {
    f_status = {};
    $scope.faculty.status = f_status;
    $scope.total_student = $scope.level_list[level_id].active;
    $scope.retrieved_student = 0;
    self.list_sync_program($scope.program_list, 0, level_id, function() { 
      console.log('Done List Program');
    });
  };
  
  var faculty_id = $routeParams.id; 
  var faculty_model = new FacultyModel();

    //Test2.get({'num':i},
  var where_json = {'str':'FACULTYID = ?','json':[faculty_id]};
  RegDB.get({'table':'faculty',where:where_str,function(faculty){
    //console.log(faculty);
    //if (faculty.length == 1) {
       //self.json = res[0]; 
      //}
  //faculty_model.get(Faculty, faculty_id, function(faculty){
    $scope.level_list = {};
    $scope.faculty = faculty;
    $scope.faculty.status = f_status;
    $scope.retrieved_program = 0;
    $scope.total_program=0;

    faculty.list_program(RegDB, function(program_list) {
      var p_dict = {};
      angular.forEach(program_list, function(program) {
        var p_name = program.json.PROGRAMNAME;
        if(!(p_name in p_dict)) {
          p_dict[p_name] = [];
        }
        p_dict[p_name].push(program);
        $scope.total_program++;
      });
      var p_list = [];
      angular.forEach(p_dict, function(value, key) {
        var p_obj = {'name':key, 
         'id':value[0].json.PROGRAMID, 
         'list':value,
         'level_id':value[0].json.LEVELID,
         'student_active_list':[],
         'active':0,
        };
        
        if(!(value[0].json.LEVELID in $scope.level_list)) {
          $scope.level_list[value[0].json.LEVELID] = {'model':{},'active':0};
          LevelModel.get(Level, value[0].json.LEVELID, function(level) {
            $scope.level_list[value[0].json.LEVELID].model = level;
          });
        }

        angular.forEach(value, function(program) {
          //console.log(program);
          program['active']=0;
          program.active_students(RegDB, function(student_list) {
           $scope.retrieved_program++;
           angular.forEach(student_list, function(student) {
           //  if(student.active()) {
               $scope.level_list[value[0].json.LEVELID].active++;
               p_obj['student_active_list'].push(student);
               program['active']++;
           //////  }
           });
           p_obj.active += program['active'];
         });
        });
        p_list.push(p_obj);
          //nook
          count++;   
            if (count==max-1) {
              console.timeEnd('atime');
          }
          //endnook
     });
     $scope.program_list = p_list;
   });
   //}
  });
  //}
} 
