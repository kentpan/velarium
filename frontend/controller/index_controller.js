/**
 * @file index_controller the file
 */
'use strict';
angular.module(window.ProjectName).controller('index_controller',
    function ($rootScope, $scope, $state, $log, $stateParams, $timeout, CONFIG, fetchService) {
        var api = CONFIG.api[$state.current.name];
    });
