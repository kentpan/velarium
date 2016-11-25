/**
 * @file header_controller the file
 */
"use strict"
angular.module(window.ProjectName).controller('header_controller', function ($rootScope, $scope, $state, CONFIG) {
    $scope.username = CONFIG.USERINFOS.uname;
    var from   = 'http://' + location.host + location.pathname.replace(/[^\/]+\.html/i, 'index.html');//'/frontend/loginSuccess.html';
    $scope.login    = from;
});