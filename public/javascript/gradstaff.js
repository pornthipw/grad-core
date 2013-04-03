
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

function GradStaffController($scope, $routeParams, GradStaff, Staff) {
  var where_str = JSON.stringify({
    'str':'id = ?',
    'json':[parseInt($routeParams.id)]
  });

  GradStaff.query({where:where_str},function(response) {
    if(response.length == 1) {
      $scope.grad_staff = response[0];
      var where_str = JSON.stringify({
       'str':'STAFFID = ?',
       'json':[$scope.grad_staff.nu_staff]
      });
      Staff.query({where:where_str}, function(staff) {
        console.log(staff);
      });
    }
  });
}

function GradStaffSearchController($scope, GradStaff, Staff) {
  Staff.query(function(staff_list){
    GradStaff.query(function(gradstaff_list){
      $scope.gradstaff_list = [];
      $scope.staff_list = staff_list;
      angular.forEach(gradstaff_list, function(g_staff) {
        if(!g_staff.nu_staff) {
          $scope.staff_list.push(g_staff);
        } else {
          angular.forEach(staff_list,function(staff) {
            if(g_staff.nu_staff == staff.STAFFID) {
              staff.grad_staff = true;
              staff.grad_id = g_staff.id;
            }
          });
        }
      });
    });
  });
}
