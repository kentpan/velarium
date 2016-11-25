/**
 * @file monitor_controller the file
 */
'use strict';
angular.module(window.ProjectName).controller('monitor_controller',
    function ($rootScope, $scope, $state, $log, $stateParams, $timeout, CONFIG, fetchService) {
        var api = CONFIG.api[$state.current.name];
        $scope.monitor = {};
        $scope.monitor.canvasConf = {
            container: 'monitorContainer',
            canvas: 'monitor-scene',
            mode: 'edit', //normal, edit
            bg: '', // CONFIG.webRoot + 'modules/common/monitor/img/bg.jpg',
            load: {
                url: api.load,
                data: {}
            }
        };
        $scope.monitor.renderToMonitor = function (data) {
            return $timeout(function () {
                $scope.$parent.$broadcast('Monitor:echarts', data);
            },100);
        };
        $scope.monitor.echartsConfig = {
            callback: $scope.monitor.renderToMonitor,
            config: {
                theme:'default',
                event: [],
                dataLoaded: true
            },
            option: {
                title : {
                    text: '未来一周气温变化(5秒后自动轮询)',
                    subtext: '纯属虚构'
                },
                tooltip : {
                    trigger: 'axis'
                },
                legend: {
                    data:['最高气温','最低气温']
                },
                toolbox: {
                    show : true,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {show: true, type: ['line', 'bar']},
                        restore : {show: true},
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : ['周一','周二','周三','周四','周五','周六','周日']
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        axisLabel : {
                            formatter: '{value} °C'
                        }
                    }
                ],
                series : [
                    {
                        name:'最高气温',
                        type:'line',
                        data:[11, 11, 15, 13, 12, 13, 10],
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大值'},
                                {type : 'min', name: '最小值'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name: '平均值'}
                            ]
                        }
                    },
                    {
                        name:'最低气温',
                        type:'line',
                        data:[1, -2, 2, 5, 3, 2, 0],
                        markPoint : {
                            data : [
                                {name : '周最低', value : -2, xAxis: 1, yAxis: -1.5}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name : '平均值'}
                            ]
                        }
                    }
                ]
            }
        };
        $scope.monitor.addNode = function () {
         //   $timeout(function () {
                $scope.monitor.echartsConfig.option.title.text = '哈哈哈哈';
              //  $scope.$parent.$broadcast('Monitor:renewEcharts');

        //    })
           // return $scope.$parent.$broadcast('Monitor:echarts');
        };
        $scope.monitor.save = function () {
            return $scope.$parent.$broadcast('Monitor:save');
        };
        // $scope.$parent.$broadcast('canvas:setBg');
    });
