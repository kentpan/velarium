'@file: loading';
angular.module(ProjectName)
    .directive('canvas', ['$rootScope', '$timeout', 'fetchService', 'CONFIG', function ($rootScope, $timeout, fetchService, CONFIG) {
        var directive = {
            restrict: 'A',
            // replace: true,
            scope: true,
            template: '\
                <canvas id="{{$parent.monitor.canvasConf.canvas}}"></canvas>\
                <div id="{{radarMonitor.tools}}">\
                    <ul id="monitor-nodeMenu" ng-show="radarMonitor.nodeMenu.status" style="left:{{radarMonitor.nodeMenu.x}};top:{{radarMonitor.nodeMenu.y}}">\
                        <li><a>取消</a></li>\
                        <li><a>添加连线</a></li>\
                        <li><a>复制节点</a></li>\
                        <li><a>删除节点</a></li>\
                        <!--<li id="level">\
                            <a>设置等级</a>\
                            <ul class="lili nav4">\
                                <li id="1"><span>壹</span></li>\
                                <li id="2"><span>贰</span></li>\
                                <li id="3"><span>弎</span></li>\
                                <li id="4"><span>肆</span></li>\
                                <li id="5"><span>伍</span></li>\
                                <li id="6"><span class = "nob">陆</span></li>\
                            </ul>\
                        </li>-->\
                        <li id="text">\
                            <a>设置文字位置</a>\
                            <ul class="lili nav5">\
                                <li id="Top_Center"><span>上</span></li>\
                                <li id="Bottom_Center"><span>下</span></li>\
                                <li id="Middle_Left"><span>左</span></li>\
                                <li id="Middle_Right"><span>右</span></li>\
                                <li id="Middle_Center"><span class="nob">中</span></li>\
                            </ul>\
                        </li>\
                        <li><a>顺时针旋转</a></li>\
                        <li><a>逆时针旋转</a></li>\
                        <li><a>警告</a></li>\
                    </ul>\
                    <ul id="monitor-linkMenu" ng-show="radarMonitor.linkMenu.status" style="left:{{radarMonitor.linkMenu.x}};top:{{radarMonitor.linkMenu.y}}">\
                        <li><a>取消</a></li>\
                        <li><a>删除连线</a></li>\
                        <li><a>改为红色</a></li>\
                        <li><a>改为默认颜色</a></li>\
                    </ul>\
                    <ul id="monitor-echartsMenu" ng-show="radarMonitor.echartsMenu.status" style="left:{{radarMonitor.echartsMenu.x}};top:{{radarMonitor.echartsMenu.y}}">\
                        <li><a>取消</a></li>\
                        <li><a>删除图表</a></li>\
                        <li><a>配置</a></li>\
                    </ul>\
                    <ul id="monitor-echartsConfigContainer" ng-show="radarMonitor.echartsConfig.status" style="left:{{radarMonitor.echartsConfig.x}};top:{{radarMonitor.echartsConfig.y}}">\
                        <li><span>开启实时监控：</span> <label><input type="checkbox" name="rtopen" ng-checked="MonitorController.getEchartsData.rtopen" ng-click="MonitorController.setEchartsRtopen($event)"></label></li>\
                        <li><span>配置数据接口：</span> <input type="text" name="rtapi" ng-model="MonitorController.getEchartsData.rtapi"></li>\
                        <li><span>配置数据接口：</span> </li>\
                        <li><span>配置数据接口：</span> </li>\
                        <li class="bottom"><button type="button" ng-click="MonitorController.saveConfig()">确定</button> <button type="button" ng-click="radarMonitor.setCancel()">取消</button></li>\
                    </ul>\
                </div>\
            ',
            controller: function ($scope) {
                this.canvas = $scope.$parent.monitor.canvasConf.canvas;
                this.tools = 'monitor-tools';
                this.editor = 'monitor-editor';
                this.alarmWording = 'Warning';
                this.Image = {
                    '1': 'cloud.png',
                    '2': '8000.png',
                    '3': 'ER16.png',
                    '4': '5200.png',
                    '5': '2948.png',
                    '6': 'serv.png',
                    '7': 'serve.png'
                };
                this.nodeMenu = {
                    status: false,
                    x: '0px',
                    y: '0px'
                };
                this.linkMenu = {
                    status: false,
                    x: '0px',
                    y: '0px'
                };
                this.echartsMenu = {
                    status: false,
                    x: '0px',
                    y: '0px'
                };
                this.echartsConfig = {
                    status: false,
                    x: '0px',
                    y: '0px'
                };
                this.setCancel = function () {
                    this.echartsConfig.status = false;
                };
              //  this.echartsConfig = angular.copy(this._echartsConfig);
            },
            controllerAs: 'radarMonitor',
            link: function ($scope, $element, $attrs, $ctrl) {
                var MonitorController = function () {
                    var win = $(window),
                        endNode,
                        currentNode,
                        tmpx,
                        tmpy,
                        validation,
                        pixel = 2, //调整清晰度, 1|2, 2有坐标bug
                        strr = '';
                    return {
                        init: function () {
                            var _this = this;
                            var conf = $scope.$eval($attrs.canvas);
                            this.config = conf;
                            $timeout(function () {
                                var rootDom = $('#' + (conf.root || 'monitorContainer'));
                                var canvas = document.getElementById($ctrl.canvas);
                                var w = rootDom.width();
                                var h = rootDom.height();
                                canvas.height = h * pixel;
                                canvas.width = w * pixel;
                                canvas.style.height = h + 'px';
                                canvas.style.width = w + 'px';
                                var scene = new JTopo.Scene();
                                scene.background = conf.bg || '';
                                var stage = new JTopo.Stage(canvas);
                                _this.Scene = scene;
                                _this.Stage = stage;
                                _this.config.x = rootDom.offset().left;
                                _this.config.y = rootDom.offset().top;
                                _this.load();
                                _this._initEvent();
                                _this.render();
                                conf.mode && (_this.Stage.mode = conf.mode);
                                _this.currentNode = currentNode;
                                console.log('scene:', _this.Scene, '\n', _this.Stage.width+'stage: ', _this.Stage);
                            }, 0);
                            return this;
                        },
                        _nodesCache: {},
                        load: function () {
                            var _this = this;
                            fetchService.get([this.config.load])
                                .then(function (ret) {
                                    var data = ret[0].data;
                                    angular.forEach(data, function (v, k) {
                                        switch (v.elementType) {
                                            case 'echart':
                                                _this._loadEcharts(v);
                                                break;
                                            case 'node':
                                                if (v.level <= 6) {
                                                    _this._createNode(v.x, v.y, v.text, ($ctrl.Image[v.level] || v.Image), v.textPosition, v.level, v.larm);
                                                }
                                                break;
                                            case 'link':
                                                var nodeA = _this.Scene.findElements(function (e) {
                                                    return e.id == v.nodeAid;
                                                });
                                                var nodeZ = _this.Scene.findElements(function (e) {
                                                    return e.id == v.nodeZid;
                                                });
                                                if (nodeA[0] && nodeZ[0]) {
                                                    _this._createLink(nodeA[0], nodeZ[0], v.text, v.fontColor);
                                                }
                                                break;
                                            default:
                                                break;

                                        }
                                    });
                                   // _this.autoFixed();
                                });
                        },
                        autoFixed: function () {
                            return this.Stage.centerAndZoom();
                        },
                        _loadEcharts: function (data) {
                            data.width = data.width/pixel;
                            data.height = data.height/pixel;
                            return $scope.$parent.monitor.addEcharts(data.echartType, data);
                        },
                        _realTimeEcharts: function (oEc) {
                          //  var _this = this;
                            var node;
                            var ecid = oEc.id;
                          //  var oImg = oEc.getDataURL();
                            var oImg = oEc.getRenderedCanvas({pixelRatio: pixel});
                            var oImgStr = oEc.getDataURL({pixelRatio: pixel});
                            if (!!this._nodesCache[ecid]) {
                                node = this._nodesCache[ecid];
                                node.setImage(oImg, true);
                                if (!node.Echarts) {
                                    node.Echarts = oEc;
                                }
                             //   node.elementType = 'echart';
                                node.Image = oImgStr;
                                if (oEc.CONFIG.config.position) {
                                    node.setSize(oEc.CONFIG.config.position.width * pixel, oEc.CONFIG.config.position.height * pixel);
                                  //  node.width = oEc.CONFIG.config.position.width;
                                   // node.height = oEc.CONFIG.config.position.height;
                                }
                            } else {
                                node = new JTopo.Node('');
                                node.serializedProperties.push('id');
                                node.serializedProperties.push('ecid');
                                node.serializedProperties.push('level');
                                node.serializedProperties.push('Echarts');
                                node.serializedProperties.push('echartType');
                                node.setLocation(0, 0);
                                node.id = ecid;
                                node.x = oEc.CONFIG.config.offset ? oEc.CONFIG.config.offset.x : 0;
                                node.y = oEc.CONFIG.config.offset ? oEc.CONFIG.config.offset.y : 0;
                                node.width = oEc.CONFIG.config.position.width * pixel;
                                node.height = oEc.CONFIG.config.position.height * pixel;
                                node.ecid = ecid;
                                node.rtopen = oEc.CONFIG.config.rtopen || 0;
                                node.rtapi = oEc.CONFIG.config.rtapi || '';
                                node.echartType = oEc.echartType;
                                node.option = oEc.CONFIG.option;
                                node.level = 1;
                                node.Echarts = oEc;
                                node.setImage(oImg, true);
                                node.elementType = 'echart';
                                node.Image = oImgStr;
                                node.textPosition = 'Middle_Center';
                                node.fontColor = '0, 0, 0';
                                this.Scene.add(node);
                                console.log(oEc);
                            }
                            this._nodesCache[ecid] = node;
                          //  oEc.dispose();
                            return node;
                        },
                        _NodehandlerMouseup: function (event, node) {
                            $ctrl.linkMenu.status = false;
                            $ctrl.echartsMenu.status = false;
                            currentNode = node;
                            tmpx = event.pageX - this.config.x + 30;
                            tmpy = event.pageY - this.config.y + 30;
                            $ctrl.nodeMenu.x = event.pageX - this.config.x + 10 + 'px';
                            $ctrl.nodeMenu.y = event.pageY - this.config.y + 10 + 'px';
                            $ctrl.nodeMenu.status = true;
                        },
                        _nodeHandlerClick: function (event, node) {
                            endNode = node;
                            if (null != currentNode && currentNode != endNode && validation === true) {
                                strr = "";
                                this._createLink(currentNode, endNode, strr);
                                currentNode = null;
                                validation = false; //验证是否在当前节点上右键点击了添加节点
                            }
                        },
                        _linkHandlerMouseup: function (event, link) {
                            currentNode = link;
                            $ctrl.nodeMenu.status = false;
                            $ctrl.echartsMenu.status = false;
                            $ctrl.linkMenu.x = event.pageX + 10 + 'px';
                            $ctrl.linkMenu.y = event.pageY - this.config.y + 10 + 'px';
                            $ctrl.linkMenu.status = true;
                        },
                        _createNode: function (x, y, str, img, textPosition, level, larm) {
                            var node = new JTopo.Node(str);
                            node.serializedProperties.push('id');
                            node.serializedProperties.push('level');
                            node.setLocation(x, y);
                            node.Image = '';
                            node.id = x * y;
                            node.level = level;
                            if (null != img) {
                                if (typeof img === 'string' && !/^data\:/i.test(img)) {
                                    node.setImage(CONFIG.webRoot + 'modules/common/monitor/img/' + img, true);
                                    node.Image = img;
                                } else {
                                    node.setImage(img, true);
                                    node.elementType = str;
                                    node.Image = arguments[arguments.length - 1];
                                }
                                node.Image = img;
                            }
                            if (!!larm && larm !== 'undefined') {
                                node.alarm = $ctrl.alarmWording;
                            }
                            node.textPosition = textPosition;
                            node.fontColor = '0, 0, 0';
                            this.Scene.add(node);
                            return node;
                        },
                        _createLink: function (node1, node2, str, color) {
                            var link = new JTopo.Link(node1, node2, str);
                            //node2.father = node1;
                            link.lineWidth = 3; //线宽
                            link.bundleOffset = 60;
                            link.bundleGap = 20;
                            link.textOffsetY = 3;
                            link.fontColor = color || '0, 200, 255';
                            link.strokeColor = color || '0, 200, 255';
                            this.Scene.add(link);
                            return link;
                        },
                        _createTextarea: function () {
                            var tid = $ctrl.editor;
                            var oTextarea = angular.element(tid);
                            if (oTextarea) {
                                oTextarea = document.createElement('textarea');
                                oTextarea.id = tid;
                                oTextarea.onblur = function () {
                                    this.monitorNode && (this.monitorNode.text = this.value);
                                    this.style.display = 'none';
                                };
                                document.body.appendChild(oTextarea);
                                this._oTextarea = oTextarea;
                            }
                            return oTextarea;
                        },
                        editElementValue: function (event, node) {
                            var oTextarea = this._createTextarea();
                            oTextarea.style.left = event.pageX - oTextarea.offsetWidth / 2 + 'px';
                            oTextarea.style.top = event.pageY + 5 + 'px';
                            oTextarea.style.zIndex = 0;
                            oTextarea.value = node.text;
                            oTextarea.style.display = 'block';
                            oTextarea.focus();
                            oTextarea.select();
                            node.text = '';
                            oTextarea.monitorNode = node;
                        },
                        render: function () {
                            return this.Stage.add(this.Scene);
                        },
                        remove: function () {
                            delete this._nodesCache[currentNode.id];
                            this.Scene.remove(currentNode);
                            currentNode = null;
                        },
                        clear: function () {
                            this._nodesCache = {};
                            return this.Stage.clear();
                        },
                        _toolsHandler: function (event) {
                            var dom = event.target || event.srcElement;
                            if (!currentNode) {
                                return;
                            }
                            var type = $(dom).text();
                            var action = null;
                            var oParent = $(dom).parents('li');
                            if (oParent.length === 2) {
                                type = oParent[1].id;
                                action = oParent[0].id;
                            }
                            switch (type) {
                                // monitor-nodeMenu
                                case '设置文字位置':
                                    return;
                                case '添加连线':
                                    validation = true;
                                    break;
                                case '复制节点':
                                    this._createNode(tmpx, tmpy, currentNode.text, currentNode.Image, 'Bottom_Center');
                                    break;
                                case '删除节点':
                                case '删除图表':
                                    this.Scene.remove(currentNode);
                                    currentNode = null;
                                    break;
                                case '顺时针旋转':
                                    currentNode.rotate += 0.5;
                                    break;
                                case '逆时针旋转':
                                    currentNode.rotate -= 0.5;
                                    break;
                                case '警告':
                                    currentNode.alarm = (currentNode.alarm == null) ? $ctrl.alarmWording : null;
                                    break;
                                case 'text':
                                    currentNode.textPosition = action;
                                    break;
                                case 'level':
                                    currentNode.level = action;
                                    break;
                                // monitor-linkMenu
                                case '删除连线':
                                    this.Scene.remove(currentNode);
                                    break;
                                case '改为红色':
                                    currentNode.strokeColor = '255, 0, 0';
                                    break;
                                case '改为默认颜色':
                                    currentNode.strokeColor = '0, 200, 255';
                                    break;
                                // monitor-echartsMenu
                                case '配置':
                                    return this._configEcharts(event);
                            }
                            $timeout(function () {
                                $ctrl.nodeMenu.status = false;
                                $ctrl.linkMenu.status = false;
                                $ctrl.echartsMenu.status = false;
                            });
                        },
                        getEchartsData: function () {
                          //  currentNode = angular.extend($ctrl.echartsConfig.data);
                            if (!currentNode) {
                                return {
                                    rtopen: 0,
                                    rtapi: ''
                                };
                            }
                            if (!currentNode.rtopen) {
                                currentNode.rtopen = 0;
                            }
                            if (!currentNode.rtapi) {
                                currentNode.rtapi = '';
                            }
                            return {
                                rtopen: currentNode.rtopen,
                                rtapi: currentNode.rtapi
                            };
                        }(),
                        setEchartsRtopen: function (event) {
                            var dom = event.target || event.srcElement;
                            currentNode.rtopen = ~~dom.checked;
                            this.getEchartsData.rtopen = currentNode.rtopen;
                        },
                        _configEcharts: function () {
                            var _this = this;
                            $scope.$apply(function () {
                                _this.getEchartsData.rtopen = currentNode.Echarts.CONFIG.config.rtopen || 0;
                                _this.getEchartsData.rtapi = currentNode.Echarts.CONFIG.config.rtapi || '';
                                $ctrl.nodeMenu.status = false;
                                $ctrl.linkMenu.status = false;
                                $ctrl.echartsMenu.status = false;
                                $ctrl.echartsConfig.x = event.pageX - _this.config.x + 10 + 'px';
                                $ctrl.echartsConfig.y = event.pageY - _this.config.y + 10 + 'px';
                                $ctrl.echartsConfig.status = true;
                            });
                        },
                        _echarthandlerMouseup: function (event, node) {
                            if (event.button === 0) {
                                var opt = {
                                    width: node.width,
                                    height: node.height
                                };
                                node.Echarts.CONFIG.config.position = opt;
                            } else if (event.button === 2) {
                                currentNode = node;
                                $ctrl.echartsMenu.x = event.pageX - this.config.x + 10 + 'px';
                                $ctrl.echartsMenu.y = event.pageY - this.config.y + 10 + 'px';
                                $ctrl.echartsMenu.status = true;

                            }
                            // $scope.$broadcast('Monitor:resetEcharts', opt);
                        },
                        _eventController: function (event) {
                            var type = event.type;
                            var e = event.target || event.srcElement;
                            switch (!0) {
                                case (type === 'mouseup' && !e.elementType): //空白canvas单击事件
                                    $ctrl.nodeMenu.status = false;
                                    $ctrl.linkMenu.status = false;
                                    $ctrl.echartsMenu.status = false;
                                    $ctrl.echartsConfig.status = false;
                                    break;
                                case (type === 'mouseup' && e.elementType === 'echart'): //点击事件&& echart
                                    $ctrl.nodeMenu.status = false;
                                    $ctrl.linkMenu.status = false;
                                    $ctrl.echartsConfig.status = false;
                                    this._echarthandlerMouseup(event, e);
                                    break;
                                case (type === 'mouseup' && e.elementType === 'node'): //右键点击事件&& node
                                    $ctrl.nodeMenu.status = false;
                                    $ctrl.linkMenu.status = false;
                                    $ctrl.echartsMenu.status = false;
                                    $ctrl.echartsConfig.status = false;
                                    event.button === 2 ? this._NodehandlerMouseup(event, e) : this._nodeHandlerClick(event, e);
                                    break;
                                case (type === 'mouseup' && e.elementType === 'link'): //右键点击事件&& link
                                    $ctrl.nodeMenu.status = false;
                                    $ctrl.linkMenu.status = false;
                                    $ctrl.echartsMenu.status = false;
                                    $ctrl.echartsConfig.status = false;
                                    event.button === 2 && this._linkHandlerMouseup(event, e);
                                    break;
                                case (type === 'dblclick' && e.elementType === 'node'): //双击事件&& node
                                case (type === 'dblclick' && e.elementType === 'link'): //双击事件&& link
                                    this.editElementValue.call(this, event, e);
                                    break;
                                case (type === 'dblclick' && !e.elementType): //空白canvas双击事件
                                    this.autoFixed();
                                    break;
                                default:
                                    break;
                            }

                        },
                        _save: function () {
                            if (!this.Scene) {
                                return;
                            }
                            var data = [];
                            for (var i = 0, l = this.Scene.childs.length; i < l; i++) {
                                var f = this.Scene.childs[i];
                                var o = {};
                                if (f.elementType === 'link'){
                                    o.elementType = f.elementType;
                                    o.nodeAid = f.nodeA.id;
                                    o.nodeZid = f.nodeZ.id;
                                    o.text = f.text;
                                    o.fontColor = f.fontColor;
                                } else {
                                    o.elementType = f.elementType;
                                    o.x = f.x;
                                    o.y = f.y;
                                    o.width = f.width;
                                    o.height = f.height;
                                    o.option = f.option;
                                    o.id = f.id;
                                    f.ecid && (o.ecid = f.ecid);
                                    o.rtopen = f.rtopen || 0;
                                    f.rtapi && (o.rtapi = f.rtapi);
                                    o.echartType = f.echartType;
                                  //  o.Image = typeof f.Image === 'object' ? f.Image.getDataURL() : f.Image;
                                    o.Image = f.Image;
                                    o.text = f.text;
                                    o.textPosition = f.textPosition;
                                    o.larm = f.alarm || '';
                                    o.level = f.level;
                                }
                                data.push(o);
                            }
                            console.log(data);//, '\n', JSON.stringify(data));
                        },
                        saveConfig: function () {
                            var data = this.getEchartsData;
                           // currentNode = angular.extend(currentNode, data, true);
                           // currentNode.Echarts = angular.extend(currentNode.Echarts, data, true);
                            currentNode.Echarts.CONFIG.config = angular.extend(currentNode.Echarts.CONFIG.config, data, true);
                            $ctrl.echartsConfig.status = false;
                            console.log(currentNode.Echarts, data);

                        },
                        _initEvent: function () {
                            var _this = this,
                                _timer;
                                //_createEcharts
                            $scope.$on('Monitor:save', function (event, data) {
                                return _this._save.call(_this, event, data);
                            });
                            $scope.$on('Monitor:echarts', function (event, data) {
                                return $timeout(function () {
                                    _this._createEcharts.call(_this, data);
                                });
                            });
                            $scope.$on('Monitor:rtEcharts', function (event, data) {
                                return $timeout(function () {
                                    return _this._realTimeEcharts.call(_this, data);
                                });
                            });
                            this.Scene.dbclick(function (e) {
                                $timeout.cancel(_timer);
                                _timer = null;
                                return _this._eventController.call(_this, e);
                            });
                            this.Scene.mouseup(function (e) {
                                if (!!_timer) {
                                    $timeout.cancel(_timer);
                                    return _timer = null;
                                }
                                _timer = $timeout(function () {
                                    $timeout.cancel(_timer);
                                    _timer = null;
                                    return _this._eventController.call(_this, e);
                                }, 300);
                            });
                            var oTools = document.getElementById($ctrl.tools);
                            oTools.addEventListener('click', function (event) {
                                return _this._toolsHandler.call(_this, event);
                            }, false);
                            /*
                             $scope.$on('$destroy', function () {
                                 clipImage();
                                 clipImage = null;
                                 
                                 addImage();
                                 addImage = null;
                             });
                            */
                        }
                    }
                }();
                MonitorController.init();
                $scope.MonitorController = MonitorController;
            }
        };
        return directive;
}]);

