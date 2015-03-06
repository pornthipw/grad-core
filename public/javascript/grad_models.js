function GradStaffModel() {
  var self = this;
  this.json = null;
  
  this.display_name = function() {
    var js = self.json;
    return js.first_name + ' ' + js.last_name;
  }

  this.get = function(GradStaff,id,callback) {
    var where_str = JSON.stringify({
     'str':'id = ?',
     'json':[id]
    });
    GradStaff.query({where:where_str},function(response) {
      if(response.length == 1) {
        self.json = response[0];
      }
     callback(self);
    });
  };

  this.get_test = function(GradDB,id,num,callback) {
    var where_str = JSON.stringify({
     'str':'id = ?',
     'json':[id]
    });
    GradDB.query({table:'hrnu_grad_gradstaff',where:where_str,num:num},
      function(response) {
      if(response.length == 1) {
        self.json = response[0];
      }
     callback(self);
    });
  };

  this.nustaff_info = function(HrDB,callback) {
    if(self.json) {
      StaffModel.get(HrDB, self.json.nu_staff, function(staff_model) {
        callback(staff_model);
      });
    } else {
      callback(null);
    }
  };

  this.nustaff_info_test = function(HrDB,num,callback) {
    if(self.json) {
      StaffModel.get_test(HrDB, self.json.nu_staff ,num, function(staff_model) {
        callback(staff_model);
      });
    } else {
      callback(null);
    }
  };

  this.advisorassign_list = function(GradDB,callback){
    AdvisorAssignmentModel.list_by_advisor(GradDB,self, function(res) {
      //console.log(res);
      callback(res);
    });
  };
  
    
  this.list_by_name = function(GradStaff,facultyModel,callback) {
    var where_str = JSON.stringify({
      'str':'faculty = ?',
      'json':[facultyModel.json.FACULTYNAME]
    });
    GradStaff.query({where:where_str},function(res) {
      var gradstaff_list = [];
      angular.forEach(res,function(gradstaff){
        var tmp = new GradStaffModel();
        tmp.json = gradstaff;
        gradstaff_list.push(tmp);
      });
      callback(gradstaff_list);
    });
  };
}


GradStaffModel.get = function(GradDB, id, callback) {
  var where_str = JSON.stringify({
   'str':'id = ?',
   'json':[id]
  });
  GradDB.query({table:'hrnu_grad_gradstaff',where:where_str},function(response) {
    var model = new GradStaffModel();
    if(response.length == 1) {
      model.json = response[0];
    }
    callback(model);
  });
};

function AdvisorAssignmentModel() {
 var self = this;
 this.json = null;
  
 this.get_student = function(Student,callback){
   if(self.json){
     var student = new StudentModel();   
     student.get(Student,self.json.student,function(student_model){
        callback(student_model); 
     });
   }
 }
}

AdvisorAssignmentModel.list_by_advisor = function(GradDB, 
  GradStaffModel, callback) {
  var where_str = JSON.stringify({
    'str':'advisor_id = ?',
    'json':[GradStaffModel.json.id]
  });

  GradDB.query({table:'regnu_grad_advisorassignment'
    ,where:where_str}, function(res) {
    var advisor_assign_list = [];  
    angular.forEach(res, function(result) {
      var tmp = new AdvisorAssignmentModel(); 
      tmp.json = result; 
      advisor_assign_list.push(tmp);
    });
    callback(advisor_assign_list);
  });
}



AdvisorAssignmentModel.get_by_student = function(GradDB, 
  studentModel, callback) {
  var where_str = JSON.stringify({
    'str':'student = ?',
    'json':[studentModel.json.STUDENTCODE]
  });

  GradDB.query({table:'regnu_grad_advisorassignment',where:where_str}, 
    function(res) {
    var model = new AdvisorAssignmentModel();
    if(res.length == 1) {
      model.json=res[0];
    }
    callback(model);
  });
};

AdvisorAssignmentModel.get_by_student_test = function(GradDB, 
  studentModel,num , callback) {
  var where_str = JSON.stringify({
    'str':'student = ?',
    'json':[studentModel.json.STUDENTCODE]
  });

  GradDB.query({table:'regnu_grad_advisorassignment',where:where_str,num:num}, 
    function(res) {
    var model = new AdvisorAssignmentModel();
    if(res.length == 1) {
      model.json=res[0];
    }
    callback(model);
  });
};

function PermitModel(){
  var self = this;
  this.json = null;
  this.get_by_student = function(GradDB, student_id, callback){
    var where_str = JSON.stringify({
      'str':'student = ?',
      'json':[student_id]
    });
    GradDB.query({table:'regnu_grad_permit',
      where:where_str},function(response) {
      if(response.length == 1) {
        self.json = response[0];
        if(self.json.permit_date) {
          self.json.permit_date = new Date(self.json.permit_date);
        }
      }
      callback(self);
    });
  }
}      

function ExamModel(){
  var self = this;
  this.json = null;
  this.get_by_student = function(GradDB, studentModel, callback){
    var where_str = JSON.stringify({
      'str':'student = ?',
      'json':[studentModel.json.STUDENTCODE]
    });
    GradDB.query({table:'regnu_grad_exam',where:where_str},function(response) {
      if(response.length == 1) {
        self.json = response[0];
      }
      callback(self);
    });
  }
}

function QExamModel(){
  var self = this;
  this.json = null;
  this.get = function(GradDB, studentModel, callback){
    var where_str = JSON.stringify({
      'str':'student = ?',
      'json':[studentModel.json.STUDENTCODE]
    });
    GradDB.query({table:'regnu_grad_qualifyingexam',where:where_str},function(response) {
      //console.log(response);
      if(response.length == 1) {
        self.json = response[0];
      }
      callback(self);
    });
  }
}

function QualifyingExamModel(){
  var self = this;
  this.json = null;
  this.get_by_groupqe = function(GradDB, groupqualifyingexam, callback){
    var where_str = JSON.stringify({
      'str':'id = ?',
      'json':[qroupqualifyingexam.json.qe_id]
    });
    GradDB.query({table:'regnu_grad_qualifyingexamination',where:where_str},function(response) {
      if(response.length == 1) {
        self.json = response[0];
      }
      callback(self);
    });
  }
}


function GroupQualifyingExamModel(){
  var self = this;
  this.json = null;
  this.get_by_student = function(GradDB, studentModel, callback){
    var where_str = JSON.stringify({
      'str':'student = ?',
      'json':[studentModel.json.STUDENTCODE]
    });
    GradDB.query({table:'regnu_grad_groupqualifyingexamination',where:where_str},function(response) {
      var qe_list = []; 
      angular.forEach(response,function(groupqualifyingexam){  
        var tmp = new GroupQualifyingExamModel(); 
        tmp.json = groupqualifyingexam;
        qe_list.push(tmp);
      });
      callback(qe_list);
    });
  }
}


function ThesisCompleteModel(){
  var self = this;
  this.json = null;
  this.get_by_student = function(GradDB, studentModel, callback){
    var where_str = JSON.stringify({
      'str':'student = ?',
      'json':[studentModel.json.STUDENTCODE]
    });
    GradDB.query({table:'regnu_grad_thesiscomplete',where:where_str},function(response) {
      if(response.length == 1) {
        self.json = response[0];
      }
      callback(self);
    });
  }
}

function PublicationModel(){
  var self = this;
  this.json = null;
  this.get_by_student = function(GradDB, studentModel, callback){
    var where_str = JSON.stringify({
      'str':'student = ?',
      'json':[studentModel.json.STUDENTCODE]
    });
    GradDB.query({table:'regnu_grad_publication',where:where_str},function(response) {
      if(response.length == 1) {
        self.json = response[0];
      }
      callback(self);
    });
  }
}

function EnglishResultModel(){
  var self = this;
  this.json = null;

  this.get_by_student = function(GradDB, studentModel, callback){
    var where_str = JSON.stringify({
      'str':'STUDENTCODE = ?',
      'json':[studentModel.json.STUDENTCODE]
    });

    GradDB.query({table:'regnu_grad_englishresult',where:where_str},function(response) {
      
      var englishresult_list = [];
      angular.forEach(response, function(englishresultModel){
        var tmp = new EnglishResultModel();
        tmp.json = englishresultModel;           
        englishresult_list.push(tmp);
      });
      callback(englishresult_list);
    });
  }
}


function BibtexModel() {
  var self = this;
  this.json = null;
  this.display = function() {
    var str = '';
    if(self.json) {
      str+=self.json.author;
      str+=',';
      str+=self.json.year;
      str+=',<b>';
      str+=self.json.title+'</b>';
    } 
    return str;
    
  };
}

BibtexModel.get_by_staff = function(GradDB, nu_staff_id, callback) {
  var where_str = JSON.stringify({
    'str':'nu_id = ?',
    'json':[nu_staff_id]
  });

  GradDB.query({
    table:'hrnu_grad_gradstaffpublication',
    where:where_str}, function(res) {
    var bibtex_list = [];
    angular.forEach(res, function(p_map) {
      BibtexModel.get(GradDB, p_map.bibtex_id, function(b_model) {
        bibtex_list.push(b_model);
        if(bibtex_list.length == res.length) {
          callback(bibtex_list);
        }
      });
    });
  });
};

BibtexModel.get = function(GradDB, id, callback) {
  var where_str = JSON.stringify({
    'str':'id = ?',
    'json':[id]
  });

  GradDB.query({table:'bibtex_entry',where:where_str}, 
    function(res) {
    var model = new BibtexModel();
    if(res.length == 1) {
      model.json=res[0];
    }
    callback(model);
  });
};

