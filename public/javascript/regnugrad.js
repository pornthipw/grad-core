
app.config(function($routeProvider) {
  $routeProvider.when('/student/:id', {
    controller:StudentController, 
    templateUrl:'static/student_info.html'
  });
});


function StudentController($scope,$routeParams,Student) {  
  var reg_model = new StudentModel();
  reg_model.get(Student, parseInt($routeParams.id), function(student) {
   $scope.student = student.json;    
   console.log(student);
  });
}
