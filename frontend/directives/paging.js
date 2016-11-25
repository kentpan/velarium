angular.module(ProjectName).directive('abPaging', function ($state, $rootScope) {
    return {
        restrict: 'A',
        replace: true,
        template: '<div class="datatable-bottom">\
                        <span class="rows"></span>\
                        <div class="pull-right">\
                                <select  ng-change="index.moduleSize(index.AitemsPerPage)"  ng-model="index.AitemsPerPage"   style="width:100px;height:30px; float:left; border-radius:5px; padding:1px 10px; margin-right:20px; margin-top:20px;">\
                                   <option ng-repeat="v in index.myItemsPerPage">{{v.name}}</option>\
                                </select>\
                            <div id="DataTables_Table_0_paginate" style="float:left">\
                                <ul class="pagination pagination-sm">\
                                    <li ng-class="{disabled: currentPage == 0}">\
                                        <a href ng-click="prevPage()">◀</a>\
                                    </li>\
                                    <li ng-repeat="n in range(pages)" ng-class="{active: n == currentPage}" page="{{n}}" ng-click="setPage($event)"><a>{{n == "..." || n =="." ? "..." : n + 1}}</a></li>\
                                    <li ng-class="{disabled: currentPage == pages - 1}"> <a href ng-click="nextPage()">▶</a> </li>\
                                </ul>\
                            </div>\
                        </div>\
                    </div>',
        controller: function ($scope, $element, $attrs, $timeout) {
            $scope.currentPage = 0;
            $timeout(function () {
                $scope.range = function () {
                    $scope.ret = [];
                    if ($scope.pages < 1) {
                        return false;
                    }
                    $scope.ret.push(0);
                    if ($scope.pages < 5) {
                        for (var i = 1; i < $scope.pages; i++) {

                            $scope.ret.push(i);
                        }
                    } else if ($scope.currentPage <= 3) {
                        $scope.ret = $scope.ret.concat([1, 2, 3, 4, '...', $scope.pages - 1]);

                    } else if ($scope.pages - $scope.currentPage - 1 <= 2) {
                        $scope.ret.push('...');
                        for (var j = $scope.pages - 4; j < $scope.pages; j++) {
                            $scope.ret.push(j);
                        }

                    } else if ($scope.pages > 5) {
                        $scope.ret.push('...', $scope.currentPage - 1, $scope.currentPage, $scope.currentPage - 0 + 1, '.');
                        $scope.ret.push($scope.pages - 1);

                    }
                    return $scope.ret;
                };
            }, 100)

            $scope.setPage = function ($event) {
                if ($scope.currentPage === this.n) {
                    return;
                }
                if (this.n == '...' || this.n == '.') {
                    return;
                }
                if (this.n == 1) {
                    $scope.currentPage - 1
                }
                $scope.currentPage = this.n;
                if ($attrs.localPaging) {
                    return;
                }
                jump($rootScope.params.aid, $scope.currentPage + 1);
            };
            $scope.prevPage = function () {
                if ($scope.currentPage <= 0) {
                    return;
                }
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                }
                if ($attrs.localPaging) {
                    return;
                }
                jump($rootScope.params.aid, $scope.currentPage + 1);
            };
            $scope.nextPage = function () {
                if ($scope.currentPage >= $scope.pages - 1) {
                    return;
                }
                if ($scope.currentPage < $scope.pages) {
                    $scope.currentPage++;
                }
                if ($attrs.localPaging) {
                    return;
                }
                jump($rootScope.params.aid, $scope.currentPage + 1);
            };
            function jump(aid, pg) {
                $attrs.abPaging !== '' && $state.go($attrs.abPaging, {
                    aid: aid,
                    page: pg
                });
            }
        },
        link: function ($scope, $element, $attrs) {
        }
    }
});