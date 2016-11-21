(function () {
    'use strict';

    angular.module('app', [
        'ngAnimate',
        'ngRoute',
        'ngMessages',
        'ngMaterial',
        'firebase'
    ])

        .run(['$rootScope', '$location', function ($rootScope, $location) {
            $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
                if (error === 'AUTH_REQUIRED') {
                    $location.path('/');
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
                        'currentAuth': ['Auth', function (Auth) {
                            return Auth.$waitForSignIn();
                        }]
                    }
                })

                .when('/app', {
                    templateUrl: 'app/dashboard/layout.html',
                    resolve: {
                        'currentAuth': ['Auth', '$location', function (Auth, $location) {
                            return Auth.$requireSignIn();
                        }]
                    }
                })

                .otherwise({ redirectTo: '/app' });


        }])



        .factory('Auth', ['$firebaseAuth', function ($firebaseAuth) {
            return $firebaseAuth();
        }])




        .factory('projects', ['$firebaseArray', 'Auth', function ($firebaseArray, Auth) {

            var ref = firebase.database().ref('/projects');


            return $firebaseArray(ref);
        }])




        .factory('todos', ['$firebaseArray', 'Auth', function ($firebaseArray, Auth) {

            var auth = Auth.$getAuth();

            var ref = firebase.database().ref('/todos').orderByChild('user_id').equalTo(auth.uid);
            return $firebaseArray(ref);
        }])



        .factory('folders', ['$firebaseArray', 'Auth', function ($firebaseArray, Auth) {

            var auth = Auth.$getAuth();
            var ref = firebase.database().ref('/folders').orderByChild(auth.uid).equalTo(true);

            return $firebaseArray(ref);
        }])



        .factory('activeFolder', function () {

            var activeFolder = {};

            activeFolder.id = null;

            activeFolder.setActive = function (folder) {
                activeFolder.id = folder;
            };

            activeFolder.getActive = function () {
                return activeFolder.id;
            };

            return activeFolder;
        })


        .factory('activeProject', function () {

            var activeProject = {};

            activeProject.id = null;

            activeProject.setActive = function (project) {
                activeProject.id = project;
            };

            activeProject.getActive = function () {
                return activeProject.id;
            };

            return activeProject;
        })



        // Directives

        .directive('contenteditable', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ngModel) {

                    function read() {
                        ngModel.$setViewValue(element.html());
                    };

                    ngModel.$render = function () {
                        element.html(ngModel.$viewValue || '');
                    };

                    element.bind('blur keyup change', function () {
                        scope.$apply(read);
                    });
                }
            }
        })



        .directive('onEnter', function () {
            return function (scope, element, attrs) {
                element.bind('keydown keypress', function (event) {
                    if (event.which === 13) {
                        event.preventDefault();
                        scope.$apply(function () {
                            scope.$eval(attrs.onEnter);
                        });
                    }
                });
            };
        })



        .directive('resetFocusOnNew', function ($timeout) {
            return function (scope, element, attrs, ctrl) {
                if (scope.$last) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
                scope.$watch('$last', function () {
                    if (scope.$last) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
            };
        })



        .directive('focusIter', function () {
            return function (scope, elem, attrs) {
                var atomSelector = attrs.focusIter;

                elem.on('keyup', atomSelector, function (e) {
                    var atoms = elem.find(atomSelector),
                        toAtom = null;

                    for (var i = atoms.length - 1; i >= 0; i--) {
                        if (atoms[i] === e.target) {
                            if (e.keyCode === 38) {
                                toAtom = atoms[i - 1];
                            }
                            if (e.keyCode === 40) {
                                toAtom = atoms[i + 1];
                            }
                            else if (e.keyCode === 13) {
                                toAtom = atoms[i + 1];
                            }
                            break;
                        }
                    }

                    if (toAtom) toAtom.focus();

                });

                elem.on('keydown', atomSelector, function (e) {
                    if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 13)
                        e.preventDefault();
                });
            };
        })



        .directive('deleteTaskListener', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.focus(function () {
                        attrs.$observe('ngModel', function (todo) {
                            element.bind('keydown keypress', function (event) {
                                if (event.which === 8) {
                                    if (scope.todo.title === '') {
                                        scope.$apply(function () {
                                            scope.$eval(attrs.deleteTaskListener);
                                        });

                                        event.preventDefault();
                                    }
                                }
                            });
                        });
                    });
                }
            };
        })





        // Home page / login / auth

        .controller('AuthCtrl', function (Auth, $location, $timeout) {

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


            vm.showRegister = function (ev) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'app/login/register-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                }).then(function () {
                    console.log('You clicked the Sign Up button');
                }, function () {
                    console.log('You said you already have an account');
                });
            };



            function DialogController($scope, $mdDialog, $location, $timeout, $firebaseArray, $firebaseObject, Auth) {

                var ref = firebase.database().ref().child('/users');
                $scope.auth = Auth;
                $scope.user = $scope.auth.$getAuth();


                $scope.email = null;
                $scope.password = null;

                $scope.signInErrorMessage = '';

                $scope.signIn = function () {
                    $scope.auth.$signInWithEmailAndPassword($scope.email, $scope.password).then(function (firebaseUser) {
                        console.log('Signed in as: ', firebaseUser.uid);
                        $location.path('/dashboard');
                        $mdDialog.hide();
                    }).catch(function (error) {
                        console.error('Authentication failed: ', error);
                        $scope.signInErrorMessage = 'Sign in failed.'
                    });
                };

                $scope.register = function () {
                    $scope.id = null;
                    $scope.auth.$createUserWithEmailAndPassword($scope.email, $scope.password).then(function (firebaseUser) {
                        $scope.uid = firebaseUser.uid;
                        console.log("User " + $scope.uid + " created successfully");
                    }).then(function () {
                        firebase.database().ref('users/' + $scope.uid).set({
                            email: $scope.email,
                            firstName: '',
                            lastName: '',
                            createdDate: firebase.database.ServerValue.TIMESTAMP
                        }).then(function () {
                            var ref = firebase.database().ref('/projects').push({
                                title: 'Inbox',
                                user_id: $scope.uid
                            }).then(function (ref) {
                                console.log('Project created');
                                $scope.id = ref.key;
                                $mdDialog.hide();
                                $location.path('/project/' + $scope.id);
                            });
                        }).then(function () {

                            var todoData = {
                                title: '',
                                project: $scope.id,
                                complete: false,
                                createdDate: firebase.database.ServerValue.TIMESTAMP,
                                isOpen: false,
                                dueDate: '',
                                showDatePicker: false,
                                user_id: $scope.uid
                            };

                            var newKey = firebase.database().ref('/todos').push().key;

                            var updates = {};

                            updates['/todos/' + newKey] = todoData;

                            firebase.database().ref().update(updates);
                        });
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



        // Dashboard

        .controller('DashCtrl', function ($location, $timeout, $firebaseArray, activeFolder, activeProject, folders, projects) {

            var vm = this;

            vm.activeFolder = activeFolder;
            vm.folders = folders;
            vm.activeProject = activeProject;
            vm.projects = projects;
            vm.folder;
            vm.project;

            var ref = firebase.database().ref()


            vm.showInput = false;
            vm.showProj = false;
            vm.showProjectInput = false;
            vm.showProjectInputButton = false;
            vm.title = '';
            vm.projTitle = '';

            vm.projectView = false;
            vm.todoView = false;


            vm.createFolder = function () {
                var folderData = {
                    title: vm.title,
                    createdDate: firebase.database.ServerValue.TIMESTAMP
                };

                vm.folderKey = firebase.database().ref('/folders').push().key;
                vm.title = '';

                var updates = {};

                updates['/folders/' + vm.folderKey] = folderData;
                updates['/users/' + vm.user + '/folders/' + vm.folderKey] = true;

                firebase.database().ref().update(updates);

                updates = {};

                updates['/folders/' + vm.folderKey + '/' + vm.user] = true;
                firebase.database().ref().update(updates);

                vm.showInput = false;
            };


            vm.createProject = function () {
                var folder = activeFolder.getActive();
                var projectData = {
                    title: vm.projTitle,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    folder: activeFolder.getActive()
                };

                vm.projectKey = firebase.database().ref('/projects').push().key;
                vm.projTitle = '';

                var updates = {};

                updates['/projects/' + vm.projectKey] = projectData;
                updates['/folders/' + folder + '/projects/' + vm.projectKey] = true;

                firebase.database().ref().update(updates);

                vm.showProj = false;
            };



            vm.showProjects = function (folder) {
                var active = activeFolder.getActive();
                if (!vm.projectView && active == null) {
                    activeFolder.setActive(folder);
                    vm.folder = folder;
                    vm.projectView = true;
                    vm.showProjectInputButton = true;
                }
                else if (vm.projectView && active == folder) {
                    vm.projectView = false;
                    vm.todoView = false;
                    vm.showProjectInputButton = false;
                    activeFolder.setActive(null);
                    activeProject.setActive(null);
                    vm.folder = null;
                    vm.project = null;
                }
                else if (vm.projectView && active != folder) {
                    $timeout(function () {
                        vm.projectView = true;
                        vm.todoView = false;
                        vm.showProjectInputButton = true;
                        activeFolder.setActive(folder);
                        activeProject.setActive(null);
                        vm.folder = folder;
                        vm.project = null;
                    });
                }
            };



            vm.showTodos = function(project) {
                var active = activeProject.getActive();
                if (!vm.todoView && active == null) {
                    activeProject.setActive(project);
                    vm.project = project;
                    vm.todoView = true;
                }
                else if (vm.todoView && active == project) {
                    vm.todoView = false;
                    activeProject.setActive(null);
                    vm.project = null;
                }
                else if (vm.todoView && active != project) {
                    $timeout(function() {
                        vm.todoView = true;
                        vm.projectView = true;
                        activeProject.setActive(project);
                        vm.project = project;
                    });
                }
            };



            vm.loadProject = function (project) {
                $location.path('/folder/' + vm.folder + '/project/' + project);
                vm.folder = null;
                activeFolder.setActive(null);
            };



            vm.projectFilter = function (project) {
                var active = activeFolder.getActive();
                return project.folder == active ? true : false;
            };


        })





        // Main application

        .controller('AppCtrl', function ($mdSidenav) {

            var vm = this;

            vm.close = function (side) {
                $mdSidenav(side).close();
            };

        })




        .controller('TopCtrl', function ($routeParams, $location, $firebaseObject, $mdSidenav, Auth) {

            var vm = this;

            vm.params = $routeParams;

            vm.auth = Auth;


            var ref = firebase.database().ref('/projects/' + vm.params.projId);
            vm.project = $firebaseObject(ref);
            vm.projTitle = vm.project.title;

            vm.toggleLeft = function () {
                $mdSidenav('left').toggle();
            };

            vm.auth.$onAuthStateChanged(function (firebaseUser) {
                if (firebaseUser) {
                    console.log('Signed in');
                }
                else {
                    $location.path('/');
                }
            });

            vm.logOut = function () {
                vm.auth.$signOut();
            }


        })



        .controller('RightCtrl', function ($mdSidenav) {

            var vm = this;

            vm.close = function () {
                $mdSidenav('right').close();
            };



        })




        .controller('ListCtrl', function ($route, activeProject, $firebaseArray, $firebaseObject, $mdSidenav, $mdDialog, projects, Auth, todos) {

            var vm = this;

            vm.auth = Auth;
            vm.user = vm.auth.$getAuth();
            vm.activeProject = activeProject.getActive();

            var ref = firebase.database().ref('/todos');

            vm.todos = $firebaseArray(ref);

            vm.title = '';

            vm.toggleRight = function () {
                $mdSidenav('right').toggle();
            };

            vm.addTodo = function () {
                var todoData = {
                    title: vm.title,
                    project: activeProject.getActive(),
                    complete: false,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    isOpen: false,
                    dueDate: '',
                    showDatePicker: false,
                    user_id: vm.user.uid
                };

                var newKey = firebase.database().ref('/todos').push().key;
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


            vm.removeTodo = function (todo) {
                vm.todos.$remove(todo);
            };


            vm.projFilter = function (todo) {
                return todo.project == activeProject.getActive() ? true : false;
            };


            vm.newDate = new Date();

            vm.setDueDate = function (todo) {

                todo.dueDate = vm.newDate.getTime();
                todo.showDatePicker = false;
                vm.todos.$save(todo).then(function (ref) {
                    ref.key === todo.$id;
                });
                vm.newDate = new Date();
            };


            vm.updateTodo = function (todo) {
                vm.todos.$save(todo).then(function (ref) {
                    ref.key === todo.$id;
                });

                if (todo.complete) {

                }
            }

        })



        .controller('LeftCtrl', function ($route, $routeParams, $mdSidenav, $mdDialog, $firebaseArray, $firebaseObject, Auth) {

            var vm = this;

            vm.auth = Auth;
            vm.user = vm.auth.$getAuth();
            vm.user_id = vm.user.uid;

            vm.params = $routeParams;

            var ref = firebase.database().ref('/projects').orderByChild('user_id').equalTo(vm.user_id);
            vm.projects = $firebaseArray(ref);

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


            };


            vm.projectFilter = function (project) {
                var folder = vm.params.folderId;
                return project.folder == folder ? true : false;
            };

        })


})();