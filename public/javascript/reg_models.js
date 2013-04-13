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
