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


//Core_HMAC.key = 'nook123';
//Core_HMAC.apiKey = 'Nook';

Core_HMAC.generate = function(req) {
    console.log("key--"+this.key);
    var json_obj = {};
    var key_list = [];
    var str = '';
    console.log(req.query);
    for(var key in req.query) {
      key_list.push(key);
    };
    key_list.sort();
    key_list.forEach(function(key) {
      if(key in req.query) {
        json_obj[key] = req.query[key];
        console.log(req.query[key]);
      } 
    });

    str += req.path+'/n'+JSON.stringify(json_obj);
    console.log("app.js path-->"+str);
    var MD5 = new Hashes.MD5;
    //console.log("--"+this.key);
    var md5_str = MD5.b64_hmac(str,this.key);
    console.log(md5_str);
    return md5_str;
};


function MainController($scope,Student,Staff,GradStaff) {  
  $scope.assign = function() {
    
    Core_HMAC.apiKey = $scope.api_key;
    Core_HMAC.set_key($scope.api_pass);

  };
  //$scope.level_list = Level.query();
}



