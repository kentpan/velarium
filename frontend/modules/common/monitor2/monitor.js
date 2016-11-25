'@file: loading';
angular.module(ProjectName)
    .directive('canvas', function ($rootScope, $timeout) {
        var directive = {
            restrict: 'A',
            // replace: true,
            scope: true,
            template: '<canvas id="canvid-art"></canvas>',
            link: function ($scope, $element, $attrs) {
                var MonitorController = function () {
                    var win = $(window);
                    var Monitor1;
                    var img = {};
                    return {
                        init: function (oIcon) {
                            var _this = this;
                            var conf = $scope.$eval($attrs.canvas);
                            var root = conf.root || 'canvasContainer';
                            var rootDom = $('#' + root);
                            $timeout(function () {
                                Monitor1 = new Monitor.Element();
                                Monitor1.init('canvid-art', {
                                    root: root,
                                    isAdmin: true,
                                    corners: oIcon || null,
                                    width: rootDom.width(),
                                    height: rootDom.height()
                                });
                                if (!!conf.product && conf.product !== '') {
                                    var config = _this.getPrevConf() || {
                                        top: (win.height()) / 2,
                                        left: (win.width()) / 2
                                    };
                                    var oView = new Image();
                                  //  oView.crossOrigin = '*.51art.top';
                                    oView.onload = function () {
                                        img.view = new Monitor.Img(this, config);
                                        Monitor1.addImage(img.view);
                                        _this.showCorners.call(_this);
                                        $rootScope.commCache.prevProduct = img.view;
                                    };
                                    oView.src = conf.product;
                                }
                                if (!!conf.bg && conf.bg !== '') {
                                    var oBg = new Image();
                                 //   oBg.crossOrigin = '*.51art.top';
                                    oBg.onload = function () {
                                        img.bg = new Monitor.Img(this, {});
                                        Monitor1.setMonitorBackground(img.bg);
                                    };
                                    oBg.src = conf.bg;
                                }
                                /*if (!!conf.icons && conf.icons !== '') {
                                    var oIcon = new Image();
                                  //  oBg.crossOrigin = '*';
                                    oIcon.onload = function () {
                                        //Monitor1.loadIcons(this);
                                        img.icons = new Monitor.Img(this, {
                                            width: this.width,
                                            height: this.height
                                        });
                                        Monitor1.setMonitorIcons(img.icons);
                                    };
                                    oIcon.src = conf.icons;
                                }*/
                                _this.Monitor = Monitor1;
                                _this.img = img;
                            }, 0);
                            return this;
                        },
                        setView: function () {
                            var _this = this;
                            var conf = $scope.$eval($attrs.canvas);
                            if (!!conf.product && conf.product !== '') {
                                var config = _this.getPrevConf() || {
                                    top: (win.height()) / 2,
                                    left: (win.width()) / 2
                                };
                                var oView = new Image();
                                oView.onload = function () {
                                    img.view = new Monitor.Img(this, config);
                                    Monitor1.changeImage(img.view);
                                    _this.showCorners.call(_this);
                                    $rootScope.commCache.prevProduct = this;
                                };
                                oView.src = conf.product;
                            }
                        },
                        clipImage: function (args) {
                            var oClip = Monitor1.clipImage();
                            if (!!oClip) {
                                try{
                                    var data = oClip.toDataURL('image/png');
                                    data = data.split(',')[1];
                                    data = window.atob(data);
                                    var ia = new Uint8Array(data.length);
                                    for (var i = 0; i < data.length; i++) {
                                        ia[i] = data.charCodeAt(i);
                                    };
                                    // Monitor.toDataURL 返回的默认格式就是 image/png
                                    var blob = new Blob([ia], {type:'image/png'}); 
                                    return args.post(blob);
                                } catch (err) {
                                    return $rootScope.poplayer = {
                                        type: 'error',
                                        content: '操作失败!'
                                    };
                                }
                            } else {
                                return $rootScope.poplayer = {
                                    type: ''
                                };
                            }
                        },
                        clear: function () {
                            return Monitor1.clearContaier();
                        },
                        setBg: function () {
                            var _this = this;
                            var conf = $scope.$eval($attrs.canvas);
                            if (!!conf.bg && conf.bg !== '') {
                                var oBg = new Image();
                                oBg.onload = function () {
                                    img.bg = new Monitor.Img(this, {});
                                    Monitor1.setMonitorBackground(img.bg);
                                };
                                oBg.src = conf.bg;
                            }
                        },
                        getPrevConf: function () {
                            var oPrev = $rootScope.commCache.prevProduct;
                            if (!oPrev) {
                                return null;
                            } else {
                                var t = oPrev.top;
                                var l = oPrev.left;
                                var w = oPrev.width;
                                var h = oPrev.height;
                                var sx = oPrev.scalex;
                                var sy = oPrev.scaley;
                                var tt = oPrev.theta;
                                return {
                                    top: t,
                                    left: l,
                                    width: w,
                                    height: h,
                                    scalex: sx,
                                    scaley: sy,
                                    theta: tt
                                };
                            }
                        },
                        _addImage: function (oConfig) {
                            if (typeof oConfig === 'undefined') {
                                oConfig = {};
                            }
                            if (!oConfig.src || oConfig.src === '') {
                                return console.log('image src is null!');
                            }
                            var _this  = this;
                            var config = {
                                top: oConfig.top || (win.height()) / 2,
                                left: oConfig.left || (win.width()) / 2
                            };
                            var oView = new Image();
                          //  oView.crossOrigin = '*.51art.top';
                            oView.onload = function () {
                                _this.Monitor.addImage(new Monitor.Img(this, config));
                                _this.showCorners.call(_this);
                                console.log('addImage success!');
                            };
                            oView.src = oConfig.src;
                        },
                        _initEvent: function () {
                            $scope.$on('Monitor:setView', MonitorController.setView);
                            $scope.$on('Monitor:setBg', MonitorController.setBg);
                            $scope.$on('Monitor:clearMonitor', MonitorController.clear);
                            var clipImage = $rootScope.$on('Monitor:clipImage', function (e, args) {
                                return MonitorController.clipImage.call(MonitorController, args);
                            });
                            var addImage = $scope.$on('Monitor:addImage', function (event, config) {
                                return MonitorController._addImage.call(MonitorController, config);
                            });

                            $scope.$on('$destroy', function () {
                                clipImage();
                                clipImage = null;
                                
                                addImage();
                                addImage = null;
                            });

                        },
                        //! insert these functions to the library. No access to _aImages should be done from here
                        showCorners: function () {
                            for (var i = 0, l = this.Monitor._aImages.length; i < l; i += 1) {
                                this.Monitor._aImages[i].setCornersVisibility(true);
                            }
                            this.Monitor.renderAll();
                        },
                        hideCorners: function () {
                            for (var i = 0, l = this.Monitor._aImages.length; i < l; i += 1) {
                                this.Monitor._aImages[i].setCornersVisibility(false);
                            }
                            this.Monitor.renderAll();
                        }
                    }
                }();
                var oCorner = new Image();
                var _conf = $scope.$eval($attrs.canvas);
                oCorner.onload = function () {
                    MonitorController.init({
                        element: this,
                        width: this.width / 2,
                        height: this.height / 2
                    });
                    // $scope.$parent.Monitor.MonitorInfo = MonitorController;
                    MonitorController._initEvent();
                };
                oCorner.src = _conf.icons;
            }
        };
        return directive;
});

