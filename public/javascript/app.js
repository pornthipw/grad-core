var app = angular.module('gs_core', [
  'db_service','$strap.directives']);

/*
app.factory('SharedService', function($rootScope) {
    var sharedService = {};
    sharedService.message = '';

    sharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };
    return sharedService;
});
*/

app.config(function($routeProvider) {
  $routeProvider.when('/', {
    controller:MainController, 
    templateUrl:'static/index.html'
  });
});


var Core_HMAC = function() {
  self.apiKey = null;
  self.key = null;
};

Core_HMAC.set_key = function(key) {
  this.key = key;
};

Core_HMAC.set_apikey = function(key) {
  this.apiKey = key;
};



//Core_HMAC.key = '';
//Core_HMAC.apiKey = '';

Core_HMAC.authenticated = function($http,cb) {
  var ts = ''+(new Date()).getTime();
  $http({
   method:'GET',
   url:'http://www.db.grad.nu.ac.th/apps/core/auth',   
   params:{
    '_apiKey':Core_HMAC.apiKey,
    '_sign':Core_HMAC.generate({
      'path':'/auth',
      'query':{'timestamp':ts}
    }),
    'timestamp': ts
   }
  }).success(function(data) {
    if(data.error) {
      cb.error();
    } else {
      if(data.success) {
        cb.success();
      }
    }
  });
};

Core_HMAC.generate = function(req) {
    //console.log("key--"+this.key);
    var json_obj = {};
    var key_list = [];
    var str = '';
    //console.log("Client:req.query-->"+req.query);
    for(var key in req.query) {
      key_list.push(key);
      //console.log("Client: key-->"+key);
    };
    key_list.sort();
    key_list.forEach(function(key) {
      if(key in req.query) {
        json_obj[key] = req.query[key];
        //console.log("Client: req.query[key]-->"+req.query[key]);
        //console.log("Client: json_obj[key]-->"+json_obj[key]);
      } 
    });

    str += req.path+'/n'+JSON.stringify(json_obj);
    //console.log("app.js path-->"+str);
    var MD5 = new Hashes.MD5;
    //console.log("Client: this.key--> "+this.key);
    var md5_str = MD5.b64_hmac(str,this.key);
    //console.log("Client: md5_str--> "+md5_str);
    return md5_str;
};


function MainController($scope,Student,Staff,GradStaff,$http, 
   $location, $rootScope) {  
  
  $scope.assign = function() {
    Core_HMAC.apiKey = $scope.api_key;
    Core_HMAC.set_key($scope.api_pass);
    var ts = ''+(new Date()).getTime();
    var t2;
    $http({
     method:'GET',
     url:'http://www.db.grad.nu.ac.th/apps/core/auth',   
     params:{
      '_apiKey':$scope.api_key,
      '_sign':Core_HMAC.generate({
        'path':'/auth',
        'query':{'timestamp':ts}
      }),
      'timestamp': ts
     }
    }).success(function(data) {
      if(data.success) {
        $scope.login = true;
        $location.path($rootScope.path_current);
        console.log('Login Ok!');
        var now = new Date().toISOString().replace(/T+/g, ' ').replace(/\..+/, '') ; 
        console.log(now);
      }
    });
  };

  //$scope.level_list = Level.query();
}


