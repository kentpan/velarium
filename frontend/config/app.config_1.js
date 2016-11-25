'@file: app.config';
'use strict';
var isLocal = !!(/((kent|tianbin|liuyaqian)\.baidu\.com|\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3})/i
    .test(location.hostname));
(function () {
    var html = $('html');
    var api = isLocal ? './frontend/api/permission.json' : '/searchboxbi/api/login';
    var ajax = $.ajax({
        url: api,
        headers: {
            'X-Requested-With': 'xmlhttprequest'
        },
        data: {
            _v: window.ProjectVersion
        },
        dataType: 'json'
    });
    ajax.always(function (ret) {
        if ((ret.errorCode - 0) === 0 || (ret.errorno - 0) === 0) {
            window.USERINFOS = {
                user: ret.userName || ret.uname || 'user01',
                permission: ['all']
            };
            $.getScript('./frontend/modules/common/loading/loading.js', function () {
                angular.bootstrap(html[0], [ProjectName]);
            });
        } else {
            // alert('请先登录!!');
            var path = location.pathname.match(/^.*\//);
            // var uuap_callback_url = "http://" + location.host + path + 'run.html#/index';
            //return location.href = (ret.redirect || 'https://uuap.baidu.com/login?service=' + uuap_callback_url);
           // return location.replace((ret.redirect || 'http://' + location.host + '/searchboxbi/api/login'));
        }
    });
})();
angular.module(window.ProjectName, ['ngRoute', 'ui.router', 'ngCookies', 'oc.lazyLoad']).constant('CONFIG', {
    debuger: false, // 是否开启debugger模式
    noCache: true,
    ROOT: './frontend/',
    chartsColors: ['#1AC060', '#009EF5', '#BACF00', '#008A77', '#32CBF6', '#FEE14B'],
    getApi: function (online) {
        var uri = online.match(/[^\/]+$/);
        if (!!uri.length && online.indexOf('/api/api_') === -1) {
            uri = this.ROOT + 'api/api_' + uri[0] + '.json';
        } else {
            uri = online;
        }
        return isLocal ? uri : online;
    },
    transferKbit: function (num) {
        var output = num.toString();
        if (!!/^\d{4,}$/.test(output)) {
            output = output.replace(/(\d{1,2})(?=(\d{3})+\b)/g, '$1,');
        }
        return output;
    },
    setRepeat: function (arr, row, col) {
        var value = '',
            last = '',
            index = 1;
        for (var i = row; i < arr.length; i++) {
            value = arr[i][col].txt;
            if (last === value) {
                arr[i][col].display = 'none';
                if (typeof arr[i - index][col].rowSpan === 'undefined') {
                    arr[i - index][col].rowSpan = 1;
                }
                arr[i - index][col].rowSpan = arr[i - index][col].rowSpan + 1;
                index++;
            } else {
                last = value;
                index = 1;
            }
        }
        return arr;
    },
    tmpl: {
        homepage: '/',
        index: '/',
        login: 'http://' + location.host + '/searchboxbi/api/login'
    },
    api: {
        common: {},
        index: {
            mainChart: '/searchboxbi/wholeTrend/mainChart',
            TopData: '/searchboxbi/rest/overview/TopData',
            mainFilter: '/searchboxbi/wholeTrend/mainFilter',
            YesterdayData: '/searchboxbi/rest/overview/YesterdayData'
        }
    }
}).run(function ($rootScope, $ocLazyLoad, $state, CONFIG) {
    CONFIG.USERINFOS = window.USERINFOS;
    delete window.USERINFOS;
    $rootScope.poplayer = {};
    if (!!CONFIG.noCache) {
        $ocLazyLoad.cacheList = {};
        $ocLazyLoad.__load = $ocLazyLoad.load;
        $ocLazyLoad.load = function (files) {
            var realFiles = angular.isArray(files) ? files.map(function(elem) {
                return elem.indexOf(CONFIG.ROOT) > -1 ? elem : CONFIG.ROOT + elem;
            }) : files.indexOf(CONFIG.ROOT) > -1 ? files : CONFIG.ROOT + files;

            return $ocLazyLoad.__load(realFiles, {
                cache: true,
                version: CONFIG.version
            });
        };
    }
    $ocLazyLoad.load([
        'modules/common/loading/loading.css',
        'service/fetch.js'
    ]);

    $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
        var current = toState.name === '' ? fromState : toState;
        var args = toState.name === '' ? fromParams : toParams;
        if (!$rootScope.commParams.pages) {
            $rootScope.commParams.pages = {};
        }
        if (toParams.page) {
            if (!$rootScope.commParams.pages[current.name] || fromState.name === '' || fromState.name === toState.name) {
                $rootScope.commParams.pages[current.name] = toParams.page;
            }
            toParams.page = $rootScope.commParams.pages[current.name] || 1;
        }
        $rootScope.poplayer = {
            type: 'loading'
        };
        $rootScope.transferParam = function (name) {
            // !!CONFIG.debuger && console.log($rootScope.commParams, toParams, fromParams);
            var params = angular.extend(toParams, fromParams);
            var pages = $rootScope.commParams.pages || {};
            $rootScope.commParams = {};
            $rootScope.commParams.pages = pages;
            if (!!name) {
                return $state.go(name, params);
            }
            return $state.go((toState.name || 'index'), params);
        };

        function autoBack() {
            var _url = fromState.name || 'index';
            return $state.go(_url, fromParams);
        }

        !!CONFIG.debuger && console.log(CONFIG.USERINFOS.permission, $rootScope.commParams, toParams, fromParams);
    });
    $rootScope.$on('$stateChangeSuccess', function (evt, toState, toParams, fromState, fromParams) {
        $rootScope.params = toParams;
        $rootScope.poplayer.type === 'loading' && ($rootScope.poplayer.type = '');
    });
    // 系统全局参数
    $rootScope.$state = $state;
    $rootScope.commParams = {};
    /*$rootScope.checkPermission = function (key, aid) {
        aid = aid || $rootScope.params.aid;
        return permissionService.permissionCheck(key, aid);
    };*/
});
