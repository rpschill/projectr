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


            $routeProvider

                .when('/project/:projId', {
                    templateUrl: 'app/projects/layout.html'
                })

                .otherwise({redirectTo: '/'});


        }])



        .factory('projects', ['$firebaseArray', function ($firebaseArray) {

            var ref = firebase.database().ref().child('projects');

            return $firebaseArray(ref);
        }])



        .factory('todos', ['$firebaseArray', '$routeParams', function ($firebaseArray, $routeParams) {

            var projTitle = $routeParams.projId;
            var ref = firebase.database().ref().child('todos'); //.orderByChild('project').equalTo(projTitle);

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


        .controller('ListCtrl', function ($route, $routeParams, $firebaseArray, $firebaseObject, $mdSidenav, $mdDialog, projects) {

            var vm = this;

            vm.params = $routeParams;

            var refTodo = firebase.database().ref().child('todos');
            var ref = refTodo.orderByChild('project').equalTo(vm.params.projId);

            vm.todos = $firebaseArray(ref);

            vm.title = '';

            vm.toggleRight = function () {
                $mdSidenav('right').toggle();
            };

            vm.addTodo = function() {
                var todoData = {
                    title: vm.title,
                    project: vm.params.projId,
                    complete: false,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    isOpen: false
                };

                var newKey = refTodo.push().key;
                vm.title = '';

                var updates = {};

                updates['/todos/' + newKey] = todoData;

                return firebase.database().ref().update(updates);

            };


            vm.deleteTodo = function(todo, ev) {
                var confirm = $mdDialog.confirm()
                    .title('Would you like to delete this todo item?')
                    .textContent('This will delete the item forever.')
                    .targetEvent(ev)
                    .ok('Delete forever')
                    .cancel("No! Don't do it!");

                $mdDialog.show(confirm).then(function() {
                    vm.todos.$remove(todo);
                }, function() {
                    console.log('This item was not removed');
                });
            };

        })

        .controller('LeftCtrl', function ($route, $mdSidenav, $mdDialog, $firebaseObject, projects) {

            var vm = this;

            vm.proj;

            vm.projects = projects;

            vm.addProject = function (ev) {
                var confirm = $mdDialog.prompt()
                    .title('Create new project')
                    .placeholder('Enter a title for your project')
                    .ariaLabel('Project title')
                    .initialValue('')
                    .targetEvent(ev)
                    .ok('Create')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    vm.title = result;
                    vm.projects.$add({
                        title: vm.title
                    });
                });
            };


            vm.setCurrentProject = function (project) {
                var proj;
                console.log(project);
                var ref = firebase.database().ref('projects/' + project);
                console.log('ref: ' + ref);
                //var projRec = vm.projects.$getRecord(project);
                var obj = $firebaseObject(ref);
                obj.$loaded()
                    .then(function (data) {
                        proj = data;
                        DataFactory.update(proj.title);
                        console.log(proj.title);
                        console.log(DataFactory.data.ProjectName);
                    });


            }

        })


})();