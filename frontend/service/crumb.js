angular.module("crumb", ['ngRoute'], function($provide, $compileProvider) {
    //添加生成html标签的指令
    $compileProvider.directive('compile', function($compile) {
      // directive factory creates a link function
      return function(scope, element, attrs) {
        scope.$watch(
          function(scope) {
            return scope.$eval(attrs.compile);
          },
          function(value) {
            element.html(value);
            $compile(element.contents())(scope);
          }
        );
      };
    });
    $provide.factory('crumbService', function ($rootScope) {
      return {
        setCrumb: function(url) {
            //$rootScope.getCrumb = url;
        }
      };
    });
});
