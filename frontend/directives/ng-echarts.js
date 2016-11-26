/**
 * Created by liekkas.zeng on 2015/1/7.
 */
angular.module(window.ProjectName).directive('echarts', function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                var runOnce = false;
                var refreshChart = function (val) {
                    if (!!runOnce) {
                        return;
                    }
                    runOnce = true;
                    var config = scope.CONFIG.config;
                    var option = scope.CONFIG.option;
                    var cache  = scope.CONFIG._echartsCache;
                    var theme = (config && config.theme) ? config.theme : 'default';
                    var chart = echarts.init(element[0], theme, (config.position || {}));
                    (config && !config.dataLoaded) && chart.showLoading();
                    if (config && !!config.dataLoaded) {
                        chart.setOption(option);
                        if (!!config.position) {
                            chart.resize(config.position);
                        } else {
                            chart.resize();
                        }
                        chart.hideLoading();
                        !!scope.CONFIG.command && $timeout(function () {
                            chart.CONFIG = scope.CONFIG;
                            runOnce = false;
                            return scope.CONFIG.command(chart);
                        });
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
                scope.$watch('CONFIG.position', refreshChart, true);
                scope.$watch('CONFIG.config', refreshChart, true);
               // scope.$on('Monitor:renewEcharts', refreshChart);
            },
            scope: {
                CONFIG: '=ecConfig'
            },
            restrict: 'EA'
        }
    });

