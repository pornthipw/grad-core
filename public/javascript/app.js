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


function MainController($scope,Student,Staff,GradStaff) {  
  //$scope.level_list = Level.query();
}



