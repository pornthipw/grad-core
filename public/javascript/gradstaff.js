
app.config(function($routeProvider) {
  $routeProvider.when('/gradstaff/', {
    controller:GradStaffSearchController,
    templateUrl:'static/gradstaff/search.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/gradstaff/:id', {
    controller:GradStaffController,
    templateUrl:'static/gradstaff/detail.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/staff/:id', {
    controller:StaffController,
    templateUrl:'static/gradstaff/nu_detail.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/faculty/:facid/gradstaff', {
    controller:GradStaffByFacultyController,
    templateUrl:'static/faculty/gradstaff_list.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/faculty/:facid/nustaff', {
    controller:NuStaffByFacultyController,
    templateUrl:'static/faculty/nustaff_list.html'
  });
});

function NuStaffByFacultyController($scope, $routeParams, Faculty, 
  GradStaff, HrDB,Staff, GradDB, HrDB){
  var staff_model = new StaffModel();
  var unit_list = {'อาจารย์ภายนอก':{'staff':[]}};
  $scope.unit_list = unit_list;
  var faculty_model = new FacultyModel();
  faculty_model.get(Faculty, $routeParams.facid, function(faculty){
    $scope.faculty = faculty;
    
    faculty_model.list_staff(HrDB, function(staff_list) {
      faculty_model.list_gradstaff(GradStaff, function(gradstaff_list) {
        $scope.gradstaff_list = gradstaff_list;
        $scope.staff_list = staff_list;
        //console.log(staff_list);
	angular.forEach(staff_list, function(m_staff) {
         //console.log(m_staff.json.STAFFID); 
            if(!(m_staff.json.UNIT in unit_list)){
              unit_list[m_staff.json.UNIT] = {
               'name':m_staff.json.UNIT,
               'staff':[]
              };
            }
            for(var idx=0;idx<gradstaff_list.length;idx++) {
              var g_staff = gradstaff_list[idx];
              if(m_staff.json.STAFFID == g_staff.json.nu_staff) {
                m_staff.grad_staff = true;
                m_staff.grad_id = g_staff.json.id;
                //console.log(g_staff);
                break;
              }
            }
            unit_list[m_staff.json.UNIT]['staff'].push(m_staff);
         // } else {
         //   unit_list['อาจารย์ภายนอก']['staff'].push(m_staff);
         // }
        });
      });
    });
  });
}

function GradStaffByFacultyController($scope, $routeParams, Faculty, 
  GradStaff, HrDB,Staff, GradDB, HrDB){
  var staff_model = new StaffModel();
  var unit_list = {'อาจารย์ภายนอก':{'staff':[]}};
  $scope.unit_list = unit_list;
  var faculty_model = new FacultyModel();
  faculty_model.get(Faculty, $routeParams.facid, function(faculty){
    $scope.faculty = faculty;
    faculty_model.list_gradstaff(GradStaff, function(gradstaff_list) {
      $scope.gradstaff_list = gradstaff_list;
      angular.forEach(gradstaff_list, function(gradstaff) {
        gradstaff.nustaff_info(Staff, function(staff_model) {
          gradstaff.nustaff = staff_model
          if(staff_model.json) {
            if(!(staff_model.json.UNIT in unit_list)) {
              unit_list[staff_model.json.UNIT] = {
               'name':staff_model.json.UNIT,
               'staff':[]
              };
            }
            unit_list[staff_model.json.UNIT]['staff'].push(gradstaff);
          } else {
            unit_list['อาจารย์ภายนอก']['staff'].push(gradstaff);
          }
        });
      });
    });

  });
  
  $scope.select_unit = function(unit){
    $scope.selected_unit = unit;
    angular.forEach(unit.staff, function(gradStaff) {
      gradStaff.advisorassign_list(GradDB, function(res) {
         gradStaff.advisorassign_list = res;
         angular.forEach(res, function(assign){
          //var student_model = new StudentModel();
         });  
      });
    });
  };
}

function StaffController($scope, $routeParams,Student, HrDB, GradDB) {
  StaffModel.get(HrDB, parseInt($routeParams.id), function(staff_model) {
      $scope.staff = staff_model;
      staff.education_list(HrDB, function(e_list) {
        $scope.staff.education_list = e_list;
      });
  });
}


function GradStaffController($scope, $routeParams,Student, HrDB, GradDB) {
  GradStaffModel.get(GradDB, parseInt($routeParams.id), function(grad_model) {
    $scope.grad_staff = grad_model;
    grad_model.nustaff_info(HrDB,function(staff) {
      $scope.staff = staff;
      staff.education_list(HrDB, function(e_list) {
        $scope.staff.education_list = e_list;
      });


    grad_model.advisorassign_list(GradDB,function(list) {
      $scope.staff.finish_assign_list = [];
      $scope.finish_intime = 0;
      $scope.staff.active_assign_list = [];
      angular.forEach(list, function(assign) {
        assign.get_student(Student, function(student) {
          //console.log(student);
          if(student.finish()) {
            if(student.in_time()) {
              $scope.finish_intime++;
            }
            $scope.staff.finish_assign_list.push(student);
          } else {
            student.grad_status(GradDB, function(g_status) {
              //console.log(g_status);
              student.grad_status = g_status;
            });

            $scope.staff.active_assign_list.push(student);
          }
        });
      });
    });

      //console.log(staff);
    });
  });
}
/*
              student.get_assign(GradDB, function(a_res){
                student.assign = a_res;
                if(student.assign.json) {
                  GradStaffModel.get(GradDB, student.assign.json.advisor_id,
                    function(gs) { 
                    gs.nustaff_info(Staff, function(staffmodel){
                      staffmodel.display_name(HrDB, function(result){
                        student.assign.advisor_name = result;
                      }); 
                    });
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
*/
function GradStaffSearchController($scope, GradStaff, Staff) {
  $scope.search = function(text) {
    var where_str = JSON.stringify({
      'str':"FNAME LIKE '%"+text+"%' OR "+
        "LNAME LIKE '%"+text+"%'",
      'json':[]
    });
    Staff.query({where:where_str},function(staff_list){
      where_str = JSON.stringify({
        'str':"first_name LIKE '%"+text+"%' OR "+
          "last_name LIKE '%"+text+"%'",
        'json':[]
      });
      GradStaff.query({where:where_str},function(gradstaff_list){
        $scope.gradstaff_list = [];
        $scope.staff_list = staff_list;
        angular.forEach(gradstaff_list, function(g_staff) {
          if(!g_staff.nu_staff) {
            $scope.staff_list.push(g_staff);
          } else {
            for(var idx=0;idx<staff_list.length;idx++) {
              var staff = staff_list[idx];
              if(g_staff.nu_staff == staff.STAFFID) {
                staff.grad_staff = true;
                staff.grad_id = g_staff.id;
                break;
              }
            }
          }
        });
      });
    });
  }
}

