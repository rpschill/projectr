(function () {
    'use strict';

    angular.module('app', [
        'ngAnimate',
        'ngRoute',
        'ngMessages',
        'ngMaterial',
        'firebase',
        'ngMaterialSidemenu',
        'timer',
        'angular-momentjs'
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

                .when('/dashboard', {
                    templateUrl: 'app/main/layout.html',
                    resolve: {
                        'currentAuth': ['Auth', '$location', function (Auth, $location) {
                            return Auth.$requireSignIn();
                        }]
                    }
                })

                .when('/profile', {
                    templateUrl: 'app/profile/layout.html',
                    resolve: {
                        'currentAuth': ['Auth', '$location', function (Auth, $location) {
                            return Auth.$requireSignIn();
                        }]
                    }
                })

                .when('/settings', {
                    templateUrl: 'app/settings/layout.html',
                    resolve: {
                        'currentAuth': ['Auth', '$location', function (Auth, $location) {
                            return Auth.$requireSignIn();
                        }]
                    }
                })

                .when('/reports', {
                    templateUrl: 'app/reports/layout.html',
                    resolve: {
                        'currentAuth': ['Auth', '$location', function (Auth, $location) {
                            return Auth.$requireSignIn();
                        }]
                    }
                })

                .otherwise({ redirectTo: '/' });


        }])



        .factory('Auth', ['$firebaseAuth', function ($firebaseAuth) {
            return $firebaseAuth();
        }])




        .factory('projects', ['$firebaseArray', 'Auth', function ($firebaseArray, Auth) {

            var auth = Auth.$getAuth();
            var uid = auth.uid;
            var ref = firebase.database().ref('/projects').orderByChild('user_id').equalTo(uid);


            return $firebaseArray(ref);
        }])




        .factory('todos', ['$firebaseArray', 'Auth', function ($firebaseArray, Auth) {

            var auth = Auth.$getAuth();

            var ref = firebase.database().ref('/todos').orderByChild('user_id').equalTo(auth.uid);
            return $firebaseArray(ref);
        }])



        .factory('childTodos', ['$firebaseArray', 'Auth', function ($firebaseArray, Auth) {

            var auth = Auth.$getAuth();

            var ref = firebase.database().ref('/childTodos').orderByChild('user_id').equalTo(auth.uid);
            return $firebaseArray(ref);
        }])



        .factory('folders', ['$firebaseArray', 'Auth', function ($firebaseArray, Auth) {

            var auth = Auth.$getAuth();
            var uid = auth.uid;
            var ref = firebase.database().ref('/folders').orderByChild(uid).equalTo(true);

            return $firebaseArray(ref);
        }])



        .factory('activeFolder', function () {

            var activeFolder = {};

            activeFolder.id = null;
            activeFolder.title = null;

            activeFolder.setActive = function (folderId, folderTitle) {
                activeFolder.id = folderId;
                activeFolder.title = folderTitle;
            };

            activeFolder.getActive = function () {
                return activeFolder;
            };

            return activeFolder;
        })


        .factory('activeProject', function ($firebaseObject) {

            var activeProject = {};

            activeProject.id = null;
            activeProject.title = null;
            activeProject.folderTitle = null;
            activeProject.folderId = null;

            activeProject.setActive = function (projectId, projectTitle, folderTitle, folderId) {
                activeProject.id = projectId;
                activeProject.title = projectTitle;
                activeProject.folderTitle = folderTitle;
                activeProject.folderId = folderId;
            };

            activeProject.setFolder = function (folderTitle, folderId) {
                activeProject.folderTitle = folderTitle;
                activeProject.folderId = folderId;
            };

            activeProject.getActive = function () {
                return activeProject;
            };

            return activeProject;
        })


        .factory('activeTodo', function () {

            var activeTodo = {};

            activeTodo.id = null;
            activeTodo.level = null;

            activeTodo.setActive = function (todoId, level) {
                activeTodo.id = todoId;
                activeTodo.level = level;
            };

            activeTodo.getActive = function () {
                return activeTodo;
            };

            return activeTodo;
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
                            $timeout(function () {
                                element[0].focus();
                            });
                        });
                    }
                });
            };
        })


        .directive('ctrlRightArrow', function () {
            return function (scope, element, attrs) {
                element.bind('keydown keypress', function (event) {
                    if (event.altKey === true && event.which === 39) {
                        event.preventDefault();
                        scope.$apply(function () {
                            scope.$eval(attrs.ctrlRightArrow);
                        });
                    }
                });
            };
        })



        .directive('tabAction', function () {
            return function (scope, element, attrs) {
                element.bind('keydown keypress', function (event) {
                    if (event.which === 9) {
                        event.preventDefault();
                        scope.$apply(function () {
                            scope.$eval(attrs.tabAction);
                        });
                    }
                });
            };
        })



        .directive('shiftTabAction', function () {
            return function (scope, element, attrs) {
                element.bind('keydown keypress', function (event) {
                    if (event.shiftKey && event.which == 9) {
                        event.preventDefault();
                        scope.$apply(function () {
                            scope.$eval(attrs.shiftTabAction);
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
                                console.log("atom[i]", atoms[i]);
                                console.log('toAtom', toAtom);
                                console.log('i', i);
                                console.log('length', atoms.length);
                            }
                            if (e.keyCode === 40) {
                                toAtom = atoms[i + 1];
                                console.log("atom[i]", atoms[i]);
                                console.log('toAtom', toAtom);
                                console.log('i', i);
                                console.log('length', atoms.length);
                            }
                            else if (e.keyCode === 13) {
                                toAtom = atoms[i + 1];
                                console.log("atom[i]", atoms[i]);
                                console.log('toAtom', toAtom);
                                console.log('i', i);
                                console.log('length', atoms.length);
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




        .directive('deleteTaskListener', function ($timeout) {
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
                                            $timeout(function () {
                                                element[0].focus();
                                            });
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



        .directive('deleteChildListener', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.focus(function () {
                        attrs.$observe('ngModel', function (child) {
                            element.bind('keydown keypress', function (event) {
                                if (event.which === 8) {
                                    if (scope.child.title === '') {
                                        scope.$apply(function () {
                                            scope.$eval(attrs.deleteChildListener);
                                            $timeout(function () {
                                                element[0].focus();
                                            });
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

        .controller('HomeCtrl', function ($mdSidenav, $mdDialog, $location, Auth) {
            var vm = this;

            vm.auth = Auth;

            vm.email = '';
            vm.password = '';
            vm.uid = null;

            vm.inboxId;

            vm.toggleSignIn = false;

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


            vm.registerUser = function () {
                vm.auth.$createUserWithEmailAndPassword(vm.email, vm.password)
                    .then(function (firebaseUser) {
                        vm.uid = firebaseUser.uid;
                    })
                    .then(function () {
                        firebase.database().ref('users/' + vm.uid).set({
                            email: vm.email,
                            firstName: '',
                            lastName: '',
                            createdDate: firebase.database.ServerValue.TIMESTAMP
                        });
                    });

                $location.path('/dashboard');
            };


            vm.signIn = function () {
                vm.auth.$signInWithEmailAndPassword(vm.email, vm.password)
                    .then(function (firebaseUser) {
                        $location.path('/dashboard');
                    }).catch(function (error) {
                        console.error('Authentication failed: ', error);
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
                        $location.path('/app');
                        $mdDialog.hide();
                    }).catch(function (error) {
                        console.error('Authentication failed: ', error);
                        $scope.signInErrorMessage = 'Sign in failed.'
                    });
                };

                $scope.register = function () {
                    $scope.folderId = null;
                    $scope.projectId = null;
                    $scope.uid = null;
                    $scope.auth.$createUserWithEmailAndPassword($scope.email, $scope.password).then(function (firebaseUser) {
                        $scope.uid = firebaseUser.uid;
                        console.log("User " + $scope.uid + " created successfully");
                    }).then(function () {
                        firebase.database().ref('users/' + $scope.uid).set({
                            email: $scope.email,
                            firstName: '',
                            lastName: '',
                            createdDate: firebase.database.ServerValue.TIMESTAMP
                        });

                        $mdDialog.hide();
                        $location.path('/app');
                    });



                    $scope.hide = function () {
                        $mdDialog.hide();
                    };

                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
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

        .controller('DashCtrl', function ($scope, $mdDialog, $mdSidenav, $location, $timeout, $route, $routeParams, $firebaseArray, $firebaseObject, activeFolder, activeProject, folders, projects, Auth, activeTodo) {

            var vm = this;

            vm.auth = Auth;
            vm.user_id = vm.auth.$getAuth().uid;

            vm.signOut = function () {
                vm.auth.$signOut();
                $location.path('/');
            };

            vm.activeFolder = activeFolder;
            vm.folders = folders;
            vm.projects = projects;
            vm.folder;
            vm.project;
            vm.showDelete = false;
            vm.showProjDelete = false;
            vm.showFolderEdit = false;
            vm.showCalendar = false;

            vm.isMenuOpen = false;
            vm.isDetailOpen = false;
            vm.isFolderSidebarOpen = true;

            vm.todoObj;

            vm.newDate = new Date();
            vm.dateObj = vm.newDate.getTime();



            var ref = firebase.database().ref();

            vm.activeProject = activeProject.getActive();

            vm.projTitle = vm.activeProject.title;
            vm.projId = vm.activeProject.id;
            vm.projObj = null;

            vm.newProj = '';
            vm.proj = '';

            vm.folderId = vm.activeProject.folderId;
            vm.folderTitle = vm.activeProject.folderTitle;

            vm.close = function () {
                $mdSidenav('left').close();
            };

            vm.open = function () {
                $mdSidenav('left').open();
            };

            vm.toggleFolderSidebar = function () {
                vm.isFolderSidebarOpen = !vm.isFolderSidebarOpen;
            };

            vm.toggleDetail = function (todo, level) {
                vm.isDetailOpen = !vm.isDetailOpen;
                activeTodo.setActive(todo, level);

                console.log('activeTodo.id', activeTodo.id);
                console.log('activeTodo.level', activeTodo.level);

                var ref = firebase.database().ref('/' + activeTodo.level).child(activeTodo.id);
                vm.todoObj = $firebaseObject(ref);
                var date = new Date();
                vm.dueDate = date.setTime(vm.todoObj.dueDate);

                var sublistRef = firebase.database().ref('/' + activeTodo.level + '/' + activeTodo.id).orderByChild('sublist');
                vm.sublist = $firebaseArray(sublistRef);
            };



            vm.createSublistItem = function () {

            };

            vm.closeDetail = function () {
                $mdSidenav('todoDetail').close();
            };

            $scope.$watch(
                function () {
                    return activeProject.title;
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        vm.projTitle = newValue;
                    }
                }
            );

            $scope.$watch(
                function () {
                    return activeProject.id;
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        vm.projId = newValue;
                    }
                }
            );

            $scope.$watch(
                function () {
                    return activeProject.folderTitle;
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        vm.folderTitle = newValue;
                    }
                }
            );

            $scope.$watch(
                function () {
                    return activeProject.folderId;
                },
                function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        vm.folderId = newValue;
                    }
                }
            );

            if (vm.projId) {
                var projRef = firebase.database().ref('/projects').child(vm.projId);
                vm.projObj = $firebaseObject(projRef);
                vm.pId = vm.projObj.$id;
            };

            vm.saveDueDate = function () {
                vm.showCalendar = false;
                var date = new Date();
                var updatedDate = date.setTime(vm.dueDate);
                vm.todoObj.dueDate = updatedDate;
                vm.todoObj.$save();

            };


            vm.showInput = false;
            vm.showProj = false;
            vm.showProjectInput = false;
            vm.showProjectInputButton = false;

            vm.projectView = false;
            vm.todoView = false;

            vm.openMenu = function ($mdOpenMenu, ev) {
                $mdOpenMenu(ev);
            };

            vm.openUserMenu = function ($mdOpenMenu, ev) {
                $mdOpenMenu(ev);
            };


            vm.createFolder = function () {
                var folderData = {
                    title: vm.projTitle,
                    createdDate: firebase.database.ServerValue.TIMESTAMP
                };

                vm.folderKey = firebase.database().ref('/folders').push().key;

                var updates = {};

                updates['/folders/' + vm.folderKey] = folderData;
                updates['/users/' + vm.user + '/folders/' + vm.folderKey] = true;

                firebase.database().ref().update(updates);

                updates = {};

                updates['/folders/' + vm.folderKey + '/' + vm.user_id] = true;
                firebase.database().ref().update(updates);

                vm.showInput = false;
            };


            vm.addFolder = function (ev) {
                var confirm = $mdDialog.prompt()
                    .title('Create new folder')
                    .placeholder('Enter a title for your folder')
                    .ariaLabel('Folder title')
                    .initialValue('')
                    .targetEvent(ev)
                    .ok('Create')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    vm.projTitle = result;
                    vm.createFolder();
                });
            };

            vm.editFolder = function (ev, folder) {
                var folder = folder;
                var confirm = $mdDialog.prompt()
                    .title('Edit folder')
                    .placeholder('Enter a new name')
                    .ariaLabel('Folder title')
                    .initialValue(folder.title)
                    .targetEvent(ev)
                    .ok('Save')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    folder.title = result;
                    activeProject.setFolder(folder.title, folder.$id);
                    vm.folders.$save(folder);
                });
            };


            vm.updateFolder = function (folder) {
                vm.folders.$save(folder);
            };


            vm.createProject = function (folder) {
                var folder = folder;
                var projectData = {
                    title: vm.projTitle,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    folder: folder,
                    user_id: vm.user_id
                };

                vm.projectKey = firebase.database().ref('/projects').push().key;

                var updates = {};

                updates['/projects/' + vm.projectKey] = projectData;
                updates['/folders/' + folder + '/projects/' + vm.projectKey] = true;

                firebase.database().ref().update(updates);
            };


            vm.addProject = function (ev, folder) {
                var folder = folder;
                var confirm = $mdDialog.prompt()
                    .title('Create new project')
                    .placeholder('Enter a title for your project')
                    .ariaLabel('Project title')
                    .targetEvent(ev)
                    .ok('Create')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    vm.projTitle = result;
                    vm.createProject(folder);
                });
            };


            vm.projectMenu = function ($mdOpenMenu, ev) {
                $mdOpenMenu(ev);
            };



            vm.showProjects = function (folder) {
                var folder = folder;
                activeFolder.setActive(folder);
            };


            vm.loadProjects = function (folderId, folderTitle) {
                vm.todoView = false;
                vm.folder = folderId;
                vm.folderTitle = folderTitle;
                activeFolder.setActive(folderId, folderTitle);
                vm.projectView = true;
            };



            vm.showTodos = function (projectId, projectTitle, folderTitle, folderId) {
                activeProject.setActive(projectId, projectTitle, folderTitle, folderId);
                vm.todoView = true;
            };



            vm.folderMenu = function ($mdOpenMenu, ev, folder) {
                vm.folder = folder;
                $mdOpenMenu(ev);
            };



            vm.projectFilter = function (folder) {
                return project.folder == folder ? true : false;
            };



            vm.deleteFolder = function (folder, ev) {
                var confirm = $mdDialog.confirm()
                    .title('Would you like to delete this folder?')
                    .textContent('This will delete the folder and its projects forever.')
                    .targetEvent(ev)
                    .ok('Delete forever')
                    .cancel("No! Don't do it!");

                $mdDialog.show(confirm).then(function () {
                    vm.folders.$remove(folder);
                }, function () {
                    console.log('This folder was not deleted');
                });
            };


            vm.editProject = function (ev) {
                var title = activeProject.getActive().projectTitle;
                var folderTitle = activeProject.getActive().folderTitle;
                var folderId = activeProject.getActive().folderId;
                var confirm = $mdDialog.prompt()
                    .title('Edit project')
                    .placeholder('Enter a new name')
                    .ariaLabel('Project title')
                    .initialValue(title)
                    .targetEvent(ev)
                    .ok('Save')
                    .cancel('Cancel');

                $mdDialog.show(confirm).then(function (result) {
                    var id = activeProject.getActive().id;
                    title = result;
                    var updates = {};
                    updates['/projects/' + id + '/title'] = title;
                    firebase.database().ref().update(updates);
                    activeProject.setActive(id, title, folderTitle, folderId);
                });
            };


            vm.deleteProject = function (ev) {
                var confirm = $mdDialog.confirm()
                    .title('Would you like to delete this project?')
                    .textContent('This will delete the project forever.')
                    .targetEvent(ev)
                    .ok('Delete forever')
                    .cancel("No! Leave my project alone!");

                $mdDialog.show(confirm).then(function () {
                    var project = activeProject.getActive().id;
                    var updates = {};
                    updates['/folders/' + vm.folder + '/projects/' + project] = null;
                    updates['/projects/' + project] = null;
                    firebase.database().ref().update(updates);
                    activeProject.setActive(null, null, null, null);
                    vm.todoView = false;
                }, function () {
                    console.log('This project was not deleted');
                });
            };


            vm.openFolderOptions = function ($mdOpenMenu, ev) {
                $mdOpenMenu(ev);
            };


        })



        .controller('TimerCtrl', function ($scope, $timeout, $firebaseObject, $firebaseArray, activeTodo, Auth) {

            var vm = this;

            vm.auth = Auth;
            vm.user_id = vm.auth.$getAuth().uid;

            vm.id = activeTodo.getActive().id;
            vm.level = activeTodo.getActive().level;

            vm.timers;

            if (vm.id) {
                var ref = firebase.database().ref('/' + vm.level).child(vm.id);
                vm.todo = $firebaseObject(ref);
                vm.todoId = vm.todo.$id;
            }

            var timerRef = firebase.database().ref('/timers').orderByChild('user_id').equalTo(vm.user_id);
            vm.timers = $firebaseArray(timerRef);

            vm.timerRunning = false;
            vm.editedTimer = {};

            vm.startTimer = function () {
                $scope.$broadcast('timer-start');
                console.log(activeTodo);
                vm.timerRunning = true;
            };

            vm.stopTimer = function () {
                $scope.$broadcast('timer-stop');
                vm.timerRunning = false;
            };

            vm.addTimer = function (data) {
                var timerData =  {
                    parent: activeTodo.getActive().id,
                    totalTime: data,
                    timestamp: firebase.database.ServerValue.TIMESTAMP,
                    edit: false,
                    user_id: vm.user_id
                };

                vm.timerKey = firebase.database().ref('/timers').push().key;

                var updates = {};
                updates['/timers/' + vm.timerKey] = timerData;

                firebase.database().ref().update(updates);
            };

            $scope.$on('timer-stopped', function (ev, data) {
                vm.addTimer(data);
            });

            vm.convertTime = function (timestamp) {
                var converted = new Date(timestamp);
                var dtString = converted.toLocaleString();
                return dtString;
            };

            vm.cancelEditTime = function (timer) {
                angular.copy(vm.editedTimer, timer);
                timer.edit = false;
            };

            vm.saveTime = function (timer) {
                timer.edit = false;
                vm.timers.$save(timer);
            };
        })



        .controller('detailCtrl', function ($scope, $timeout, $mdSidenav, $firebaseObject, activeTodo, detailTodo) {
            var vm = this;

            /*vm.todoId = activeTodo.getActive().id;
            vm.todoLevel = activeTodo.getActive().level;*/

            vm.newDate = new Date();
            vm.minDate = new Date();

            vm.todoObj;
            vm.title;

            detailTodo.$loaded(function () {
                vm.todo = detailTodo;
            });


        })


        // Main application

        .controller('AppCtrl', function ($mdSidenav) {

            var vm = this;

            vm.close = function (side) {
                $mdSidenav(side).close();
            };

        })




        .controller('TopCtrl', function ($location, $firebaseObject, $mdSidenav, Auth, activeProject) {

            var vm = this;

            vm.auth = Auth;

            vm.activeProject = activeProject.getActive();


            var ref = firebase.database().ref('/projects/' + vm.activeProject.id);
            vm.projTitle = vm.activeProject.title;

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




        .controller('ListCtrl', function ($scope, activeProject, activeFolder, $firebaseArray, $firebaseObject, $mdSidenav, $mdDialog, projects, Auth, todos, childTodos, activeTodo) {

            var vm = this;

            vm.auth = Auth.$getAuth().uid;
            vm.user = vm.auth.uid;

            vm.todos = todos;
            vm.childTodos = childTodos;
            vm.todo;
            vm.isDetailOpen = false;

            vm.childLevel = 'childTodos';
            vm.todoLevel = 'todos';

            vm.title = '';
            vm.childTitle = '';

            vm.showCompleted = false;
            vm.completeText = 'Show';

            vm.openDetail = function () {
                $mdSidenav('todoDetail').open();
            };

            vm.closeDetail = function () {
                $mdSidenav('todoDetail').close();
            };

            vm.toggleDetail = function (todo, level) {
                vm.isDetailOpen = !vm.isDetailOpen;
                activeTodo.setActive(todo, level);
                console.log('activeTodo.id', activeTodo.id);
                console.log('activeTodo.level', activeTodo.level);
            };



            vm.addTodo = function () {
                var todoData = {
                    title: vm.title,
                    project: activeProject.getActive().id,
                    complete: false,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    isOpen: false,
                    dueDate: '',
                    showDatePicker: false,
                    user_id: vm.auth
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
                //angular.element
                vm.todos.$remove(todo);
            };


            vm.projFilter = function (todo) {
                return todo.project == activeProject.id ? true : false;
            };

            vm.completedFilter = function (todo) {
                if (!vm.showCompleted) {
                    return todo.complete === false;
                }
                else {
                    return todo;
                }
            };

            vm.childCompletedFilter = function (child) {
                if (!vm.showCompleted) {
                    return child.completed === false;
                }
                else {
                    return child;
                }
            };

            vm.toggleCompleted = function () {
                vm.showCompleted = !vm.showCompleted;
                if (vm.showCompleted) {
                    vm.completeText = 'Hide';
                }
                else {
                    vm.completeText = 'Show';
                }
            };



            vm.addChild = function (todo) {
                var todo = todo;
                console.log(todo);
                var childData = {
                    title: vm.childTitle,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    parentId: todo,
                    complete: false,
                    project: activeProject.getActive().id,
                    showDatePicker: false,
                    dueDate: '',
                    user_id: vm.auth,
                    isOpen: false
                };

                var updates = {};

                var newKey = firebase.database().ref('/childTodos').push().key;
                console.log(newKey);

                updates['/childTodos/' + newKey] = childData;
                vm.childTitle = '';

                return firebase.database().ref().update(updates);

            };



            vm.updateChild = function (child) {
                vm.childTodos.$save(child).then(function (ref) {
                    ref.key === child.$id;
                });
            };


            vm.removeChild = function (child) {
                vm.childTodos.$remove(child);
            };


            /*vm.addChild = function(todo) {
                var todoId = vm.todos.$keyAt(todo);
                console.log(todo);
                console.log(todoId);
                var childData = {
                    title: vm.childTitle,
                    project: activeProject.getActive().id,
                    complete: false,
                    createdDate: firebase.database.ServerValue.TIMESTAMP,
                    dueDate: '',
                    showDatePicker: false,
                    user_id: vm.user.uid
                };

                var newKey = firebase.database().ref('/todos/' + todoId).child('children').push().key;
                vm.childTitle = '';

                var updates = {};

                updates['/todos/' + todoId + '/children/' + newKey] = childData;

                return firebase.database().ref().update(updates);
            };


            vm.updateChild = function(todo, child) {
                vm.todos.$save(child).then(function(ref) {
                    ref.key === child.$id;
                });
                
            };*/


            vm.newDate = new Date();

            vm.setDueDate = function (todo) {

                todo.dueDate = vm.newDate.getTime();
                todo.showDatePicker = false;
                vm.todos.$save(todo).then(function (ref) {
                    ref.key === todo.$id;
                });
                vm.newDate = new Date();
            };


            vm.setChildDueDate = function (child) {
                child.dueDate = vm.newDate.getTime();
                child.showDatePicker = false;
                vm.childTodos.$save(child).then(function (ref) {
                    ref.key === child.$id;
                });
                vm.newDate = new Date();
            };


            vm.updateTodo = function (todo) {
                vm.todos.$save(todo).then(function (ref) {
                    ref.key === todo.$id;
                });

                if (todo.complete) {

                }
            };


            vm.convertToParent = function (child) {
                var child = child;
                var childData = {
                    complete: child.complete,
                    createdDate: child.createdDate,
                    dueDate: child.dueDate,
                    project: child.project,
                    showDatePicker: child.showDatePicker,
                    title: child.title,
                    user_id: child.user_id
                };

                var updates = {};

                updates['/todos/' + child.$id] = childData;

                firebase.database().ref().update(updates);

                vm.childTodos.$remove(child);
            };


            /*vm.convertToChild = function (todo, index, prevTodo) {

                if (index != 0) {
                    var todo = todo;
                    var todoData = {
                        complete: todo.complete,
                        createdDate: todo.createdDate,
                        dueDate: todo.dueDate,
                        parentId: prevTodo.$id,
                        project: todo.project,
                        showDatePicker: todo.showDatePicker,
                        title: todo.title,
                        user_id: todo.user_id
                    };

                    var childKey = firebase.database().ref('/childTodos').push().key;

                    var updates = {};

                    updates['/childTodos/' + childKey] = todoData;

                    firebase.database().ref().update(updates);

                    var childrenRef = firebase.database().ref('/childTodos').orderByChild('parentId').equalTo(todo.$id);
                    var children = $firebaseArray(childrenRef);
                    console.log('children: ', children);

                    for (var i = 0; i < children.length; i++) {
                        console.log('child: ', children[i]);
                        console.log('childId: ', children[i].parentId);
                        console.log('prevTodo: ', prevTodo.$id);
                        children[i].parentId = prevTodo.$id;
                        children.$save(i);
                    };

                    angular.forEach(children, function(value, key) {

                    })

                    //vm.todos.$remove(todo);
                }
            };*/

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