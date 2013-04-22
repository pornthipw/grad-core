
app.config(function($routeProvider) {
  $routeProvider.when('/reports/assign_history/:admityear', {
    controller:AssignHistoryController, 
    templateUrl:'static/reports/assign_history.html'
  });
});


function AssignHistoryController($scope,$routeParams,GradStaff,Staff,
   Education,AdvisorAssignment,Student) {
  
  var where_str = JSON.stringify({
    'str':'id = ?',
    'json':[136]
  });
  
  GradStaff.query(function(gstaff_list) {
 // GradStaff.query({where:where_str},function(gstaff_list) {
    $scope.staff_list = [];
    angular.forEach(gstaff_list, function(gstaff) {
      var g_model = new GradStaffModel();
      //console.log(gstaff);

      g_model.json = gstaff;
      g_model.finish_intime = 0;
      g_model.finish_total = 0;
      g_model.loading = true;
      if(g_model.json.nu_staff) {
        g_model.nustaff_info(Staff,function(staff) {
          g_model.nustaff = staff;
          staff.education_list(Education, function(e_list) {
            console.log(e_list);
          });
        });

        g_model.advisor_assign_list(AdvisorAssignment, function(assign_list) {
         
          g_model.assign_list = assign_list;
          if(assign_list.length>1) {
            $scope.staff_list.push(g_model);
            g_model.count = 0;
            angular.forEach(g_model.assign_list, function(assign) {
              assign.get_student(Student, function(student) {
                g_model.count++;
                if(student.json.ADMITACADYEAR > parseInt($routeParams.admityear)) {
                  if(student.finish()) {
                    if(student.in_time()) {
                      g_model.finish_intime++;
                    }
                    g_model.finish_total++;
                  } 
                }
                if(g_model.count == g_model.assign_list.length) {
                  g_model.loading = false;
                  g_model.percent = 0;
                  if(g_model.finish_total>0) {
                    g_model.percent = 
                      g_model.finish_intime*100/g_model.finish_total;
                  } 
                }
              });
            });
          }
        });
       //.});
      //});
      }
    });
  });
}
