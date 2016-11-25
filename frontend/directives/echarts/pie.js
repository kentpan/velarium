angular.module(window.ProjectName).directive("pie", function ($timeout, $rootScope, CONFIG) {
    var directive = {
        restrict: 'AE',
        scope: true,
        //replace: true,
        template: '<div class="echarts-pie" style="height:100%;"></div>',
        link: function (scope, element, attrs) {
            var option = {
                title: {
                    text: 'IOS&Android',
                    x: 'center',
                    textStyle: {
                        fontSize: 14,
                        color: "rgb(51, 51, 51)"
                    },
                    borderColor: "#ccc",
                },
                //tooltip: {trigger: 'item', formatter: '{b} : {c} ({d}%)'},
                tooltip: {
                    trigger: 'item',
                    formatter: function (val) {
                        return val.name + ': ' + CONFIG.transferKbit(val.value) + ' (' + val.percent.toFixed(1) + '%)';
                    }
                },
                // legendData : ['版本01', '版本02']
                legend: {
                    show: false,
                    x: 'center',
                    y: 'bottom',
                    y2: 200,
                    x2: -200,
                    data: ['IOS', 'ANDROIDAND']
                },
                calculable: true,
                toolbox: {
                    show: true,
                    feature: {
                        saveAsImage: {
                            show: true
                        }
                    }
                },
                // seriesData : [{value:50, name:'版本01'}, {value:50, name:'版本01'}]
                series: [{
                    name: '',
                    type: 'pie',
                    radius: [110, 180],
                    clockWise: false,
                    data: []
                }],
                color: CONFIG.chartsColors
                    //olor: ['#65b9f5', '#f49465', '#52c168', '#f1da3a', '#ec605f']
            };
            scope.$watch(attrs.pie, function (newValue, oldValue) {
                if (!!newValue) {
                    option.legend.data = newValue.legend;
                    option.title.text = newValue.title;
                    var newData = newValue.series;
                    for (var i = 0; i < newData.length; i++) {
                        for (var j = i + 1; j < newData.length; j++) {
                            if (newData[i].value > newData[j].value) {
                                var tmp = newData[i].value;
                                var tmpName = newData[i].name;
                                newData[i].value = newData[j].value;
                                newData[j].value = tmp;
                                newData[i].name = newData[j].name;
                                newData[j].name = tmpName;
                            }
                        }
                    }
                    option.series[0].data = newValue.series;
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
