app.config(function($routeProvider) {
  $routeProvider.when('/student', {
    templateUrl:'static/student/main.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/student/report/english', {
    controller:EnglishReportController, 
    templateUrl:'static/student/report/english.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/student/:id', {
    controller:StudentController, 
    templateUrl:'static/student_info.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/faculty', {
    controller:FacultyListController,
    templateUrl:'static/faculty/list.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/faculty/:id', {
    controller:FacultyController,
    templateUrl:'static/faculty/info.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/faculty/:id/programs/', {
    controller:ProgramListByFacultyController,
    templateUrl:'static/faculty/program_list.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/program/:id', {
    controller:ProgramController,
    templateUrl:'static/program/info.html'
  });
});

function EnglishReportController($scope,RegDB,GradDB) {
  
  LevelModel.list_all(RegDB, function(res) {
    var filter_level = [33,21,23,24,25,26,36,34];
    $scope.level_list = [];
    angular.forEach(res, function(level) {
      if(filter_level.indexOf(level.json.LEVELID) > -1) {
        $scope.level_list.push(level);
      }
    });
  });
  
  FacultyModel.list_all(RegDB, function(res) {
    $scope.choice_faculty_list = res;
  });  
  
  var faculty_name = function(faculty_id) {
    for(var i=0;i<$scope.choice_faculty_list.length;i++) {
      if($scope.choice_faculty_list[i].json.FACULTYID == faculty_id) {
        return $scope.choice_faculty_list[i].json.FACULTYNAME;
      }
    }
  };

  var level_name = function(level_id) {
    for(var i=0;i<$scope.level_list.length;i++) {
      if($scope.level_list[i].json.LEVELID == level_id) {
        return $scope.level_list[i].json.LEVELNAME;
      }
    }
  };

  $scope.export_data = function() {
    var result='';
    angular.forEach($scope.faculty_list, function(faculty) {
      angular.forEach(faculty.level_list, function(level,key) {
        angular.forEach(level.admit_year, function(year,year_key) {
          result+=faculty.model.json.FACULTYNAME + '\t'
             + level.name + '\t'
             + year_key + '\t'
             + year.students.length + '\t'
             + year.pass + '\t'
             + '\n';
        });
      });
    });
    var dataUrl = 'data:text/csv;charset=utf-8,'+encodeURI(result);
    var link = document.createElement('a');
    var link_e = angular.element(link);
    link_e.attr('href',dataUrl);
    link_e.attr('download','conf.csv');
    link.click();
  };
  
  $scope.execute = function() {
    $scope.total_student = 0;
    $scope.retrieved_student = 0;
    var level_criteria = [];
    var faculty_list = [];
    $scope.faculty_list = faculty_list;

    angular.forEach($scope.level_list,function(level) {
      if(level.selected) {
        level_criteria.push(level.json.LEVELID);
      }
    });

    angular.forEach($scope.choice_faculty_list,function(faculty) {
      if(faculty.selected) {
        var faculty_view = {'model':faculty,'level_list':{}};
        faculty_list.push(faculty_view);
        faculty.list_program(RegDB, function(program_list) {
          angular.forEach(program_list, function(program) {
            if(level_criteria.indexOf(program.json.LEVELID)>-1) {
              if(!(program.json.LEVELID in faculty_view['level_list'])) {
                faculty_view['level_list'][program.json.LEVELID] = {
                  'name':level_name(program.json.LEVELID),
                  'admit_year':{}
                };
              }
              var level_obj = faculty_view['level_list'][program.json.LEVELID];
              var admit_obj = level_obj['admit_year'];
              program.active_students(RegDB, function(student_list) {
                $scope.total_student += student_list.length;
                angular.forEach(student_list,function(student) {
                  var admit_year = student.json.ADMITACADYEAR;
                  if(!(admit_year in admit_obj)) {
                    admit_obj[admit_year] = {'students':[], 'pass':0};
                  }
                  student.is_engresult(GradDB, function(pass) {
                    $scope.retrieved_student++;
                    admit_obj[admit_year].students.push(student);
                    if(pass) {
                      admit_obj[admit_year].pass++;
                    }
                  });
                });
              });
            }
          });
        });
      }
    });
  };
  
};

function StudentController($scope,$routeParams,Student,
  EnglishTest, GroupQualifyingExam) {  
    var reg_model = new StudentModel();
    reg_model.get(Student, parseInt($routeParams.id), 
      function(student) {
        $scope.student = student.json;    
        console.log(student);
        var p_model = new PermitModel();
        p_model.get_by_student(Permit, $routeParams.id,
          function(res){
            $scope.student.permit = res;
        });
        student.get_englishtest(EnglishTest,function(res){
          console.log(res); 
        }); 
        var qe_model = new GroupQualifyingExamModel();
        qe_model.get_qe_by_student(GroupQualifyingExam, $routeParams.id, 
          function(res){
            $scope.student.qe = res; 
            console.log(res); 
        });

    });
};

function FacultyListController($scope, Faculty){
  var faculty_model = new FacultyModel();
  faculty_model.list(Faculty, function(faculty_list){
    $scope.faculty_list = faculty_list;
  });
} 

function FacultyController($scope, $routeParams, Faculty){
  var faculty_model = new FacultyModel();
  faculty_model.get(Faculty, $routeParams.id, function(faculty){
    $scope.faculty = faculty;
  });
}

function ProgramListByFacultyController($scope, Student, 
  Faculty, Program, $routeParams, Level, GradDB, RegDB){
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
        'englishresult':0
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

  faculty_model.get(Faculty, faculty_id, function(faculty){
    $scope.level_list = {};
    $scope.faculty = faculty;
    $scope.faculty.status = f_status;
    $scope.retrieved_program = 0;
    $scope.total_program=0;

    faculty.list_program(Program, function(program_list) {
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
     });
     $scope.program_list = p_list;
   });
  });
} 

function ProgramController($scope, $routeParams, Student, Program, GradDB){
  var program_model = new ProgramModel();
  program_model.get(Program,$routeParams.id,function(program_obj) {
    $scope.program = program_obj;
    program_obj.list_by_name(Program, function(program_list) {
      var student_active = [];
      var student_finish = [];
      angular.forEach(program_list, function(program) {
        program.students(Student, function(student_list) {
          //console.log(student_list);
          angular.forEach(student_list, function(student){
            if(student.active()){
              
              student.get_assign(GradDB, function(res){
                student.assign = res;
                student.get_permit(GradDB, function(res){
                  student.permit = res;
                  student.get_exam(GradDB,function(res){
                    student.exam = res;
                    student.is_qeExam(GradDB,function(res){
                      student.qeExam = res;
                      //console.log(res);
                      student.is_engresult(GradDB,function(res){
                        student.engresult = res;
                        student.get_thesiscomplete(GradDB,function(res){
                          student.thesiscomplete = res;
                        });
                      });
                    });
                  });
                });
              });
              

              student_active.push(student);
            } else {
              student_finish.push(student);
            }     
          });
        });
      });
      $scope.program.student_active_list = student_active;
    });
  });
}

