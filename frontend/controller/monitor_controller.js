/**
 * @file monitor_controller the file
 */
'use strict';
angular.module(window.ProjectName).controller('monitor_controller',
    function ($rootScope, $scope, $state, $log, $stateParams, $timeout, $interval, CONFIG, fetchService) {
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
        $scope.monitor.EchartsList = [];
        $scope.monitor.barChartConfig = {
            option: {
                title: {
                    text: '动态数据',
                    subtext: '纯属虚构'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data:['最新成交价', '预购队列']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {readOnly: false},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                dataZoom: {
                    show: false,
                    start: 0,
                    end: 100
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: true,
                        data: (function (){
                            var now = new Date();
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                                now = new Date(now - 2000);
                            }
                            return res;
                        })()
                    },
                    {
                        type: 'category',
                        boundaryGap: true,
                        data: (function (){
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.push(len + 1);
                            }
                            return res;
                        })()
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        scale: true,
                        name: '价格',
                        max: 30,
                        min: 0,
                        boundaryGap: [0.2, 0.2]
                    },
                    {
                        type: 'value',
                        scale: true,
                        name: '预购量',
                        max: 1200,
                        min: 0,
                        boundaryGap: [0.2, 0.2]
                    }
                ],
                series: [
                    {
                        name:'预购队列',
                        type:'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data:(function (){
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.push(Math.round(Math.random() * 1000));
                            }
                            return res;
                        })()
                    },
                    {
                        name:'最新成交价',
                        type:'line',
                        data:(function (){
                            var res = [];
                            var len = 0;
                            while (len < 10) {
                                res.push((Math.random()*10 + 5).toFixed(1) - 0);
                                len++;
                            }
                            return res;
                        })()
                    }
                ]
            }
        };
        $scope.monitor.lineChartConfig = {
            command: function (oChart) {
                !this._count && (this._count = 11);
                !this._id && (this._id = 'eChart_' + Math.floor(Math.random()*100000 + 1));
                oChart.id = this._id;
                oChart.echartType = 'line';
                this.config.position = this._echartsCache ? {width: this._echartsCache.width, height: this._echartsCache.height} : oChart.CONFIG.config.position;

                $scope.$parent.$broadcast('Monitor:rtEcharts', oChart);
               // return $scope.monitor.renderToMonitor
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
        var EchartsFactory = {
            bar: {
                command: function (oChart) {
                    var _this = this;
                    var opt = this._echartsCache ? this._echartsCache.option : _this.option;
                    !this._count && (this._count = 11);
                   // !this._id && (this._id = 'eChart_bar_' + Math.floor(Math.random()*100000 + 1));
                    oChart.id = this._id;
                    oChart.echartType = 'bar';
                    this.config.position = this._echartsCache ? {width: this._echartsCache.width, height: this._echartsCache.height} : oChart.CONFIG.config.position;
                    !this._fn && (this._fn = function () {
                        function setLooper() {
                            $timeout.cancel(_this._inter);
                            var axisData = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
                            var data0 = opt.series[0].data;
                            var data1 = opt.series[1].data;
                            data0.shift();
                            data0.push(Math.round(Math.random() * 1000));
                            data1.shift();
                            data1.push((Math.random() * 10 + 5).toFixed(1) - 0);
                            opt.xAxis[0].data.shift();
                            opt.xAxis[0].data.push(axisData);
                            opt.xAxis[1].data.shift();
                            opt.xAxis[1].data.push(_this._count++);
                            oChart.setOption(opt);
                            oChart.resize(oChart.CONFIG.config.position);
                           // $scope.$parent.$broadcast('Monitor:echarts', oChart);
                            $scope.$parent.$broadcast('Monitor:rtEcharts', oChart);
                            _this._inter = $timeout(setLooper, CONFIG.realTime);
                        }
                        _this._inter = $timeout(setLooper, CONFIG.realTime);
                    });
                    !!this.config.rtopen ? this._fn() : function () {
                        $timeout.cancel(_this._inter);
                        oChart.resize(oChart.CONFIG.config.position);
                    }();
                    $scope.$parent.$broadcast('Monitor:rtEcharts', oChart);
                },
                option: $scope.monitor.barChartConfig
            },
            line: {
                option:$scope.monitor.lineChartConfig
            }
        };
        $scope.monitor.addEcharts = function (type, data) {
            var echart = (function () {
                if (!EchartsFactory[type]) {
                    return null;
                }
                var oType = EchartsFactory[type];
                var node = angular.copy(oType.option);
                node._id = (!!data && data.ecid) ? data.ecid : 'eChart_' + type + '_' + Math.floor(Math.random()*100000 + 1);
                if (!node.config) {
                    node.config = {
                        position: {
                            width: 400,
                            height: 260
                        },
                        theme:'default',
                        event: [],
                        dataLoaded: true
                    };
                }
                if (!node.command) {
                    node.command = oType.command;
                }
                if (!!data) {
                    node._echartsCache = data;
                    node._echartsCache.option.title.subtext = '实打实滴';
                    node.config.position = {
                        width: data.width || 400,
                        height: data.height || 260
                    };
                    node.config.offset = {
                        x: data.x || 0,
                        y: data.y || 0
                    };
                    node.config.rtopen = data.rtopen;
                    node.config.rtapi = data.rtapi;
                }
                return {
                    data: node
                }
            })();
            !!echart && $scope.monitor.EchartsList.push(echart);
        };
        $scope.monitor.save = function () {
            return $scope.$parent.$broadcast('Monitor:save');
        };
        // $scope.$parent.$broadcast('canvas:setBg');
    });
