angular.module(window.ProjectName).directive("tools", function ($rootScope, $timeout) {
    var directive = {
        restrict: 'AE',
        scope: {
            tools: '=',
            canvas: '='
        },
        replace: true,
        template: function (element, attrs) {
            if (attrs.tools === 'tools.photo') {
                //<input type="file" accept="video/*;capture=camcorder"> <input type="file" accept="audio/*;capture=microphone">
                //<input type="file" accept="image/*;capture=camera">
                return '<a class="tools tools-{{tools.key}}" ng-click="wxScope.service()">{{tools.value}}</a>';
            } else {
                return '<a class="tools tools-{{tools.key}}" ng-href="{{tools.href}}">{{tools.value}}</a>';
            }
        },
        controller: function ($scope) {
            var _this = this;
            jWeixin.ready(function () {
                jWeixin.checkJsApi({
                    jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                    success: function(res) {
                        // 以键值对的形式返回，可用的api值true，不可用为false
                        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                        _this.service = function (e) {
                            jWeixin.chooseImage({
                                count: 1, // 默认9
                              //  sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                                sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                                success: function (res) {
                                    var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                                    var tmpImg = new Image();
                                    tmpImg.onload = function () {
                                        if ($scope.$parent.canvas) {
                                            $scope.$parent.canvas.canvasConf.bg = localIds[0];
                                            $timeout(function () {
                                                $scope.$parent.canvas.switchBtn = false;
                                                $scope.$parent.canvas.menuText = '换 一 换';
                                            }, 0);
                                        }
                                        $scope.$parent.index && ($scope.$parent.index.canvasConf.bg = localIds[0]);
                                        $scope.$root.commCache.canvasConfBg = localIds[0];
                                        $scope.$parent.$broadcast('canvas:setBg');
                                        console.log('chooseImage success!!!');
                                        uploadImages(localIds[0]);
                                    };
                                    tmpImg.src = localIds[0];
                                }
                            });
                        };
                    }
                });
                function uploadImages(ids) {
                            alert('uploadimage start!');
                    jWeixin.uploadImage({
                        localId : ids,
                        success : function(res) {
                            alert(res.serverId+'|uploadimage success!!!');
                           /* if ($scope.$parent.canvas) {
                                $scope.$parent.canvas.canvasConf.bg = res.serverId;
                                $timeout(function () {
                                    $scope.$parent.canvas.switchBtn = false;
                                    $scope.$parent.canvas.menuText = '换 一 换';
                                }, 0);
                            }
                            $scope.$parent.index && ($scope.$parent.index.canvasConf.bg = res.serverId);
                            $scope.$root.commCache.canvasConfBg = res.serverId;
                            $scope.$parent.$broadcast('canvas:setBg');*/


                        }
                    });
                }
                console.log('wxjssdk already!!!');
            });
        },
        controllerAs: 'wxScope',
        link: function (scope, element, attrs) {

        }
    };
    return directive;
});
