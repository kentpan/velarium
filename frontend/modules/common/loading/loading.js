'@file: loading';
angular.module(ProjectName).directive('abLoading', function ($timeout, CONFIG, $rootScope) {
    var directive = {
        restrict: 'AE',
        replace: true,
        scope: true,
        template: '<div id="lightboss_poplayer" class="{{poplayer.type}}"><hgroup><header><em></em><div class="loader"><span></span><span></span><span></span><span></span><span></span></div></header><article>{{poplayer.content||"正在加载..."}}</article><footer></footer></hgroup></div>',
        link: function ($scope, $element, $attrs) {
            $scope.$watch($attrs.abLoading, function (newValue, oldValue) {
                if (!!newValue) {
                    var type = newValue.type;
                    var autoHide = typeof newValue.autoHide == 'undefined' ? 2000 : newValue.autoHide;
                    if (!!type && type !== 'loading') {
                        var _delay = $timeout(function () {
                            $timeout.cancel(_delay);
                            var redirect = newValue.redirect || null;
                            $scope.poplayer.type = '';
                            if (!!redirect) {
                                if (typeof redirect === 'function') {
                                    return redirect();
                                }
                                return location.replace(redirect);
                            }
                        }, autoHide);
                    }
                }
            }, true);
        }
    };
    return directive;
});
angular.module(ProjectName).directive('loading', function ($timeout, CONFIG, $rootScope) {
    return {
        restrict: 'AE',
        replace: true,
        scope: true,
        link: function (scope, element, attrs) {
            element.addClass('busy');
            var load = attrs.loading;
            if (load === '') {
                var loadDelay = null;
                var win_height = $(window).height();
                var _body = element.parent();
                while (_body[0].tagName !== 'BODY') {
                    var css = _body.css('overflowY');
                    if (css === 'auto' || css === 'scroll') {
                        break;
                    } else {
                        _body = _body.parent();
                    }
                }
                if (_body[0].tagName === 'BODY') {
                    _body = angular.element(document);
                }
                // var _body        = angular.element(($(attrs.loadingRoot)[0] || document));
                var getLoadItems = function (sTop) {
                    var oList = $rootScope.lazyLoadList;
                    if (!oList || !oList.length) {
                        return _body.off('scroll');
                    }
                    angular.forEach(oList, function (v, k) {
                        alert(11)
                        var _top = v.top;
                        //  console.log(sTop, _top, win_height,'=================');
                        if (sTop >= _top - win_height - 100) {
                            var ele = oList.splice(k, 1);
                            typeof ele[0].back === 'function' && ele[0].back();
                            console.log(ele)
                            ele[0].element.removeClass('busy');
                            ele[0].element.removeAttr('loading');
                            return getLoadItems(sTop);
                        }
                    });
                };
                var setScroll = function (value) {
                    !!loadDelay && $timeout.cancel(loadDelay);
                    loadDelay = $timeout(function () {
                        getLoadItems(_body.scrollTop());
                    }, 200);
                };
                _body.off('scroll').on('scroll', setScroll);
                $timeout(setScroll, 100);
                /*在 destroy 时清除事件注册*/
                scope.$on('$destroy', function () {
                    _body.off('scroll');
                });
            } else {
                scope.$watch(attrs.loading, function (newValue, oldValue) {
                    if (!!newValue) {
                        element.removeClass('busy');
                    }
                }, true);
            }
        }
    };
});
