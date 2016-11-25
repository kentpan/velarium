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
                        strr = '';
                    return {
                        init: function () {
                            var _this = this;
                            var conf = $scope.$eval($attrs.canvas);
                            this.config = conf;
                            $timeout(function () {
                                var rootDom = $('#' + (conf.root || 'monitorContainer'));
                                var canvas = document.getElementById($ctrl.canvas);
                                canvas.height = rootDom.height();
                                canvas.width = rootDom.width();
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
                                console.log('scene:', _this.Scene, '\nstage: ', _this.Stage);
                            }, 0);
                            return this;
                        },
                        load: function () {
                            var _this = this;
                            fetchService.get([this.config.load])
                                .then(function (ret) {
                                    var data = ret[0].data;
                                    angular.forEach(data, function (v, k) {
                                        switch (v.elementType) {
                                            case 'echart':
                                                !_this._echartsQueue && (_this._echartsQueue = []);
                                                _this._echartsQueue.push(v);
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
                        _createEcharts: function (oEc) {
                            var _this = this;
                            if (!this._echartsQueue || !this._echartsQueue.length) {
                                return;
                            }
                          //  var oImg = oEc.getDataURL();
                            var oImg = oEc.getRenderedCanvas();
                          //  oEc.dispose();
                            angular.forEach(this._echartsQueue, function (v) {
                                _this._createNode(v.x, v.y, 'echart', oImg, v.textPosition, v.level, v.larm, oEc.getDataURL());
                            });
                        },
                        _NodehandlerMouseup: function (event, node) {
                           // $("#linkmenu").hide();
                            $ctrl.linkMenu.status = false;
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
                        clear: function () {
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
                                    break;
                                case '复制节点':
                                    this._createNode(tmpx, tmpy, currentNode.text, currentNode.Image, 'Bottom_Center');
                                    break;
                                case '删除节点':
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
                            }
                            $timeout(function () {
                                $ctrl.nodeMenu.status = false;
                                $ctrl.linkMenu.status = false;
                            });
                        },
                        _eventController: function (event) {
                            var type = event.type;
                            var e = event.target || event.srcElement;
                            switch (!0) {
                                case (type === 'mouseup' && !e.elementType): //空白canvas单击事件
                                    $ctrl.nodeMenu.status = false;
                                    $ctrl.linkMenu.status = false;
                                    break;
                                case (type === 'mouseup' && e.elementType === 'node'): //右键点击事件&& node
                                    $ctrl.nodeMenu.status = false;
                                    $ctrl.linkMenu.status = false;
                                    event.button === 2 ? this._NodehandlerMouseup(event, e) : this._nodeHandlerClick(event, e);
                                    break;
                                case (type === 'mouseup' && e.elementType === 'link'): //右键点击事件&& link
                                    $ctrl.nodeMenu.status = false;
                                    $ctrl.linkMenu.status = false;
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
                                    o.id = f.x * f.y;
                                console.log(typeof f.Image, f);
                                    o.Image = typeof f.Image === 'object' ? f.Image.getDataURL() : f.Image;
                                    o.text = f.text;
                                    o.textPosition = f.textPosition;
                                    o.larm = f.alarm || '';
                                    o.level = f.level;
                                }
                                data.push(o);
                            }
                            console.log(data);
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
            }
        };
        return directive;
}]);

