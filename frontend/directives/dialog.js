angular.module(window.ProjectName).directive("dialog", ['$compile', function ($compile) {
    var directive = {
        restrict: 'AE',
        scope: true,
        // replace: true,
        // transclude:true,
        templateUrl: './frontend/views/dialog/filter.html',
                        //  './frontend/modules/common/select/select.js',
        link: function (scope, element, attrs) {
            
        }
    };
    return directive;
}]);
