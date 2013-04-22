function StudentModel() {
  var self = this;
  this.json = null;
  
  var master_level = [26,23];
  var phd_level = [33];

  this.active = function() {
    return self.json.STUDENTSTATUS == 10 || self.json.STUDENTSTATUS == 11;
  };
  
  this.finish = function() {
    return self.json.STUDENTSTATUS == 40;
  }
  
  this.in_time = function() {
    var student = self.json;
    var spend_time = parseInt(student.ENDACADYEAR) - student.ADMITACADYEAR;
    if(student.STUDENTSTATUS == 40) {
      if(master_level.indexOf(student.LEVELID)!=-1) { 
        if(spend_time < 3) {
          return true;
        }
      } else {
        if(phd_level.indexOf(student.LEVELID)!=-1) { 
          if(spend_time < 4) {
            return true;
          }
        }
      }
    }
  };
  
  this.get = function(Student,id,callback) {
    var where_str = JSON.stringify({
      'str':'STUDENTCODE = ?',
      'json':[id]
    });
    Student.query({where:where_str}, function(res) {
      if(res.length==1){      
        self.json = res[0];
      }
      callback(self);
    });
  }; 
  
  this.get_englishtest = function(EnglishTest,callback){ 
    var e_model = new EnglishResultModel() ; 
    e_model.get_by_student(EnglishTest,self,function(english_list) {
      console.log(english_list);
      angular.forEach(english_list, function(english) {
        //if(english.json.  == ' ') {
        //  self. =true;
       // }
      });
     callback(english_list); 
     //console.log(res);
    });  
  }; 
  
  this.list_by_program = function(Student, program, callback){
    //console.log(program);
    var where_str = JSON.stringify({
      'str':'PROGRAMID = ?',
      'json':[program.json.PROGRAMID]
    });
    Student.query({where:where_str}, function(res) {
      //console.log(res);
      callback(res);
    });

  }
}


function EnglishResultModel(){
  var self = this;
  this.json = null;

  this.get_by_student= function(EnglishTest,student, callback) {
    console.log(student);
    var where_str = JSON.stringify({
      'str':'STUDENTCODE = ?',
      'json':[student.json.STUDENTCODE]
    });

    EnglishTest.query({where:where_str}, function(res){    
      var english_list = []; 
      angular.forEach(res, function(english) {
        var tmp = new EnglishResultModel(); 
        tmp.json = english; 
        english_list.push(tmp);
      });
      callback(english_list);
    });
  }
}

function FacultyModel(){
  var self = this;
  this.json = null;
  
  this.get= function(Faculty, id, callback) {
    var where_str = JSON.stringify({
      'str':'FACULTYID = ?',
      'json':[id]
    });
    Faculty.query({where:where_str}, function(res){
      if (res.length == 1) {
       self.json = res[0]; 
      }
      callback(self);
    }); 
  }
  
  this.list = function(Faculty, callback){
    Faculty.query(function(res) {
      callback(res);
    });
  }  
 
  this.list_program = function(Program, callback){
    var program_model = new ProgramModel();
    program_model.list_by_faculty(Program,self,function(program_list){
     callback(program_list);
    });
  } 
}

function ProgramModel(){
  var self = this;
  this.json = null;

  this.get = function(Program, id, callback) {
    var where_str = JSON.stringify({
      'str':'PROGRAMID = ?',
      'json':[id]
    });
    Program.query({where:where_str}, function(res){
      if (res.length == 1) {
        self.json = res[0];
      }
      callback(self);
    });
  }
  
  this.list_by_faculty = function(Program, faculty, callback){
    var where_str = JSON.stringify({
      'str':'FACULTYID = ?',
      'json':[faculty.json.FACULTYID]
    });
    Program.query({where:where_str},function(res){
      var program_list = [];
      console.log(res);
      angular.forEach(res,function(program){
        var tmp = new ProgramModel();
        tmp.json = program;
        program_list.push(tmp);      
      });
      callback(program_list);
    });
  };

  this.students = function(Student, callback) {
    var s_model = new StudentModel();
    s_model.list_by_program(Student, self, function(res) {
      var student_list = [];
      angular.forEach(res,function(student){
        var tmp = new StudentModel();
        tmp.json = student;
        student_list.push(tmp);      
      });
      callback(student_list);
    });
  };
  
  this.list_by_name = function(Program, callback) {
    var where_str = JSON.stringify({
      'str':'PROGRAMNAME = ?',
      'json':[self.json.PROGRAMNAME]
    });
    Program.query({where:where_str},function(res) {
      var program_list = [];
      angular.forEach(res,function(program){
        var tmp = new ProgramModel();
        tmp.json = program;
        program_list.push(tmp);      
      });
      callback(program_list);
    });
 
  };
}

