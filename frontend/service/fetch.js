angular.module(window.ProjectName).factory('fetchService', function ($http, $q, $rootScope, CONFIG) {
    return {
        get: function(params) {
            if(!params) return {};
            var promises = [];
            angular.forEach(params, function(param) {
                if(!param.url) return;
                var _url = param.url;
                if (typeof _url === 'string' && !!CONFIG.getApi) {
                    _url = CONFIG.getApi(_url);
                }
                if (!!CONFIG.noCache && param.data && !param.data._v) {
                    param.data._v = CONFIG.version;
                }
                var _data = (!!param.method && param.method.toLowerCase()) === 'post' ? {
                    url: _url,
                    method: param.method || 'GET',
                    data: param.data || {}
                } : {
                    url: _url,
                    method: param.method || 'GET',
                    params: param.data || {}
                };
                var promise = $http(_data);
                promises.push(promise);
            });
            return $q.all(promises);
        }
    };
});
