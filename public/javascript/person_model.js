
function GradPersonModel() {
  var self = this;
  this.json = null;
  this.display = function() {
    var str = '';
    if(self.json) {
      str+=self.json.first_name;
      str+=' ';
      str+=self.json.last_name;
    } 
    return str;
    
  };
}

GradPersonModel.get = function(GradDB, id, callback) {
  var where_str = JSON.stringify({
   'str':'id = ?',
   'json':[id]
  });
  GradDB.query({table:'officers_person',where:where_str},function(response) {
    var model = new GradPersonModel();
    if(response.length == 1) {
      model.json = response[0];
    }
    callback(model);
  });
};

