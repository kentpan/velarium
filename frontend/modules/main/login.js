var mba = angular.module('MBA', []);
/**
 * Login Controller
 */

mba.controller('LoginCtrl', function ($rootScope, $scope) {
    $scope.year = new Date().getFullYear();
    var path = location.pathname.match(/^.*\//);
    // $scope.uuap_callback_url = "http://" + location.host + path + 'run.html#/index';
    $scope.uuap_callback_url = "http://" + location.host + '/searchboxbi/api/login';
    $scope.goRun = function ($event) {
        if (!!/(kent|tianbin|qiuzhiqun|luoaihua)\.baidu\.com/i.test(location.host)) {
            $event.preventDefault();
            $event.stopPropagation();
            location.replace('./run.html#/index');
        }
    };
});
