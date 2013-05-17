//
app.filter('skip', function() {
  return function(input, start) {
    start=+start;
    if(input) {
      return input.slice(parseInt(start));
    }
  }
});

app.filter('hide', function() {
  return function(input, key) {
    if(input) {
      var result = [];
      angular.forEach(input, function(v) {
        if(!v.hide) {
          result.push(v);
        }
      });
      return result;
    }
  }
});

app.config(function($routeProvider) {
  $routeProvider.when('/bibtex', {
    controller:BibTexController, 
    templateUrl:'static/bibtex/index.html'
  });
});


function BibTexController($scope,GradDB,RegDB, BibTex, HMAC) {
  $scope.entrytype_list = [
    {'name':'article', 'display':'วารสาร'},
    {'name':'proceedings','display':'นำเสนอที่ประชุมวิชาการ'},
    {'name':'book','display':'หนังสือ/ตำรา'}
  ]; 

  $scope.limit = 10;
  GradDB.query({'table':'bibtex_entry'}, function(entry_list) {
    $scope.entry_list = entry_list;
    $scope.totalPage = Math.ceil(entry_list.length/$scope.limit);
  });

  $scope.selected = function(selected){
    $scope.form = null;
    if($scope.entry) {
      $scope.entry.selected=false;
    }
    selected.selected = true;
    $scope.entry = selected;
    $scope.entry.student_map = [];
    var where_str = JSON.stringify({
     'str':'bibtex_id = ?',
     'json':[selected.id]
    });
    GradDB.query({'table':'regnu_grad_studentpublication', 
     'where':where_str}, function(student_list) {
      angular.forEach(student_list, function(student_entry) {
        StudentModel.get_student(RegDB, student_entry.student, 
          function(s_model) {
          $scope.entry.student_map.push(s_model);
        });
      });
    });
  }  

  entry_fields_default =  {
    'author':JSON.stringify({'display':{'th':'ผู้แต่ง','en':'Author'}}),
    'title':JSON.stringify({'display':{'th':'ชื่อบทความ','en':'Title'}}),
    'journal':JSON.stringify({'display':{'th':'ชื่อวารสาร','en':'Journal'}}),
    'pages':JSON.stringify({'display':{'th':'เลขหน้าที่ตีพิมพ์','en':'Pages'}}),
    'year':JSON.stringify({'display':{'th':'ปีที่เผยแพร่','en':'Year'}}),
    'number':JSON.stringify({'display':{'th':'เลขประจำฉบัับ','en':'Number'}}),
    'organization':JSON.stringify({'display':{'th':'หน่วยงานจัดประชุม','en':'Organization'}}),
    'dateconference':JSON.stringify({'display':{'th':'วันที่นำเสนอ (จัดประชุม)','en':'dateconference'}}),
    'booktitle':JSON.stringify({'display':{'th':'ชื่อนำเสนอที่ประชุมวิชาการ','en':'Booktitle'}}),
    'note':JSON.stringify({'display':{'th':'หมายเหตุ','en':'Note'}}),
    'keyword':JSON.stringify({'display':{'th':'คำค้น คำสำคัญ','en':'KeyWord'}}),
    'month':JSON.stringify({'display':{'th':'เดือนที่เผยแพร่','en':'Month'}}),
    'publisher':JSON.stringify({'display':{'th':'หน่วยงานเจ้าของวารสาร','en':'Publisher'}}),
  };

  $scope.entry_fields = {};

  $scope.edit = function(entry) {
    var ignore_list = ['id','entry_type',
      'student_map','selected'
    ];

    angular.forEach(entry_fields_default, function(value,key) {
      $scope.entry_fields[key] = JSON.parse(value);
    });

    angular.forEach(entry, function(value,key) {
      if(!(key in $scope.entry_fields)) {
        $scope.entry_fields[key] = {'display':key};
      }
      if(value) {
        if(ignore_list.indexOf(key) == -1) {
          $scope.entry_fields[key].selected = true;
        }
      }
    });
    $scope.form = entry;
  };

  $scope.add = function() {
    var fields = JSON.stringify(['author','jounal','year',
      'month','volume','number','entry_type','note','pages',
      'title','publisher','entry_type']);
    var values = JSON.stringify(['pk 123']);
   // console.log($scope.entry);
   // BibTex.save({'fields':fields,
   //   'values':values},function(response) {
   //   console.log(response);
   // });
  }
  
  $scope.update = function(){
    var ignore_list = ['id','$$hashKey','selected','student_map'];
    var value_json = {};
    angular.forEach($scope.form, function(value,key) {
     if(ignore_list.indexOf(key)==-1) { 
      value_json[key]=value;
     }
    });
    //console.log(value_json);

    var values = JSON.stringify(value_json);
    var timest = ''+(new Date()).getTime();
    var where_str = JSON.stringify({
     'str':'id = ?',
     'json':[$scope.form.id]
    });

    var sign = Core_HMAC.generate({'query':{'where':where_str,'timestamp':timest},
      'path':'/gradnu/bibtex_entry'});
    BibTex.update({'values':values,
      'where':where_str,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey
      }, function(response){
      console.log(response);
    });
    
  }
  
 $scope.insert_form = function(){
  $scope.change_type();
  $scope.form = {};
  $scope.entry = null;
 } 

 $scope.change_type = function() {
   var type = '';
   if($scope.selected_type) { 
     type = $scope.selected_type.name;
   }
   $scope.entry_fields = {};
   angular.forEach(entry_fields_default, function(value,key) {
     $scope.entry_fields[key] = JSON.parse(value);
   });

   if(type == 'article') {  
     $scope.entry_fields['author'].selected = true;
   }

 }
}
/*
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

*/

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
