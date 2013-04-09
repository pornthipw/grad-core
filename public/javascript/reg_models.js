function StudentModel() {
  var self = this;
  this.json = null;
  
  var master_level = [26,23];
  var phd_level = [33];
  
  this.finish = function() {
    if(self.json.STUDENTSTATUS == 40) {
      return true;
    }
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
      //console.log(res);
      if(res.length==1){      
        self.json = res[0];
      }
      callback(self);
    });
  };
}


