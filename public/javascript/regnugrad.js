
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
  $routeProvider.when('/program/:id', {
    controller:ProgramController,
    templateUrl:'static/program/info.html'
  });
});

function StudentController($scope,$routeParams,Student,
  Permit,EnglishTest, GroupQualifyingExam) {  
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

function FacultyController($scope, $routeParams, Faculty, SharedService){
  var faculty_model = new FacultyModel();
  faculty_model.get(Faculty, $routeParams.id, function(faculty){
    $scope.faculty = faculty;
  });


  $scope.list_program = function() {
    SharedService.prepForBroadcast($routeParams.id);
  };
  
}

function ProgramListByFacultyCtrl($scope, Student, 
  Faculty, Program, SharedService){
  $scope.show = false;
  $scope.$on('handleBroadcast', function() {
    var faculty_id = SharedService.message; 
    var faculty_model = new FacultyModel();
    faculty_model.get(Faculty, faculty_id, function(faculty){
      $scope.show=true;
      $scope.program_retrieved = 0;
      $scope.total_program = 0;
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
            'active':0
          };
          angular.forEach(value, function(program) {
            program['active']=0;
            program.students(Student, function(student_list) {
              $scope.program_retrieved++;
              angular.forEach(student_list, function(student) {
                if(student.active()) {
                  program['active']++;
                }
              });
              p_obj.active += program['active'];
            });
          });
          p_list.push(p_obj);
        });
        $scope.program_list = p_list;
      });
    });
  });
} 

function ProgramController($scope, $routeParams, Student, Program){
  var program_model = new ProgramModel();
  program_model.get(Program,$routeParams.id,function(program_obj) {
    $scope.program = program_obj;
    program_obj.list_by_name(Program, function(program_list) {
      var student_active = [];
      var student_finish = [];
      angular.forEach(program_list, function(program) {
        program.students(Student, function(student_list) {
          console.log(student_list);
          angular.forEach(student_list, function(student){
            if(student.active()){
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

