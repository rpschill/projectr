(function() {
    'use strict';

    angular.module('app', [
        'ngRoute',
        'ngMaterial',
        'firebase'
    ])

  /*  .config(['$locationProvider', '$routeProvider', '$mdIconProvider', function($locationProvider, $routeProvider, $mdIconProvider) {

        $routeProvider

        .when('/', {
            templateUrl: 'app/layout/shell.html',
            controller: 'AppCtrl'
        })

        .otherwise({redirectTo: '/'});

    }])*/

    .controller('AppCtrl', function($scope, $timeout, $mdSidenav, $log) {
        $scope.toggleLeft = function() {
            $mdSidenav('left').toggle();
        };

        $scope.close = function() {
            $mdSidenav('left').close()
        };
        
    })

    .controller('ListCtrl', function($scope, $mdDialog) {
        
    })


})();