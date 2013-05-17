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
  
  this.get_assign = function(GradDB, callback) {
    AdvisorAssignmentModel.get_by_student(GradDB, self, function(model) {
      callback(model);
    });
  };

  this.is_assign = function(GradDB, callback) {
    AdvisorAssignmentModel.get_by_student(GradDB, self, function(model) {
      if(model.json) {
        callback(true);
      } else {
        callback(false);
      }
    });
  };

  this.grad_status = function(GradDB, callback) {
    var status_model = {};
    self.get_assign(GradDB, function(a) {
      status_model['assign'] = a;
      self.get_permit(GradDB, function(p) {
        status_model['permit'] = p;
        self.get_exam(GradDB, function(exam) {
          status_model['exam'] = exam;
          self.get_thesiscomplete(GradDB, function(t) {
            status_model['thesiscomplete'] = t;
            self.is_qeExam(GradDB,function(qe) {
              status_model['qe'] = qe;
              self.is_engresult(GradDB,function(eng) {
                status_model['english'] = eng;
                callback(status_model);
              });
            });
          });
        });
      });
    });
    
  };

  this.get_permit = function(GradDB,callback) {
    var permit = new PermitModel();
    permit.get_by_student(GradDB, self.json.STUDENTCODE, function(res) {
      //console.log(res);
      callback(res);
    });
  };
  
  this.is_permit = function(GradDB,callback) {
    var permit = new PermitModel();
    permit.get_by_student(GradDB, self.json.STUDENTCODE, function(res) {
      if(res.json) {
        callback(true);
      } else {
        callback(false);
      }
    });
  };
  
  this.get_exam = function(GradDB,callback) {
    var exam = new ExamModel();
    exam.get_by_student(GradDB, self, function(res) {
      callback(res);
    });
  };

  this.is_exam = function(GradDB,callback) {
    var exam = new ExamModel();
    exam.get_by_student(GradDB, self, function(res) {
      if(res.json) {
        callback(true);
      } else {
        callback(false);
      }
    });
  };

  this.get_thesiscomplete = function(GradDB,callback) {
    var thesiscomplete = new ThesisCompleteModel();
    thesiscomplete.get_by_student(GradDB, self, function(res) {
      callback(res);
    });
  };

  this.is_thesiscomplete = function(GradDB,callback) {
    var thesiscomplete = new ThesisCompleteModel();
    thesiscomplete.get_by_student(GradDB, self, function(res) {
      if(res.json) {
        callback(true);
      } else {
        callback(false);
      }
    });
  };

  this.is_qeExam = function(GradDB,callback) {
    var qeExam = new GroupQualifyingExamModel();
    qeExam.get_by_student(GradDB, self, function(res) {
      var pass=false;
      angular.forEach(res, function(qeModel) {
        if(qeModel.json.result) {
          pass=true;
        }
      });
      //console.log(pass);
      callback(pass);
    });
  };

  this.is_engresult = function(GradDB,callback) {
    var engresult = new EnglishResultModel();
    engresult.get_by_student(GradDB, self, function(res) {
      var pass=false;
      angular.forEach(res, function(engresultModel) {
        if(engresultModel.json.pass_test) {
          pass=true;
        }
      });
      //console.log(pass);
      callback(pass);
    });
  };


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

StudentModel.active_students = function(RegDB, callback) {
  var select_str = JSON.stringify(['STUDENTCODE']);
  var where_str = JSON.stringify({
    'str':'STUDENTSTATUS = ? or STUDENTSTATUS = ?',
    'json':[10,11]
  });
  RegDB.query({
    'select':select_str, 
    'table':'studentinfo',
    'where':where_str}, function(res) {
    callback(res);
  });
};

StudentModel.get_student = function(RegDB,id,callback) {
  var where_str = JSON.stringify({
    'str':'STUDENTCODE = ?',
    'json':[id]
  });
  RegDB.query({
    'table':'studentinfo',
    'where':where_str}, function(res) {
    var tmp = new StudentModel();
    if(res.length==1){      
      tmp.json = res[0];
    }
    callback(tmp);
  });
}; 


function EnglishTestModel(){
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
 
  this.list_program = function(RegDB, callback){
    ProgramModel.list_by_faculty(RegDB,self.json.FACULTYID,function(program_list){
     callback(program_list);
    });
  } 

  this.list_gradstaff = function(GradStaff, callback){
    var gradstaff_model = new GradStaffModel();
    gradstaff_model.list_by_name(GradStaff,self,function(gradstaff_list){
     callback(gradstaff_list);
    });
  } 

  this.list_staff = function(HrDB, callback){
    var staff_model = new StaffModel();
    staff_model.list_by_name(HrDB,self,function(staff_list){
     //console.log(staff_list);
     callback(staff_list);
     
    });
  } 
}

FacultyModel.get= function(RegDB, id, callback) {
  var where_json = {'str':'FACULTYID = ?','json':[id]};
  var where_str = JSON.stringify(where_json);
  var timest = ''+(new Date()).getTime();
  var sign = Core_HMAC.generate({'query':{'where':where_str,'timestamp':timest},
    'path':'/reg/faculty'});
  RegDB.query({'table':'faculty',where:where_str,
    '_sign':sign,
    'timestamp':timest,
    '_apiKey':Core_HMAC.apiKey}, function(res){
    var model = new FacultyModel();
    if (res.length == 1) {
     model.json = res[0]; 
    }
    callback(model);
  }); 
}

FacultyModel.list_all = function(RegDB, callback) {
  RegDB.query({'table':'faculty'}, function(res) {
    var list = [];
    angular.forEach(res, function(faculty) {
      var model = new FacultyModel();
      model.json = faculty;
      list.push(model);
    });
    callback(list);
  });
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
  };
  
  this.list_by_faculty = function(Program, faculty, callback){
    var where_str = JSON.stringify({
      'str':'FACULTYID = ?',
      'json':[faculty.json.FACULTYID]
    });
    Program.query({where:where_str},function(res){
      var program_list = [];
      //console.log(res);
      angular.forEach(res,function(program){
        var tmp = new ProgramModel();
        tmp.json = program;
        program_list.push(tmp);      
      });
      callback(program_list);
    });
  };
  
  this.active_students = function(RegDB, callback) {
    var where_str = JSON.stringify({
      'str':'PROGRAMID = ? and (STUDENTSTATUS = 10 or STUDENTSTATUS = 11)',
      'json':[self.json.PROGRAMID]
    });
    RegDB.query({'table':'studentinfo','where':where_str}, function(res) {
      var list = [];
      angular.forEach(res, function(obj) {
        var model = new StudentModel();
        model.json = obj;
        list.push(model);
      });
      callback(list);
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
};

ProgramModel.get_program = function(RegDB, id, callback) {
  var where_str = JSON.stringify({
    'str':'PROGRAMID = ?',
    'json':[id]
  });
  RegDB.query({table:'program_new',where:where_str}, function(res){
    var model = new ProgramModel();
    if (res.length == 1) {
      model.json = res[0];
    }
    callback(model);
  });
};


ProgramModel.list_by_faculty = function(RegDB, faculty_id, callback) {
  var where_str = JSON.stringify({
    'str':'FACULTYID = ?',
    'json':[faculty_id]
  });
  RegDB.query({table:'program_new',where:where_str}, function(res){
    var list = [];
    angular.forEach(res, function(obj) {
      var model = new ProgramModel();
      model.json = obj;
      list.push(model);
    });
    callback(list);
  });
};

var LevelModel = function() {
  var self = this;
  this.json = null;
  this.is_master = function() {
    return self.json.LEVELID == 23 ||
      self.json.LEVELID == 26 || 
      self.json.LEVELID == 21 ; 
  };
};

LevelModel.list_all = function(RegDB, callback) {
  RegDB.query({'table':'levelid'}, function(res) {
    var level_list = [];
    angular.forEach(res, function(level) {
      var model = new LevelModel();
      model.json = level;
      level_list.push(model);
    });
    callback(level_list);
  });
};

LevelModel.get = function(Level, id, callback) {
    var where_str = JSON.stringify({
      'str':'LEVELID = ?',
      'json':[id]
    });
    Level.query({where:where_str}, function(res){
      var model = new LevelModel();
      if(res.length == 1) {
        model.json = res[0];
      }
      callback(model);
    });
  };
