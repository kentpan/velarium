/**
 * @file sidebar_controller the file
 */
"use strict"
angular.module(window.ProjectName).controller('sidebar_controller', function($rootScope, $scope, $state, CONFIG) {
	var api = CONFIG.api[$state.current.name];
	$scope.items = [{
		country: '菜单',
		active: true,
		subs: [{
			name: '首页',
			url: '#/index',
			active: true
		}, {
			name: '实时监控',
			url: '#/monitor',
			active: false
		}]
	}];
	$scope.showStates = function(item) {
		item.active = !item.active;
	};
	$scope.setActive = function (item) {
		if (typeof item === 'object') {
			item = item.url;
		}
		angular.forEach($scope.items, function (o, i) {
			angular.forEach(o.subs, function (v, k) {
				v.active = (item.replace(/#|\//g,'') === v.url.replace(/#|\//g,''));
			});
		});
	};
	$scope.setActive($state.current.url);
});