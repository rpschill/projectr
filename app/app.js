(function () {
    'use strict';

    angular.module('app', [
        'ngRoute',
        'ngMessages',
        'ngMaterial',
        'firebase'
    ])

        .config(['$mdThemingProvider', '$locationProvider', '$routeProvider', function ($mdThemingProvider, $locationProvider, $routeProvider) {

            $mdThemingProvider
                .theme('default')
                .primaryPalette('deep-orange')
                .accentPalette('red');

            var config = {
                apiKey: "AIzaSyCjaJi7MhYh3AblrRXEA5Cvno5T_syBxp0",
                authDomain: "projectr-e52e0.firebaseapp.com",
                databaseURL: "https://projectr-e52e0.firebaseio.com",
                storageBucket: "projectr-e52e0.appspot.com",
                messagingSenderId: "392164271176"
            };
            firebase.initializeApp(config);


        }])


        .factory('projects', ['$firebaseArray', function ($firebaseArray) {

            var ref = firebase.database().ref().child('projects');

            return $firebaseArray(ref);
        }])



        .factory('todos', ['$firebaseArray', '$locationProvider', function ($firebaseArray, $locationProvider) {

            var project = $locationProvider.path();

            var ref = firebase.database().ref().child('todos');
        }])


        .controller('AppCtrl', function ($mdSidenav) {

            var vm = this;

            vm.close = function (side) {
                $mdSidenav(side).close();
            };

        })

        .controller('TopCtrl', function ($mdSidenav) {

            var vm = this;

            vm.toggleLeft = function () {
                $mdSidenav('left').toggle();
            };

            vm.toggleRight = function () {
                $mdSidenav('right').toggle();
            };

        })



        .controller('RightCtrl', function ($mdSidenav) {

            var vm = this;

            vm.close = function () {
                $mdSidenav('right').close();
            };

        })


        .controller('ListCtrl', function ($mdDialog) {

            var vm = this;

        })

        .controller('LeftCtrl', function ($mdSidenav, $mdDialog, projects) {

            var vm = this;
            
            vm.projects = projects;

            vm.addProject = function(ev) {
                var confirm = $mdDialog.prompt()
                    .title('Create new project')
                    .placeholder('Enter a title for your project')
                    .ariaLabel('Project title')
                    .initialValue('')
                    .targetEvent(ev)
                    .ok('Create')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function(result) {
                    vm.title = result;
                    vm.projects.$add({
                        title: vm.title
                    });
                });
            };

        })


})();