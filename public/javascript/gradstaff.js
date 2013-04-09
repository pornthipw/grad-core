
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


function GradStaffController($scope, $routeParams, 
  GradStaff, Staff, Education, AdvisorAssignment, Student) {
  var g_model = new GradStaffModel();
  $scope.grad_staff = g_model;
  g_model.get(GradStaff, parseInt($routeParams.id), function(grad_staff) {
    $scope.grad_staff = grad_staff.json;
    console.log(grad_staff);
    g_model.nustaff_info(Staff,function(staff) {
      $scope.staff = staff;
      staff.education_list(Education, function(e_list) {
        $scope.staff.education_list = e_list;
      });


    g_model.advisor_assign_list(AdvisorAssignment,function(list) {
      $scope.staff.finish_assign_list = [];
      $scope.finish_intime = 0;
      $scope.staff.active_assign_list = [];
      angular.forEach(list, function(assign) {
        assign.get_student(Student, function(student) {
          if(student.finish()) {
            if(student.in_time()) {
              $scope.finish_intime++;
            }
            $scope.staff.finish_assign_list.push(student);
          } else {
            $scope.staff.active_assign_list.push(student);
          }
        });
      });
    });

      console.log(staff);
    });
  });
}

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
