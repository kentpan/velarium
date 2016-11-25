'@file: route.config';
'use strict';
var route_module = angular.module(window.ProjectName);
route_module.factory('permissionService', function ($q, $rootScope, CONFIG) {
    return {
        // 将权限缓存到 Session，以避免后续请求不停的访问服务器
        permissionModel: {
            permission: null,
            isPermissionLoaded: false
        },
        permissionCheck: function (state, id) {
            id = id || null;
            var permissions = this.parsePermission(CONFIG.USERINFOS.permission, id);
            var permission = this.getPermission.call(this, permissions, state);
            return permission;
        },
        getRoutePermission: function (item) {
            var comm = CONFIG.api.common;
            var api = CONFIG.api[item];
            if (!!comm) {
                api = angular.extend(api, comm);
            }
            if (!api) {
                return [];
            }
            var miss = [];
            angular.forEach(api, function (val, key) {
                miss.push(key);
            });
            return miss;
        },
        parsePermission: function (permissions, aid) {
            var pms = [];
            if (angular.isArray(permissions)) {
                pms = permissions;
            } else if (angular.isObject(permissions)) {
                if (!!aid) {
                    pms = permissions[aid] || [];
                    pms = pms.concat(permissions[0]);
                } else {
                    angular.forEach(permissions, function (k, v) {
                        pms = pms.concat(k);
                    });
                }
            }
            return pms;
        },
        getPermission: function (permissions, state) {
            var ifPermissionPassed = false;
            var roles = (!!state && !!angular.isArray(state.permission)) ? state.permission : !!angular.isString(state) ? [state] : this.getRoutePermission(state.name);
            angular.forEach(roles, function (role) {
                if (role === 'all') {
                    return ifPermissionPassed = true;
                }
                if ($.inArray(role, permissions) > -1 || (!!permissions[0] && permissions[0].toLowerCase() === 'all')) {
                    return ifPermissionPassed = true;
                }
            });
            !this.permissionModel.permission && (this.permissionModel.permission = permissions);
            return ifPermissionPassed;
        }
    };
}).factory('interceptorService', ['$q', '$rootScope', 'CONFIG', function ($q, $rootScope, CONFIG) {
    window.feDebuger = window.feDebuger || {};
    console.log('可在控制台输入feDebuger查看所有接口数据!!!');
    return {
        request: function (config) {
            var deferred = $q.defer();
            config.headers['X-Requested-With'] = 'xmlhttprequest';
            if (!!CONFIG.noCache) {
                if (config.method === 'GET') {
                    if (!config.params) {
                        config.params = {};
                    }
                    config.params._v = CONFIG.version;
                }
                if (config.method === 'POST') {
                    if (!config.data) {
                        config.data = {};
                    }
                    config.data._v = CONFIG.version;
                }
            }
            !!CONFIG.debuger && console.log('request:', config);
            return config || deferred.promise;
        },
        // success -> don't intercept
        response: function (response) {
            // !!CONFIG.debuger && console.log('response:', response);
            !!CONFIG.debuger && console.log('response:', response, response.status);
            if ((response.data.errno - 0) === 20100 || (response.status - 0 === 302) || response.status - 0 === -1) {
                return $rootScope.poplayer = {
                    type: 'error',
                    content: '请重新登录',
                    redirect: CONFIG.tmpl.login
                };
            }
            // 添加统一的全局变量, 可以直接在浏览器控制台输入feDebuger[当前路由名称]查看当前页面的所有接口返回数据
            var apiUrl = response.config.url;
            var isApi = /\/([a-z0-9A-Z_]+)$/.test(apiUrl);
            if (!!isApi) {
                var route = $rootScope.$state.current.name;
                if (!window.feDebuger[route]) {
                    window.feDebuger[route] = {};
                }
                window.feDebuger[route][apiUrl] = response.data;
            }
            return response || $q.when(response);
        },
        responseError: function (response) {
            !!CONFIG.debuger && console.log('responseError:', response);
            if (response.status - 0 === -1 || response.status - 0 === 302) {
                // var deferred = $q.deferered();
                return $rootScope.poplayer = {
                    type: 'error',
                    content: '请重新登录',
                    redirect: CONFIG.tmpl.login
                };
                // $rootScope.$broadcast('event:loginRequired');
            }
            return response;
            // return deferred.promise;
        }
        /*,
         requestError: function (rejection) {
         console.log('requestError:' , rejection);
         return rejection;
         },
         responseError: function (response) {
         console.log('responseError:' , response);
         // return location.replace(apiService.tmpl.homepage);
         if (response.status === -1) {
         // var deferred = $q.deferered();
         $rootScope.poplayer = {
         type: 'error',
         content: '系统异常, 请联系系统管理员'
         };
         // $rootScope.$broadcast('event:loginRequired');
         }
         return response;
         // return deferred.promise;
         }*/
    };
    //   });
}]).config(['$httpProvider', '$provide', '$stateProvider', '$urlRouterProvider', 'CONFIG',
    function ($httpProvider, $provide, $stateProvider, $urlRouterProvider, CONFIG) {
        // 添加$http公共拦截器
        $httpProvider.interceptors.push('interceptorService');
        var common = {
            name: 'common',
            url: '',
            abstract: true,
            resolve: {
                deps: ['$rootScope', '$ocLazyLoad', function ($rootScope, $ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'controller/header_controller.js',
                        'controller/sidebar_controller.js'
                    ]);
                }]
            },
            views: {
                'headerContainer@': {
                    templateUrl: CONFIG.webRoot + 'views/header.html',
                    controller: 'header_controller'
                },
                'sidebarContainer@': {
                    templateUrl: CONFIG.webRoot + 'views/sidebar.html',
                    controller: 'sidebar_controller'
                }
            }
        };
        var index = {
            name: 'index',
            url: '/index',
            parent: common,
            resolve: {
                deps: ['$rootScope', '$ocLazyLoad', function ($rootScope, $ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'theme/default/css/index.css',
                        'controller/index_controller.js'
                    ]);
                }]
            },
            views: {
                'mainContainer@': {
                    templateUrl: CONFIG.webRoot + 'views/index.html',
                    controller: 'index_controller'
                }
            }
        };
        var monitor = {
            name: 'monitor',
            url: '/monitor',
            parent: common,
            resolve: {
                deps: ['$rootScope', '$ocLazyLoad', function ($rootScope, $ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'theme/default/css/monitor.css',
                        'controller/monitor_controller.js',
                        'directives/ng-echarts.js',
                        'modules/common/monitor/jtopo-0.4.8-min.js',
                        'modules/common/monitor/monitor.js'
                    ]);
                }]
            },
            views: {
                'mainContainer@': {
                    templateUrl: CONFIG.webRoot + 'views/monitor.html',
                    controller: 'monitor_controller'
                }
            }
        };
        $urlRouterProvider
            .otherwise('/index');
        $stateProvider
            .state(common)
            .state(index)
            .state(monitor);
    }
]);
