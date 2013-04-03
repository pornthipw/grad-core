var app = angular.module('gs_core', [
  'db_service','$strap.directives']);

app.config(function($routeProvider) {
  $routeProvider.when('/', {
    controller:MainController, 
    templateUrl:'static/index.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/student/', {
    controller:StudentController, 
    templateUrl:'static/student_info.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/faculty/', {
    controller:FacultyController, 
    templateUrl:'static/faculty_info.html'
  });
});

function MainController($scope,Student,Staff,GradStaff) {  
  //$scope.level_list = Level.query();
}


function StudentController($scope,Student) {  
  $scope.search = function() {
    var query = {
      'select': JSON.stringify(['STUDENTCODE','STUDENTNAME', 'STUDENTSURNAME']),
      'where': JSON.stringify({
        'str':"STUDENTNAME LIKE '%"+$scope.search_text+"%' OR STUDENTSURNAME LIKE '%"+$scope.search_text+"%'",
        'json':[]
      })
    };
    Student.query(query, function(response) {
      console.log(response);
      $scope.student_list = response;
    });
  }
}

function FacultyController($scope,Student,Staff,GradStaff) {  
  
}
