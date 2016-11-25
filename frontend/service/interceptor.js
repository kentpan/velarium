//angular.module("auncelAdmin", ["auncelAdmin.permission"]).factory('interceptorService', function ($rootScope, $q, permissionService) {
//angular.module("auncelAdmin.interceptor", function($provide) {
//    $provide.factory('interceptorService', function ($rootScope, $q) {
angular.module("auncelAdmin.interceptor", []).factory('interceptorService', function ($rootScope, $q, $cookieStore, CONFIG, permissionService) {
    return {
        request: function(config) {
            config.headers['X-Requested-With'] = 'xmlhttprequest';
            console.log('request:' , config);
            return config || $q.when(config);
        }/*,
        requestError: function(rejection) {
             console.log('requestError:' , rejection);
            return rejection;
        },
        //success -> don't intercept
        response: function(response) {
             console.log('response:' , response);
            return  response || $q.when(response);
        },
        responseError: function(response) {
            console.log('responseError:' , response);
            //return location.replace(apiService.tmpl.homepage);
            if (response.status === -1) {
                var deferred = $q.defer(),
                        req = {
                            config: response.config,
                            deferred: deferred
                        };
                //$rootScope.requests401.push(req);
                $rootScope.$broadcast('event:loginRequired');
                return deferred.promise;
            }
            return $q.reject(response);
        }*/

    };
 //   });
});
/*
var interceptor = function($q, $rootScope) {
        return {
            request: function(config) {
                config.headers['X-Requested-With'] = 'xmlhttprequest';
                console.log('request:' , config);
                return config || $q.when(config);
            },
            requestError: function(rejection) {
                 console.log('requestError:' , rejection);
                return rejection;
            },
            //success -> don't intercept
            response: function(response) {
                 console.log('response:' , response);
                return  response || $q.when(response);
            },
            responseError: function(response) {
                console.log('responseError:' , response);
                //return location.replace(apiService.tmpl.homepage);
                if (response.status === -1) {
                    var deferred = $q.defer(),
                            req = {
                                config: response.config,
                                deferred: deferred
                            };
                    //$rootScope.requests401.push(req);
                    $rootScope.$broadcast('event:loginRequired');
                    return deferred.promise;
                }
                return $q.reject(response);
            }
        };
    };*/