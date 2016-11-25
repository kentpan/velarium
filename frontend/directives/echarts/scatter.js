angular.module(window.ProjectName).directive("scatter", function($timeout) {
    var directive = {
         restrict: 'AE',
         scope: true,
         replace: true,
         template: '<div style="height:{{scatter.height}}px;width:50%;float:{{scatter.float}};"></div>',
         link: function($scope, element, attrs, controller) {
           var option = $scope.scatter.data;
           console.log(option);
            $timeout(function() {
               var chart = echarts.init(element[0]);
               chart.setOption(option);
            }, $scope.scatter.delay);
         }
       };
    return directive;
});
