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
  $routeProvider.when('/reports/faculty', {
    controller:ReportByProgramController,
    templateUrl:'static/reports/report_new.html'
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
  $routeProvider.when('/faculty/:id/programs/students', {
    controller:ProgramListByFacultyStudentController,
    templateUrl:'static/faculty/program_student_list.html'
  });
});


app.config(function($routeProvider) {
  $routeProvider.when('/faculty/:id/programs/students/test', {
    controller:TestController,
    templateUrl:'static/faculty/test_list.html'
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
   
  var level_is_master = function(level_id) {
    return level_id > 20 && level_id < 30;
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
  
  $scope.type_list = [
    {'name':'EnglishResult', 'attr':'pass','desc':'การสอบภาษาอังกฤษ'},
    {'name':'QEResult', 'attr':'qepass','desc':'การสอบวัดคุณสมบัติ'},
    {'name':'PublicationResult', 'attr':'pubpass','desc':'การตีพิมพ์'},
  ];
  $scope.execute = function() {
    $scope.count_type = 0;
    var type_english = false;
    var type_qe = false;
    var type_pub = false;

    angular.forEach($scope.type_list, function(type) {
      //console.log(type);
      if(type.selected) {
        if(type.attr == 'pass') {
          type_english=true;
        }
        if(type.attr == 'qepass') {
          type_qe=true;
        }
        if(type.attr == 'pubpass') {
          type_pub=true;
        }
        $scope.count_type++;
        type.executed = true;
        $scope.current = type.name;         
        console.log($scope.current); 
      } else {
        type.executed = false;
      }
    });
    
    $scope.year_list = [];
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
                  'master':level_is_master(program.json.LEVELID),
                  'admit_year':{}
                };
              }
              var level_obj = faculty_view['level_list'][program.json.LEVELID];
              var admit_obj = level_obj['admit_year'];
              program.active_students(RegDB, function(student_list) {
                $scope.total_student += student_list.length;
                angular.forEach(student_list,function(student) {
                  var admit_year = student.json.ADMITACADYEAR;
                  if($scope.year_list.indexOf(admit_year)==-1) {
                    $scope.year_list.push(admit_year);
                    $scope.year_list.sort();
                  }
                  if(!(admit_year in admit_obj)) {
                    admit_obj[admit_year] = {'students':[], 
                    'pass':0, 'qepass':0};
                  }

                  admit_obj[admit_year].students.push(student);

                  if(type_english) {
                    student.is_engresult(GradDB, function(pass) {
                      $scope.retrieved_student++;
                      if(pass) {
                        admit_obj[admit_year].pass++;
                      }
                    });
                  }

                  if(type_qe) {
                    student.is_qeExam(GradDB,function(pass) {
                      $scope.retrieved_student++;
                      if(pass) {
                        admit_obj[admit_year].qepass++;
                      }
                    });
                  }

                  if(type_pub) {
                    student.is_publication(GradDB,function(pass) {
                      $scope.retrieved_student++;
                      if(pass) {
                        admit_obj[admit_year].pubpass++;
                      }
                    });
                  }

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

function FacultyListController($scope, Faculty ,HMAC){
  var faculty_model = new FacultyModel();
  faculty_model.list(Faculty, function(faculty_list){
    console.log(faculty_list);
    $scope.faculty_list = faculty_list;
  });
} 

function FacultyController($scope, $routeParams, RegDB, HMAC){
  FacultyModel.get(RegDB, $routeParams.id, function(faculty) {
    $scope.faculty = faculty;
  });
}

function ReportByProgramController($scope, Student, 
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
   
  
  $scope.year_list = [];
  //$scope.total_student = 0;
  $scope.get_student = 0;
  $scope.master_student = 0;

  FacultyModel.list_all(RegDB, function(faculty_list) {
    $scope.faculty_list = faculty_list;
    //console.log($scope.faculty);
    angular.forEach(faculty_list, function(faculty) {
      FacultyModel.get(RegDB, faculty.json.FACULTYID, function(faculty) {
        $scope.level_list = {};
        $scope.faculty = faculty;
        $scope.faculty.status = f_status;
        $scope.retrieved_program = 0;
        $scope.total_program=0;
        faculty.list_program(RegDB, function(program_list) {
          //console.log(program_list);
          var p_dict = {};
          $scope.faculty_dict = {}
          angular.forEach(program_list, function(program) {
            var p_name = program.json.PROGRAMNAME;
            if(!(p_name in p_dict)) {
              //p_dict[p_name] = [];
              p_dict[p_name] = {'name':program.json.PROGRAMNAME,'year':{},'p':[]};
            }
            //p_dict[p_name]['p'].push(program);
            p_dict[p_name]['p'].push(program);
            $scope.total_program++;
              if(!(program.json.FACULTYID in $scope.faculty_dict)){
                $scope.faculty_dict[program.json.FACULTYID] = 
                  {
                    'name':program.json.PROGRAMNAME,
                    'program_list':[],
                    'year_list':[]
                  };
              }
              $scope.faculty_dict[program.json.FACULTYID]['program_list'].push(p_dict[p_name]);
              program.active_students(RegDB, function(student_list) {
                $scope.retrieved_program++;
                angular.forEach(student_list, function(student) {
                  if(!(student.json.ADMITACADYEAR in p_dict[p_name]['year'])) {
                    p_dict[p_name]['year'][student.json.ADMITACADYEAR] = {
                     'year':student.json.ADMITACADYEAR
                     }; 
                    if($scope.year_list.indexOf(student.json.ADMITACADYEAR) == -1) {
                      $scope.year_list.push(student.json.ADMITACADYEAR);
                    }
                   }
                });
              });
          });

          //console.log(p_dict);
          
          
          var p_list = [];
          angular.forEach(p_dict, function(value, key) {
            //console.log(value);
            
            var p_obj = {'name':key, 
              'id':value.p[0].json.PROGRAMID, 
              'list':value.p,
              'level_id':value.p[0].json.LEVELID,
              'student_active_list':[],
              'active':0,
              'total_student':0
            };
            if(!(value.p[0].json.LEVELID in $scope.level_list)) {
              $scope.level_list[value.p[0].json.LEVELID] = {
                'model':{},
                'active':0};
                LevelModel.get(Level, value.p[0].json.LEVELID, 
                  function(level) {
                    $scope.level_list[value.p[0].json.LEVELID].model = level;
                });
            }

            angular.forEach(value.p, function(program) {
              program['active']=0;
              program.active_students(RegDB, function(student_list) {
                $scope.retrieved_program++;
                angular.forEach(student_list, function(student) {
                  $scope.level_list[value.p[0].json.LEVELID].active++;
                  p_obj['student_active_list'].push(student);
                  program['active']++;
                });
                 
                p_obj.active += program['active'];
              });
              
            });
            
            p_list.push(p_obj);
            
          });
          ///console.log($scope.faculty_dict);
          $scope.program_list = p_list;
          //console.log(p_list);
          console.log($scope.level_list);
        }); 
      });
    
    });
  });
  
}

function ProgramListByFacultyStudentController($scope, Student, 
  Faculty, Program, $routeParams, Level, GradDB, RegDB){

  $scope.year_list = [];
  var faculty_id = $routeParams.id; 
  var faculty_model = new FacultyModel();
  faculty_model.get(Faculty, faculty_id, function(faculty){
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
         'year_list':{},
         'active':0,
         'total_student':0,
        };
        angular.forEach(value, function(program) {
          program['active']=0;
          program.students(Student, function(student_list) {
            p_obj['total_student']+=student_list.length; 

            angular.forEach(student_list,function(student) {
              //console.log(student);
              // Master
              //if(student.json.LEVELID == 23 || students.json.LEVELID == 24 || student.json.LEVELID == 25 )  {           
                 var admit_year = student.json.ADMITACADYEAR;
                 if(!(admit_year in p_obj['year_list'])) {
                     p_obj['year_list'][admit_year] = {
                        'active':0,'finish':0,'year':admit_year};
                 }
                 if ($scope.year_list.indexOf(admit_year) == -1 ) {
                   $scope.year_list.push(admit_year);
                 } 
                 if(student.active()) {
                     p_obj['year_list'][admit_year]['active']+=1
                     p_obj['active']+=1;
                 }
                 if(student.finish()) {
                     p_obj['year_list'][admit_year]['finish']+=1
                 }
               //}
               
            });
          });
        });
        p_list.push(p_obj);
      });
      $scope.program_list=p_list;
      //console.log($scope.program_list);
    });
  });
}


function TestController($scope, Student, 
  Faculty, Program, $routeParams, Level, GradDB, RegDB){
    console.log("test");
    $scope.year_list = [];
  FacultyModel.list_all(RegDB, function(res) {
    $scope.faculty_list = res;
    angular.forEach($scope.faculty_list,function(faculty) {
      //console.log(faculty);
      faculty.list_program(RegDB, function(program_list){
        var program_dict = {};
        $scope.faculty_dict = {};
        angular.forEach(program_list,function(program) {

          var p_name = program.json.PROGRAMNAME;

          if (!(p_name in program_dict)) {
             program_dict[p_name] = [];

          if(!(program.json.FACULTYID in $scope.faculty_dict)) {
            $scope.faculty_dict[program.json.FACULTYID] = 
              { 
                'name':program.json.FACULTYID,
                'program_list':[],
                'year_list':[]
              };                
           }
           $scope.faculty_dict[program.json.FACULTYID]['program_list'].push(program_dict[p_name]);                                          
           

          }
            program_dict[p_name].push(program); 
            $scope.total_program++;
        });

        console.log($scope.faculty_dict);
        var p_list = [];
        angular.forEach(program_dict,function(value, key){
          //console.log("---------");
          //console.log(value);
          var p_obj = {'name':key, 
            'id':value[0].json.PROGRAMID, 
            'list':value,
            'level_id':value[0].json.LEVELID,
            'year_list':{},
            'active':0,
            'total_student':0,
          };
          angular.forEach(value,function(program){
            console.log(program);
            program['active']=0;
            program.students(Student, function(student_list) {
              p_obj['total_student']+=student_list.length; 
              angular.forEach(student_list,function(student) {
                //console.log(student);  
                 var admit_year = student.json.ADMITACADYEAR;
                 if(!(admit_year in p_obj['year_list'])) {
                     p_obj['year_list'][admit_year] = {
                        'active':0,'finish':0,'year':admit_year};
                 }
                 if ($scope.year_list.indexOf(admit_year) == -1 ) {
                   $scope.year_list.push(admit_year);
                 } 
                 if(student.active()) {
                     p_obj['year_list'][admit_year]['active']+=1
                     p_obj['active']+=1;
                 }
                 if(student.finish()) {
                     p_obj['year_list'][admit_year]['finish']+=1
                 }

              });
            });
          });
          p_list.push(p_obj);
        });
        $scope.program_list=p_list;
        //console.log($scope.program_list);
        //console.log($scope.faculty_dict);
      });
    });
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

  faculty_model.get(Faculty, faculty_id, function(faculty){
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
     });
     $scope.program_list = p_list;
   });
  });
} 

function ProgramController($scope, $routeParams, Student, Program, GradDB,
  Staff,HrDB,Education){
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
              student.get_assign(GradDB, function(a_res){
                student.assign = a_res;
                if(student.assign.json) {
                  GradStaffModel.get(GradDB, student.assign.json.advisor_id,
                    function(gs) { 
                     //student.assign.advisor = gs;
                    //console.log(gs.json.nu_staff);
                    gs.nustaff_info(Staff, function(staffmodel){
                      staffmodel.display_name(HrDB, function(result){
                    //    console.log(result);
                        student.assign.advisor_name = result;
                      }); 
                    });
                    // nustaff.display_name(HrDB, function(name) {
                    //   student.assign.advisor_name = name;
                    // });
                  });
                }
                student.get_permit(GradDB, function(p_res){
                  student.permit = p_res;
                  student.get_exam(GradDB,function(e_res){
                    student.exam = e_res;
                    student.is_qeExam(GradDB,function(q_res){
                      student.qeExam = q_res;
                      student.is_engresult(GradDB,function(eng_res){
                        student.engresult = eng_res;
                        student.get_thesiscomplete(GradDB,function(t_res){
                          student.thesiscomplete = t_res;
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

