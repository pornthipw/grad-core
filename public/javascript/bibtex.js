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
    controller:BibTexListController, 
    templateUrl:'static/bibtex/index.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/bibtex/:id', {
    controller:BibTexController, 
    templateUrl:'static/bibtex/detail.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/create', {
    controller:BibTexCreateController, 
    templateUrl:'static/bibtex/form.html'
  });
});

function BibTexController($http,$scope,$routeParams,$location,
  GradDB,RegDB,Staff,GradStaff, $rootScope, HrDB) {
 entry_fields_default =  {
  'author':JSON.stringify({'display':{'th':'ผู้แต่ง/หีวหน้าโครงการ','en':'Author'}}),
  'title':JSON.stringify({'display':{'th':'ชื่อบทความ','en':'Title'}}),
  'journal':JSON.stringify({'display':{'th':'ชื่อวารสาร','en':'Journal'}}),
  'pages':JSON.stringify({'display':{'th':'เลขหน้าที่ตีพิมพ์','en':'Pages'}}),
  'year':JSON.stringify({'display':{'th':'ปีที่เผยแพร่','en':'Year'}}),
  'volume':JSON.stringify({'display':{'th':'เล่มที่','en':'Volume'}}),
  'number':JSON.stringify({'display':{'th':'เลขประจำฉบัับ','en':'Number'}}),
  'organization':JSON.stringify({'display':{'th':'หน่วยงานจัดประชุม','en':'Organization'}}),
  'dateconference':JSON.stringify({'display':{'th':'วันที่นำเสนอ (จัดประชุม)','en':'dateconference'}}),
  'booktitle':JSON.stringify({'display':{'th':'ชื่อนำเสนอที่ประชุมวิชาการ','en':'Booktitle'}}),
  'note':JSON.stringify({'display':{'th':'หมายเหตุ','en':'Note'}}),
  'keyword':JSON.stringify({'display':{'th':'คำค้น คำสำคัญ','en':'KeyWord'}}),
  'month':JSON.stringify({'display':{'th':'เดือนที่เผยแพร่','en':'Month'}}),
  'type':JSON.stringify({'display':{'th':'ชนิดของผลงานวิจัย','en':'Type'}}),
  'publisher':JSON.stringify({'display':{'th':'หน่วยงานเจ้าของวารสาร','en':'Publisher'}}),
  'institution':JSON.stringify({'display':{'th':'หน่วยงาน','en':'Institution'}}),
  };
  
  Core_HMAC.authenticated($http,{
   error:function() {
     $scope.authenticated = false;
     $rootScope.path_current = "/bibtex";
//     $location.path('/');
   },
   success:function() {
     $scope.authenticated = true;
   }
  });

  var where_str = JSON.stringify({
   'str':'id = ?',
   'json':[$routeParams.id]
  });

  $scope.query = function() {
  GradDB.query({'table':'bibtex_entry',
    'where':where_str}, function(entry_list) {
    var entry = entry_list[0];
    $scope.entry = entry;
    $scope.entry_fields = {};

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

    var where_str = JSON.stringify({
      'str':'bibtex_id = ?',
      'json':[$routeParams.id]
    });

    $scope.entry.student_map = [];

    GradDB.query({'table':'regnu_grad_studentpublication', 
      'where':where_str}, function(student_list) {
      console.log(student_list);
      if (student_list.length > 0) {
      angular.forEach(student_list, function(student_entry) {
        StudentModel.get_student(RegDB, student_entry.student, 
        function(s_model) {
          $scope.entry.student_map.push(s_model);
        });
      });
      } else {
        $scope.chk_student = true; 
        console.log("delete student");
      }
    });

    $scope.entry.staff_map = [];

    GradDB.query({'table':'hrnu_grad_gradstaffpublication',
      'where':where_str}, function(gs_list){
      if (gs_list.length > 0){
      angular.forEach(gs_list, function(gs) {
     
        if(gs.grad_staff_id) {
          GradStaffModel.get(GradDB, gs.grad_staff_id, function(gs_model) {
            gs_model['map_id'] = gs.id;
            $scope.entry.staff_map.push(gs_model);
          });
        }else{
         StaffModel.get(HrDB, gs.nu_id, function(staff_model){
           staff_model['map_id'] = gs.id; 
           $scope.entry.staff_map.push(staff_model);
         });
        }
        
      });
     } else {
      $scope.chk_staff = true; 
      console.log("delete staff");
     }
    });
  });
  };
   
  $scope.query();

  $scope.search = function(text) {
    var where_str = JSON.stringify({
      'str':"FNAME LIKE '%"+text+"%' OR "+
        "LNAME LIKE '%"+text+"%'",
      'json':[]
    });
    Staff.query({where:where_str},function(staff_list){
      where_str = JSON.stringify({
        'str':"first_name LIKE '%"+text+"%' OR "+
          "last_name LIKE '%"+text+"%'",
         'json':[]
      });
      GradStaff.query({where:where_str},function(gradstaff_list){
        $scope.gradstaff_list = [];
        $scope.staff_list = staff_list;
        //console.log($scope.staff_list);
        angular.forEach(gradstaff_list, function(g_staff) {
          if(!g_staff.nu_staff) {
            $scope.staff_list.push(g_staff);
          } else {
            for(var idx=0;idx<staff_list.length;idx++) {
              var staff = staff_list[idx];
              if(g_staff.nu_staff == staff.STAFFID) {
                staff.grad_staff = true;
                staff.grad_id = g_staff.id;
                break;
              }
            }
          }
        });
      });
    });
  }

  $scope.update = function(){
    var ignore_list = ['id','$$hashKey',
      'selected','student_map','staff_map'];
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
   

    var sign = Core_HMAC.generate({'query':
     {'values':values,'where':where_str,'timestamp':timest},
      'path':'/gradnu/bibtex_entry'});

    GradDB.update({'table':'bibtex_entry'},{
    //BibTex.update({
      'values':values,
      'where':where_str,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey
      }, function(response){
      console.log(response);
    });
    
  };

  $scope.map = function (staff) {
    //map
    $scope.staff_selected = staff;
    console.log(staff);
    var timest = ''+(new Date()).getTime();
    var fields = JSON.stringify(['grad_staff_id','bibtex_id','nu_id']);
    var id = $scope.staff_selected.grad_id;
    //console.log("-->"+id);
    if(!$scope.staff_selected.STAFFID) {
      id = $scope.staff_selected.id;
    //console.log("<<-->"+id);
    }else{
     if(!id){
       id = null;
       //console.log("-->"+id);
     }
    }
    var values = JSON.stringify([id,
      $scope.entry.id,$scope.staff_selected.STAFFID]);
    var sign = Core_HMAC.generate({
      'query':{
         'values':values,
         'fields':fields,
         'timestamp':timest
      },
      'path':'/gradnu/hrnu_grad_gradstaffpublication'});

    console.log(values);

    GradDB.save({'table':'hrnu_grad_gradstaffpublication'},{
      'fields':fields,
      'values':values,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey},function(response) {
      console.log(response);
      $scope.query();
    });
  }  
  
  $scope.delMap = function(map_id){
    console.log(map_id)
    //var values = JSON.stringify(value_json);
    var timest = ''+(new Date()).getTime();
    var where_str = JSON.stringify({
     'str':'id = ?',
     'json':[map_id]
    });
   

    var sign = Core_HMAC.generate({'query':
     {'where':where_str,'timestamp':timest},
      'path':'/gradnu/hrnu_grad_gradstaffpublication/delete'});
    //console.log("sign-->"+sign);    
    GradDB.remove({'table':'hrnu_grad_gradstaffpublication','mode':'delete'},{
    //BibTex.update({
      'where':where_str,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey
      }, function(response){
        $scope.query();
      //console.log(response);
    });
  };

  $scope.delete_entry = function(){
    var timest = ''+(new Date()).getTime();
    var where_str = JSON.stringify({
     'str':'id = ?',
     'json':[$scope.form.id]
    });
   
    var sign = Core_HMAC.generate({'query':
     {'where':where_str,'timestamp':timest},
      'path':'/gradnu/bibtex_entry/delete'});
    //console.log("sign-->"+sign);    
    GradDB.remove({'table':'bibtex_entry','mode':'delete'},{
    //BibTex.update({
      'where':where_str,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey
      }, function(response){
      //console.log(response);
      // $scope.query();
       $location.path('/bibtex');
    });
   
  }
     

}


function BibTexListController($scope,GradDB,RegDB, BibTex, HMAC, GradStaff) {
  $scope.entrytype_list = [
    {'name':'article', 'display':'วารสาร'},
    {'name':'inproceedings','display':'นำเสนอที่ประชุมวิชาการ'},
    {'name':'book','display':'หนังสือ/ตำรา'},
    {'name':'techreport','display':'รายงานวิจัย/โครงการวิจัย'}
  ]; 

  $scope.limit = 20;

  GradDB.query({'table':'bibtex_entry'}, function(entry_list) {
    $scope.entry_list = entry_list;
    $scope.totalPage = Math.ceil(entry_list.length/$scope.limit);
  });

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


function BibTexCreateController($scope,GradDB,RegDB, 
  BibTex, HMAC, GradStaff,$location) {
  $scope.entrytype_list = [
    {'name':'article', 'display':'วารสาร'},
    {'name':'inproceedings','display':'นำเสนอที่ประชุมวิชาการ'},
    {'name':'book','display':'หนังสือ/ตำรา'},
    {'name':'techreport','display':'รายงานวิจัย/โครงการวิจัย'}
  ]; 


  entry_fields_default =  {
    'author':JSON.stringify({'display':{'th':'ผู้แต่ง/หัวหน้าโครงการ','en':'Author'},'num':1}),
    'title':JSON.stringify({'display':{'th':'ชื่อบทความ','en':'Title'},'num':2}),
    'journal':JSON.stringify({'display':{'th':'ชื่อวารสาร','en':'Journal'},'num':3}),
    'booktitle':JSON.stringify({'display':{'th':'ชื่อนำเสนอที่ประชุมวิชาการ','en':'Booktitle'},'num':4}),
    'year':JSON.stringify({'display':{'th':'ปีที่เผยแพร่','en':'Year'},'num':5}),
    'pages':JSON.stringify({'display':{'th':'เลขหน้าที่ตีพิมพ์','en':'Pages'},'num':6}),
    'volume':JSON.stringify({'display':{'th':'เล่มที่','en':'Volume'},'num':7}),
    'number':JSON.stringify({'display':{'th':'เลขประจำฉบับ','en':'Number'},'num':8}),
    'address':JSON.stringify({'display':{'th':'สถานที่ตีพิมพ์','en':'Address'},'num':9}),
    'type':JSON.stringify({'display':{'th':'ชนิดของผลงานวิจัย','en':'Type'},'num':15}),
    'organization':JSON.stringify({'display':
      {'th':'หน่วยงานจัดประชุม','en':'Organization'},'num':10}),
    'dateconference':JSON.stringify({'display':
      {'th':'วันที่นำเสนอ (จัดประชุม)','en':'dateconference'},'num':11}),
    'note':JSON.stringify({'display':{'th':'หมายเหตุ','en':'Note'},'num':17}),
    'keyword':JSON.stringify({'display':{'th':'คำค้น คำสำคัญ','en':'KeyWord'},'num':16}),
    'month':JSON.stringify({'display':{'th':'เดือนที่เผยแพร่','en':'Month'},'num':14}),
    'publisher':JSON.stringify({'display':
      {'th':'หน่วยงานเจ้าของวารสาร','en':'Publication'},'num':12}),
    'institution':JSON.stringify({'display':
      {'th':'หน่วยงาน','en':'Institution'},'num':13}),
  };

  $scope.form = {};

  $scope.add = function() {
    $scope.entry = null;
    var ignore_list = ['id','$$hashKey',
      'selected','student_map','staff_map'];
    var value_json = {};
    //console.log($scope.form);
    angular.forEach($scope.form, function(value,key) {
     if(ignore_list.indexOf(key)==-1) { 
      value_json[key]=value;
      //$scope.form[key] = JSON.parse(value);
      //console.log(value_json[key]);
     }
    });
    //console.log(value_json);

    //var values = JSON.stringify(value_json);
    //var values = JSON.stringify([$scope.form[key]]);
    var timest = ''+(new Date()).getTime();
    //var fields = JSON.stringify(['grad_staff_id','bibtex_id','nu_id']);
    var fields = JSON.stringify([
        'author'
        ,'journal'
        ,'title'
        ,'year'
        ,'month'
        ,'volume'
        ,'number'
        ,'entry_type'
        ,'note'
        ,'pages'
        ,'publisher'
        ,'dateconference'
        ,'organization'
        ,'booktitle'
        ,'address'
        ,'type'
        //,'keyword'
        ,'edition'
        ,'series'
        ,'institution'
    ]); 
    
    var values = JSON.stringify([
        $scope.form['author']
        ,$scope.form['journal']
        ,$scope.form['title']
        ,$scope.form['year']
        ,$scope.form['month']
        ,$scope.form['volume']
        ,$scope.form['number']
        ,$scope.selected_type.name
        ,$scope.form['note']
        ,$scope.form['pages']
        ,$scope.form['publisher']
        ,$scope.form['dateconference']
        ,$scope.form['organization']
        ,$scope.form['booktitle']
        ,$scope.form['addrerss']
        ,$scope.form['type']
        //,$scope.form['keyword']
        ,$scope.form['edition']
        ,$scope.form['series']
        ,$scope.form['institution']
    ]);
   
    //  $scope.entry.id,$scope.staff_selected.STAFFID]);
    //var values = JSON.stringify(['pk 123']);
    //var sign = Core_HMAC.generate({
    //  'query':{
    //     'values':values,
    //     'fields':fields,
    //     'timestamp':timest
    //  },
    //  'path':'/gradnu/bibtex_entry'});

    //console.log(values);

    //GradDB.save({'table':'bibtex_entry'},{
    //  'fields':fields,
    //  'values':values,
    //  '_sign':sign,
    //  'timestamp':timest,
    //  '_apiKey':Core_HMAC.apiKey},function(response) {
    //  console.log(response);
    //});
    BibTex.save({'fields':fields,'values':values
      },function(response) {
      console.log(response);
      $location.path('/bibtex');
    });
  } 

  $scope.change_type = function() {
    var type = '';
    if($scope.selected_type) { 
      type = $scope.selected_type.name;
    }
    $scope.entry_fields = {};
    angular.forEach(entry_fields_default, function(value,key) {
      //console.log(key);
      $scope.entry_fields[key] = JSON.parse(value);
    });

    if(type == 'article') {  
      $scope.entry_fields['author'].selected = true;
      $scope.entry_fields['title'].selected = true;
      $scope.entry_fields['journal'].selected = true;
      //$scope.entry_fields['publisher'].selected = true;
      //$scope.entry_fields['address'].selected = true;
      $scope.entry_fields['year'].selected = true;
      //$scope.entry_fields['month'].selected = true;
      //$scope.entry_fields['volume'].selected = true;
      //$scope.entry_fields['number'].selected = true;
      //$scope.entry_fields['pages'].selected = true;
      $scope.entry_fields['note'].selected = true;
    } else {

     if(type == 'inproceedings') {  
       $scope.entry_fields['author'].selected = true;
       $scope.entry_fields['title'].selected = true;
       $scope.entry_fields['booktitle'].selected = true;
       $scope.entry_fields['organization'].selected = true;
       $scope.entry_fields['dateconference'].selected = true;
       //$scope.entry_fields['address'].selected = true;
       $scope.entry_fields['year'].selected = true;
       //$scope.entry_fields['month'].selected = true;
       //$scope.entry_fields['volume'].selected = true;
       //$scope.entry_fields['number'].selected = true;
       //$scope.entry_fields['pages'].selected = true;
       $scope.entry_fields['note'].selected = true;
     } else {

      if(type == 'book') {  
        $scope.entry_fields['author'].selected = true;
        $scope.entry_fields['title'].selected = true;
        $scope.entry_fields['publisher'].selected = true;
       // $scope.entry_fields['address'].selected = true;
        $scope.entry_fields['year'].selected = true;
        //$scope.entry_fields['month'].selected = true;
        //$scope.entry_fields['volume'].selected = true;
        //$scope.entry_fields['number'].selected = true;
        $scope.entry_fields['note'].selected = true;
      } else {

          if(type == 'techreport') {  
              $scope.entry_fields['author'].selected = true;
              $scope.entry_fields['title'].selected = true;
              //$scope.entry_fields['publisher'].selected = true;
              $scope.entry_fields['institution'].selected = true;
              //$scope.entry_fields['address'].selected = true;
              $scope.entry_fields['type'].selected = true;
              $scope.entry_fields['year'].selected = true;
              $scope.entry_fields['month'].selected = true;
              //$scope.entry_fields['number'].selected = true;
              $scope.entry_fields['note'].selected = true;
          }
      }
     }

    }
  }
  
  $scope.change_type();
 
}

/*
function BibTexMapController($scope,$routeParams,
  GradDB,RegDB, BibTex, HMAC, GradStaff, Staff, GradStaffPublicationDB) {

  $scope.entrytype_list = [
    {'name':'article', 'display':'วารสาร'},
    {'name':'proceedings','display':'นำเสนอที่ประชุมวิชาการ'},
    {'name':'book','display':'หนังสือ/ตำรา'}
  ]; 

  entry_fields_default =  {
    'author':JSON.stringify({'display':{'th':'ผู้แต่ง','en':'Author'}}),
    'title':JSON.stringify({'display':{'th':'ชื่อบทความ','en':'Title'}}),
    'journal':JSON.stringify({'display':{'th':'ชื่อวารสาร','en':'Journal'}}),
    'pages':JSON.stringify({'display':{'th':'เลขหน้าที่ตีพิมพ์','en':'Pages'}}),
    'year':JSON.stringify({'display':{'th':'ปีที่เผยแพร่','en':'Year'}}),
    'number':JSON.stringify({'display':{'th':'เลขประจำฉบัับ','en':'Number'}}),
    'organization':JSON.stringify({'display':
      {'th':'หน่วยงานจัดประชุม','en':'Organization'}}),
    'dateconference':JSON.stringify({'display':
      {'th':'วันที่นำเสนอ (จัดประชุม)','en':'dateconference'}}),
    'booktitle':JSON.stringify({'display':
      {'th':'ชื่อนำเสนอที่ประชุมวิชาการ','en':'Booktitle'}}),
    'note':JSON.stringify({'display':{'th':'หมายเหตุ','en':'Note'}}),
    'keyword':JSON.stringify({'display':{'th':'คำค้น คำสำคัญ','en':'KeyWord'}}),
    'month':JSON.stringify({'display':{'th':'เดือนที่เผยแพร่','en':'Month'}}),
    'publisher':JSON.stringify({'display':
      {'th':'หน่วยงานเจ้าของวารสาร','en':'Publisher'}}),
  };

  var where_str = JSON.stringify({
    'str':'id = ?',
    'json':[$routeParams.id]
  });

  GradDB.query({'table':'bibtex_entry','where':where_str}, 
   function(entry) {
    //  1
    $scope.entry = entry[0];
    //console.log($scope.entry);
    $scope.entry.student_map = [];
    $scope.entry_fields = {};
    var ignore_list = ['id','entry_type',
      'student_map','selected'
    ];

    angular.forEach(entry_fields_default, function(value,key) {
      $scope.entry_fields[key] = JSON.parse(value);
      //console.log($scope.entry_fields[key]);
    });

    angular.forEach(entry[0], function(value,key) {
      if(!(key in $scope.entry_fields)) {
        $scope.entry_fields[key] = {'display':key};
        //console.log($scope.entry_fields[key]);
      }
      if(value) {
        if(ignore_list.indexOf(key) == -1) {
          $scope.entry_fields[key].selected = true;
        }
      }
    });
    $scope.form = entry[0];
    var where_str = JSON.stringify({
      'str':'bibtex_id = ?',
      'json':[$routeParams.id]
    });

    GradDB.query({'table':'regnu_grad_studentpublication', 
      'where':where_str}, function(student_list) {
      // 2
        angular.forEach(student_list, function(student_entry) {
          StudentModel.get_student(RegDB, student_entry.student, 
            function(s_model) {
              $scope.entry.student_map.push(s_model);
          });
        });
    });


    var where_str = JSON.stringify({
      'str':'bibtex_id = ?',
      'json':[$routeParams.id]
    });
    GradDB.query({'table':'hrnu_grad_gradstaffpublication',
     'where':where_str}, function(st_pub){
     console.log(st_pub); 
    });
  //

   
    $scope.search = function(text) {
      var where_str = JSON.stringify({
        'str':"FNAME LIKE '%"+text+"%' OR "+
          "LNAME LIKE '%"+text+"%'",
        'json':[]
      });
      Staff.query({where:where_str},function(staff_list){
        where_str = JSON.stringify({
          'str':"first_name LIKE '%"+text+"%' OR "+
            "last_name LIKE '%"+text+"%'",
          'json':[]
        });
        GradStaff.query({where:where_str},function(gradstaff_list){
          $scope.gradstaff_list = [];
          $scope.staff_list = staff_list;
          //console.log($scope.staff_list);
          angular.forEach(gradstaff_list, function(g_staff) {
            if(!g_staff.nu_staff) {
              $scope.staff_list.push(g_staff);
            } else {
              for(var idx=0;idx<staff_list.length;idx++) {
                var staff = staff_list[idx];
                if(g_staff.nu_staff == staff.STAFFID) {
                  staff.grad_staff = true;
                  staff.grad_id = g_staff.id;
                  break;
                }
              }
            }
          });
        });
      });
    }
  });

  $scope.map = function (staff) {
    //map
    $scope.staff_selected = staff;
    console.log(staff);
    var timest = ''+(new Date()).getTime();
    var fields = JSON.stringify(['grad_staff_id','bibtex_id','nu_id']);
    var values = JSON.stringify([$scope.staff_selected.grad_id,
      $scope.entry.id,$scope.staff_selected.STAFFID]);
    var sign = Core_HMAC.generate({
      'query':{
         'values':values,
         'fields':fields,
         'timestamp':timest
      },
      'path':'/gradnu/hrnu_grad_gradstaffpublication'});

    console.log(values);

    GradDB.save({'table':'hrnu_grad_gradstaffpublication'},{
      'fields':fields,
      'values':values,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey},function(response) {
      console.log(response);
    });
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

    var sign = Core_HMAC.generate({'query':{'values':values,
      'where':where_str,'timestamp':timest},
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

}
*/

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
