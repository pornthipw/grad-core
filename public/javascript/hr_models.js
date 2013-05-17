function StaffModel() {
  var self = this;
  this.json = null;
  this.phd = null;
 
  this.display_name = function(HrDB,callback) {
    self.education_list(HrDB, function(education_list) {
      var str = self.json.POSITION;
      if(self.phd) {
        str+=' ดร.';
      }
      callback(str+' '+self.json.FNAME+' '+self.json.LNAME);
    });
  }
  
  this.name = function() {
    return self.json.FNAME+' '+self.json.LNAME;
  }

  this.education_list = function(HrDB,callback) {
    var e_model = new EducationModel();
    e_model.get_by_staff(HrDB,self,function(education_list) {
      angular.forEach(education_list, function(education) {
      //  console.log($.tis620.encode(education.json.COUNTRYNAME));
        if(education.json.BYTEDES == 'ปริญญาเอก') {
          self.phd=true;
        }
      });
      callback(education_list);
    });
  };

  this.list_by_faculty = function(HrDB, facultyModel, callback) {
    var where_str = JSON.stringify({
      'str':'FAC = ?',
      'json':[facultyModel.json.FACULTYNAME]
    });
    HrDB.query({table:'pundit',where:where_str}, function(res){
      var staff_list = [];
      angular.forEach(res, function(staff) {
        var tmp = new StaffModel();
        tmp.json=staff;
        staff_list.push(tmp);
      });
      callback(staff_list);
    });
  };
  
  this.faculty_list = function(HrDB, callback) { 
    var select_str = JSON.stringify(['FAC']);
    HrDB.query({select:select_str,table:'pundit'}, function(res) {
      var faculty_dict = {};
      var faculty_list = [];
      angular.forEach(res, function(obj) { 
        if(!(obj.FAC in faculty_dict)) {
          faculty_dict[obj.FAC] = {};
        }
      });
      angular.forEach(faculty_dict, function(value, key) { 
        faculty_list.push(key);
        console.log(key);
      });
      callback(faculty_list);
    });
  };

  this.list_by_name = function(HrDB,facultyModel,callback) {
    var where_str = JSON.stringify({
      'str':'FAC = ?',
      'json':[facultyModel.json.FACULTYNAME]
    });
    HrDB.query({table:'pundit',where:where_str}, function(res){
      var staff_list = [];
      angular.forEach(res,function(staff){
        var model = new StaffModel();
        model.json = staff;
        staff_list.push(model);
      });
      callback(staff_list);
    });
  };

}

StaffModel.get = function(HrDB, id, callback) {
  var where_str = JSON.stringify({
    'str':'STAFFID = ?',
    'json':[id]
  });
  HrDB.query({table:'pundit',where:where_str}, function(res) {
    var model = new StaffModel();
    if(res.length==1) {
      model.json=res[0];
    }
    callback(model);
  });
};



function EducationModel() {
  var self = this;
  this.json = null;

  this.get_by_staff = function(HrDB, staff, callback) {
    var where_str = JSON.stringify({
      'str':'STAFFID = ?',
      'json':[staff.json.STAFFID]
    });

    HrDB.query({table:'educationhis',where:where_str}, function(res){    
     var education_list = []; 
     angular.forEach(res, function(education) {
       var tmp = new EducationModel(); 
       tmp.json = education; 
       education_list.push(tmp);
     });
     callback(education_list);
    });
  };
}


EducationModel.get = function(HrDB, staffmodel, callback) {
  var where_str = JSON.stringify({
    'str':'STAFFID = ?',
    'json':[staffmodel.json.STAFFID]
  });

  HrDB.query({table:'educationhis'
    ,where:where_str}, function(res) {
    var education_list = [];  
    angular.forEach(res, function(result) {
      var tmp = new EducationModel(); 
      tmp.json = result; 
      education_list.push(tmp);
    });
    callback(education_list);
  });
}

