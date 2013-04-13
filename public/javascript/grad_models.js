function GradStaffModel() {
  var self = this;
  this.json = null;
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

  this.nustaff_info = function(Staff,callback) {
    if(self.json) {
      var staff = new StaffModel();
      staff.get(Staff, self.json.nu_staff, function(staff_model) {
        callback(staff_model);
      });
    } else {
      callback(null);
    }
  };

  this.advisor_assign_list = function(AdvisorAssignment,callback){
    var advisor = new AdvisorAssignmentModel();
    advisor.list_by_advisor(AdvisorAssignment,self, function(res){
      callback(res);
    });
  };
  
}

function AdvisorAssignmentModel() {
  var self = this;
  this.json = null;

  this.list_by_advisor = function(AdvisorAssignment, GradStaffModel, callback) {
    var where_str = JSON.stringify({
      'str':'advisor_id = ?',
      'json':[GradStaffModel.json.id]
    });

    AdvisorAssignment.query({where:where_str}, function(res) {
      var advisor_assign_list = [];  
      angular.forEach(res, function(result) {
        var tmp = new AdvisorAssignmentModel(); 
        tmp.json = result; 
        advisor_assign_list.push(tmp);
    });
    callback(advisor_assign_list);
  });
 }

 this.get_student = function(Student,callback){
   if(self.json){
     var student = new StudentModel();   
     student.get(Student,self.json.student,function(student_model){
        callback(student_model); 
     });
   }
 }

}

function PermitModel(){
  var self = this;
  this.json = null;
  this.get_permit_by_student = function(Permit, id, callback){
    var where_str = JSON.stringify({
      'str':'student = ?',
      'json':[id]
    });
    Permit.query({where:where_str},function(response) {
      if(response.length == 1) {
        self.json = response[0];
      }
      callback(self);
    });
  }
}      
