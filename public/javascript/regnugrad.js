
app.config(function($routeProvider) {
  $routeProvider.when('/student/:id', {
    controller:StudentController, 
    templateUrl:'static/student_info.html'
  });
});


function StudentController($scope,$routeParams,Student,
  Permit,EnglishTest) {  
    var reg_model = new StudentModel();
    reg_model.get(Student, parseInt($routeParams.id), 
      function(student) {
        $scope.student = student.json;    
        var p_model = new PermitModel();
        p_model.get_permit_by_student(Permit, $routeParams.id,
          function(res){
            $scope.student.permit = res;
        });
        student.get_englishtest(EnglishTest,function(res){
          console.log(res); 
        }); 
     

    });
};
