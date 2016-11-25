angular.module(window.ProjectName).directive("bar", function ($timeout, $rootScope, CONFIG) {
    var directive = {
        restrict: 'AE',
        scope: true,
        //replace: true,
        template: '<div class="echarts-bar" style="height:100%;"></div>',
        link: function (scope, element, attrs) {
            var option = {
                title: {
                    text: 'IOS&ANDROID',
                    x: 'center',
                    textStyle: {
                        fontSize: 14,
                        color: "rgb(51, 51, 51)"
                    },
                    borderColor: "#ccc",
                    padding: 20
                },
                tooltip: {
                    trigger: 'axis',
                    axisLabel: {
                        formatter: '{value}'
                    }
                },
                legend: {
                    x: 'center',
                    y: 'bottom',
                    padding: 10,
                    data: ['IOS', 'ANDROIDAND']
                },
                toolbox: {
                    show: true,
                    padding: 30,
                    feature: {
                        saveAsImage: {
                            show: true
                        }
                    }
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0
                    },
                    splitLine: {
                        show: true
                    },
                    data: []
                }],
                yAxis: [{
                    type: 'value',
                    name: '',
                    nameLocation: 'end',
                    splitLine: {
                        show: true
                    },
                    splitArea: {
                        show: true
                    },
                    axisLabel: {
                        formatter: '{value}'
                    }
                }],
                series: [{
                    name: '',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'inside'
                            }
                        }
                    },
                    data: []
                }, {
                    name: '',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'inside'
                            }
                        }
                    },
                    data: []
                }],
                color: CONFIG.chartsColors
            };
            scope.$watch(attrs.bar, function (newValue, oldValue) {
                if (!!newValue) {
                    // 柱状图默认展现数字, 固定展现柱状图宽度为100
                    if (!!newValue.xAxis) {
                        option.xAxis[0].data = newValue.xAxis;
                        option.xAxis[0].splitLine.show = false;
                        option.yAxis[0].splitLine.show = false;
                        option.yAxis[0].splitArea.show = false;
                        option.color = CONFIG.chartsColors;
                        angular.forEach(newValue.series, function (v, k) {
                            v.itemStyle = {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            fontSize: 10
                                        },
                                        formatter: function (_args) {
                                            var num = _args.value;
                                            num = num === '-' ? 0 : (newValue.suffix === '%') ? (num * 100).toFixed(2) + newValue.suffix : CONFIG.transferKbit(num);
                                            if (!!/\.\d{3,}/.test(num.toString())) {
                                                num = parseFloat(num).toFixed(2);
                                            }
                                            return num;
                                        }
                                    }
                                }
                            };
                        });
                    } else {
                        angular.forEach(newValue.series, function (v, k) {
                            v.itemStyle = {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'inside',
                                        textStyle: {
                                            fontSize: 16
                                        },
                                        formatter: function (_args) {
                                            var num = _args.value;
                                            num = num === '-' ? 0 : (newValue.suffix === '%') ? (num * 100).toFixed(2) + newValue.suffix : CONFIG.transferKbit(num);
                                            if (!!/\.\d{3,}/.test(num.toString())) {
                                                num = parseFloat(num).toFixed(2);
                                            }
                                            return num;
                                        }
                                    }
                                }
                            };
                            v.barWidth = 60;
                        });
                    }
                    option.legend.data = newValue.legend;
                    option.title.text = newValue.title;
                    option.series = newValue.series;
                    if (newValue.suffix === '%') {
                        option.yAxis[0].axisLabel.formatter = function (parm) {
                            return parseInt(parm * 100) + '%';
                        }
                        option.tooltip.formatter = function (param) {
                            var _ret = [];
                            angular.forEach(param, function (o, i) {
                                o.value = o.value == '-' ? 0 : o.value;
                                _ret.push(o.seriesName + ': ' + (o.value * 100).toFixed(2) + '%');
                            });
                            return _ret.join('</br>');
                        };
                    } else {
                        option.yAxis[0].axisLabel.formatter = function (parm) {
                            return CONFIG.transferKbit(parm);
                        }
                        option.tooltip.formatter = function (param) {
                            var _ret = [];
                            angular.forEach(param, function (o, i) {
                                o.value = o.value == '-' ? 0 : /\.\d{4,}/.test(o.value.toString()) ? o.value.toFixed(2) : o.value;
                                _ret.push(o.seriesName + ': ' + CONFIG.transferKbit(o.value));
                            });
                            return _ret.join('</br>');
                        }
                    }
                    if (!!element.hasClass('busy')) {
                        if (!$rootScope.lazyLoadList) {
                            $rootScope.lazyLoadList = [];
                        }
                        return $rootScope.lazyLoadList.push({
                            element: element,
                            top: $(element).offset().top,
                            back: function () {
                                var chart = echarts.init(element[0]);
                                chart.setOption(option);
                            }
                        });
                    }
                    var chart = echarts.init(element[0]);
                    chart.setOption(option);
                }
            });
        }
    };
    return directive;
});
