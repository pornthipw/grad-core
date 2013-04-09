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
        if(education.json.BYTEDES == 'ปริญญาเอก') {
          self.phd=true;
        }
      });
      callback(education_list);
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
