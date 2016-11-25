/**
 * Created by liekkas.zeng on 2015/1/7.
 */
angular.module(window.ProjectName).directive('echarts', function ($rootScope) {
        return {
            link: function (scope, element, attrs) {
                var refreshChart = function (val) {
                    console.log(val);
                    var config = scope.CONFIG.config;
                    var option = scope.CONFIG.option;
                    var theme = (config && config.theme) ? config.theme : 'default';
                    var chart = echarts.init(element[0], theme);
                    (config && !config.dataLoaded) && chart.showLoading();
                    if (config && !!config.dataLoaded) {
                        chart.setOption(option, false, false);
                        chart.resize();
                        chart.hideLoading();
                        !!scope.CONFIG.callback && scope.CONFIG.callback(chart);
                    }
                    if (config && config.event) {
                        if (angular.isArray(config.event)) {
                            angular.forEach(config.event, function (value, key) {
                                for (var e in value) {
                                    chart.on(e, value[e]);
                                }
                            });
                        }
                    }
                    return this;
                };
                //自定义参数 - config
                // event 定义事件
                // theme 主题名称
                // dataLoaded 数据是否加载
                scope.$watch('CONFIG', refreshChart, true);
               // scope.$on('Monitor:renewEcharts', refreshChart);
            },
            scope: {
                CONFIG: '=ecConfig'
            },
            restrict: 'EA'
        }
    });

