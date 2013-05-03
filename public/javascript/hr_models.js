function StaffModel() {
  var self = this;
  this.json = null;
  this.phd = null;
  
  this.name = function() {
    return self.json.FNAME+' '+self.json.LNAME;
  }

  this.get = function(Staff, id, callback) {
    var select_str = JSON.stringify([
      'STAFFID',
      'PREFIXNAME',
      'FNAME',
      'LNAME',
      'POSITION',
      'FAC'
    ]);
    var where_str = JSON.stringify({
      'str':'STAFFID = ?',
      'json':[id]
    });
    Staff.query({where:where_str}, function(res) {
      if(res.length==1) {
        self.json=res[0];
      }
      callback(self);
    });
  };

  this.education_list = function(Education,callback) {
    var e_model = new EducationModel();
    e_model.get_by_staff(Education,self,function(education_list) {
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
}


function EducationModel() {
  var self = this;
  this.json = null;

  this.get_by_staff = function(Education, staff, callback) {
    var select_str = JSON.stringify([
      'STAFFID',
      'BYTEDES',
      'DEGREENAMEABB',
      'DEGREENAME',
      'MAJORNAME',
      'UNIVERSITYNAME',
      'COUNTRYNAME'
    ]);
    var where_str = JSON.stringify({
      'str':'STAFFID = ?',
      'json':[staff.json.STAFFID]
    });

    Education.query({select:select_str,where:where_str}, function(res){    
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
