
app.config(function($routeProvider) {
  $routeProvider.when('/test/client/:loop', {
    controller:TestController, 
    templateUrl:'static/test.html'
  });
});

app.config(function($routeProvider) {
  $routeProvider.when('/test/noauth/:loop', {
    controller:TestNosecureController, 
    templateUrl:'static/test2.html'
  });
});

function TestController($scope,$http,$rootScope,$routeParams,Test) {
  var count=0;
  var interval = 1000;  // 1000 = 1 second, 3000 = 3 seconds
  var max=parseInt($routeParams.loop);
  Core_HMAC.key = 'RimbrpN1979';   
  console.time('atime');
  for (var i=1; i<max; i++) {
    var timest = ''+(new Date()).getTime();
    var query = {'num':i};
    var sign = Core_HMAC.generate({'query':
       {'timestamp':timest},'path':'/test/'+i});
    Test.get({'num':i,
      '_sign':sign,
      'timestamp':timest,
      '_apiKey':Core_HMAC.apiKey}, function(result){
        count++;   
        if (count==max-1) {
          console.timeEnd('atime');
        }
     }); 
    }
};

function TestNosecureController($scope,$http,$rootScope,$routeParams,Test2) {
  var count=0;
  var interval = 1000;  // 1000 = 1 second, 3000 = 3 seconds
  var max=parseInt($routeParams.loop);
  console.time('atime');
  for (var i=1; i<max; i++) {
    var timest = ''+(new Date()).getTime();
    Test2.get({'num':i},
      function(result){
        count++;   
        if (count==max-1) {
          console.timeEnd('atime');
        }
     }); 
    }
};
