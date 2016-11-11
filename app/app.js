(function () {
    'use strict';

    angular.module('app', [
        'ngRoute',
        'ngMessages',
        'ngMaterial',
        'firebase'
    ])

        .run(['$rootScope', '$location', function ($rootScope, $location) {
            $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
                if (error === 'AUTH_REQUIRED') {
                    $location.path('/login');
                }
            });
        }])

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

                .when('/', {
                    templateUrl: 'app/login/layout.html',
                    resolve: {
                        'currentAuth': ['Auth', function(Auth) {
                            return Auth.$waitForSignIn();
                        }]
                    }
                })

                .when('/project/:projId', {
                    templateUrl: 'app/projects/layout.html',
                    resolve: {
                        'currentAuth': ['Auth', '$location', function(Auth, $location) {
                            return Auth.$requireSignIn();
                        }]
                    }
                })

                .otherwise({ redirectTo: '/' });


        }])



        .factory('Auth', ['$firebaseAuth', function($firebaseAuth) {
            return $firebaseAuth();
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




        // Directives

        .directive('contenteditable', function() {
            return {
                require: 'ngModel',
                link: function(scope, element, attrs, ngModel) {

                    function read() {
                        ngModel.$setViewValue(element.html());
                    };

                    ngModel.$render = function() {
                        element.html(ngModel.$viewValue || '');
                    };

                    element.bind('blur keyup change', function() {
                        scope.$apply(read);
                    });
                }
            }
        })




        // Home page / login / auth

        .controller('AuthCtrl', function(Auth, $location, $timeout) {

            var vm = this;

            vm.auth = Auth;
            vm.user = vm.auth.$getAuth();


        })

        .controller('HomeCtrl', function ($mdSidenav, $mdDialog, Auth) {
            var vm = this;

            vm.toggleRight = function () {
                $mdSidenav('home-right').toggle();
            };

            vm.close = function () {
                $mdSidenav('home-right').close();
            };



            vm.showSignIn = function (ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'app/login/login-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                    .then(function () {
                        console.log('You clicked the Sign In button');
                    }, function () {
                        console.log('You said you forgot your password');
                    });
            };

            function DialogController($scope, $mdDialog, $location, Auth) {

                $scope.auth = Auth;
                $scope.user = $scope.auth.$getAuth();

                $scope.email = null;
                $scope.password = null;

                $scope.signInErrorMessage = '';

                $scope.signIn = function() {
                    $scope.auth.$signInWithEmailAndPassword($scope.email, $scope.password).then(function(firebaseUser) {
                        console.log('Signed in as: ', firebaseUser.uid);
                        $location.path('/project/-KVkktsH-a4oC2tmPb_-');
                        $mdDialog.hide();
                    }).catch(function(error) {
                        console.error('Authentication failed: ', error);
                        $scope.signInErrorMessage = 'Sign in failed.'
                    });
                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }
        })




        .controller('TopNavCtrl', function ($mdSidenav, $mdDialog) {
            var vm = this;


        })




        .controller('RightNavCtrl', function ($mdSidenav) {

            var vm = this;


        })





        // Main application

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

            vm.addTodo = function () {
                var todoData = {
                    title: vm.title,
                    project: vm.params.projId,
                    complete: false,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    isOpen: false,
                    dueDate: ''
                };

                var newKey = refTodo.push().key;
                vm.title = '';

                var updates = {};

                updates['/todos/' + newKey] = todoData;

                return firebase.database().ref().update(updates);

            };


            vm.deleteTodo = function (todo, ev) {
                var confirm = $mdDialog.confirm()
                    .title('Would you like to delete this todo item?')
                    .textContent('This will delete the item forever.')
                    .targetEvent(ev)
                    .ok('Delete forever')
                    .cancel("No! Don't do it!");

                $mdDialog.show(confirm).then(function () {
                    vm.todos.$remove(todo);
                }, function () {
                    console.log('This item was not removed');
                });
            };


            vm.showDatePicker = false;


            vm.newDate = new Date();

            vm.setDueDate = function(todo) {
                todo.dueDate = vm.newDate.$getTime();
                vm.todos.$save(todo).then(function(ref) {
                    ref.key === todo.$id;
                });
                vm.showDatePicker = false;
            };

        })



        .controller('LeftCtrl', function ($route, $mdSidenav, $mdDialog, $firebaseObject, Auth, projects) {

            var vm = this;

            vm.proj;

            vm.projects = projects;

            vm.auth = Auth;
            vm.user = vm.auth.$getAuth();
            vm.user_id = vm.user.uid;

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
                        title: vm.title,
                        user_id: vm.user_id
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