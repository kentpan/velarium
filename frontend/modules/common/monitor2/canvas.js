'@file: loading';
angular.module(ProjectName)
    .directive('canvas', function ($rootScope, $timeout) {
        var directive = {
            restrict: 'A',
            // replace: true,
            scope: true,
            template: '<canvas id="canvid-art"></canvas>',
            link: function ($scope, $element, $attrs) {
                var CanvasBabys = function () {
                    var win = $(window);
                    var canvas1;
                    var img = {};
                    return {
                        init: function (oIcon) {
                            var _this = this;
                            var conf = $scope.$eval($attrs.canvas);
                            var root = conf.root || 'canvasContainer';
                            var rootDom = $('#' + root);
                            $timeout(function () {
                                canvas1 = new Canvas.Element();
                                canvas1.init('canvid-art', {
                                    root: root,
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
                                        img.view = new Canvas.Img(this, config);
                                        canvas1.addImage(img.view);
                                        _this.showCorners.call(_this);
                                        $rootScope.commCache.prevProduct = img.view;
                                    };
                                    oView.src = conf.product;
                                }
                                if (!!conf.bg && conf.bg !== '') {
                                    var oBg = new Image();
                                 //   oBg.crossOrigin = '*.51art.top';
                                    oBg.onload = function () {
                                        img.bg = new Canvas.Img(this, {});
                                        canvas1.setCanvasBackground(img.bg);
                                    };
                                    oBg.src = conf.bg;
                                }
                                /*if (!!conf.icons && conf.icons !== '') {
                                    var oIcon = new Image();
                                  //  oBg.crossOrigin = '*';
                                    oIcon.onload = function () {
                                        //canvas1.loadIcons(this);
                                        img.icons = new Canvas.Img(this, {
                                            width: this.width,
                                            height: this.height
                                        });
                                        canvas1.setCanvasIcons(img.icons);
                                    };
                                    oIcon.src = conf.icons;
                                }*/
                                _this.canvas = canvas1;
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
                                    img.view = new Canvas.Img(this, config);
                                    canvas1.changeImage(img.view);
                                    _this.showCorners.call(_this);
                                    $rootScope.commCache.prevProduct = this;
                                };
                                oView.src = conf.product;
                            }
                        },
                        clipImage: function (args) {
                            var oClip = canvas1.clipImage();
                            if (!!oClip) {
                                try{
                                    var data = oClip.toDataURL('image/png');
                                    data = data.split(',')[1];
                                    data = window.atob(data);
                                    var ia = new Uint8Array(data.length);
                                    for (var i = 0; i < data.length; i++) {
                                        ia[i] = data.charCodeAt(i);
                                    };
                                    // canvas.toDataURL 返回的默认格式就是 image/png
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
                            return canvas1.clearContaier();
                        },
                        setBg: function () {
                            var _this = this;
                            var conf = $scope.$eval($attrs.canvas);
                            if (!!conf.bg && conf.bg !== '') {
                                var oBg = new Image();
                                oBg.onload = function () {
                                    img.bg = new Canvas.Img(this, {});
                                    canvas1.setCanvasBackground(img.bg);
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
                        //! insert these functions to the library. No access to _aImages should be done from here
                        showCorners: function () {
                            this.cornersvisible = (this.cornersvisible) ? false : true;
                            for (var i = 0, l = canvas1._aImages.length; i < l; i += 1) {
                                canvas1._aImages[i].setCornersVisibility(this.cornersvisible);
                            }
                            canvas1.renderAll();
                        }
                    }
                }();
                var oCorner = new Image();
                var _conf = $scope.$eval($attrs.canvas);
                oCorner.onload = function () {
                    CanvasBabys.init({
                        element: this,
                        width: this.width / 2,
                        height: this.height / 2
                    });
                    // $scope.$parent.canvas.canvasInfo = CanvasBabys;
                    $scope.$on('canvas:setView', CanvasBabys.setView);
                    $scope.$on('canvas:setBg', CanvasBabys.setBg);
                    $scope.$on('canvas:clearCanvas', CanvasBabys.clear);
                    var clipImage = $rootScope.$on('canvas:clipImage', function (e, args) {
                        return CanvasBabys.clipImage.call(CanvasBabys, args);
                    });
                    $scope.$on('$destroy', function () {
                        clipImage();
                        clipImage = null;
                    });
                };
                oCorner.src = _conf.icons;
            }
        };
        return directive;
});

