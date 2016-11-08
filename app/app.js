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

        

        .factory('DataFactory', function() {

            return {
                data: {
                    ProjectName: 'Inbox'
                },
                update: function(name) {
                    this.data.ProjectName = name;
                }
            };

        })


        .factory('projects', ['$firebaseArray', function ($firebaseArray) {

            var ref = firebase.database().ref().child('projects');

            return $firebaseArray(ref);
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

        })



        .controller('RightCtrl', function ($mdSidenav) {

            var vm = this;

            vm.close = function () {
                $mdSidenav('right').close();
            };

        })


        .controller('ListCtrl', function ($rootScope, $firebaseArray, $firebaseObject, $mdSidenav, projects, DataFactory) {

            var vm = this;
            var scope = $rootScope;

            vm.data = DataFactory.data.ProjectName;
            vm.ref = firebase.database().ref('todos').orderByChild('project').equalTo(vm.data);
            vm.todos = $firebaseArray(vm.ref);

            vm.toggleRight = function () {
                $mdSidenav('right').toggle();
            };

            scope.$watch(
                function() { return vm.data; },
                function(newValue, oldValue) {
                    if ( newValue !== oldValue ) {
                        ref = firebase.database().ref('todos').orderByChild('project').equalTo(data);
                        vm.todos = $firebaseArray(ref);
                    }
                }
            );

        })

        .controller('LeftCtrl', function ($mdSidenav, $mdDialog, $firebaseObject, projects, DataFactory) {

            var vm = this;

            vm.data = DataFactory;

            vm.proj;
            
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


            vm.setCurrentProject = function(project) {
                var proj;
                console.log(project);
                var ref = firebase.database().ref('projects/' + project);
                console.log('ref: ' + ref);
                //var projRec = vm.projects.$getRecord(project);
                var obj = $firebaseObject(ref);
                obj.$loaded()
                    .then(function(data) {
                        proj = data;
                    });
                vm.data.update(proj.title);

            }

        })


})();