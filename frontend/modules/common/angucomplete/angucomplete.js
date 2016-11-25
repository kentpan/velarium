/**
 * Angucomplete
 * Autocomplete directive for AngularJS
 * By Daryl Rowland
 */

angular.module(window.ProjectName).directive('angucomplete', function ($rootScope, $parse, $state, $sce, $timeout, fetchService, CONFIG) {
    return {
        restrict: 'EA',
        scope: {
            "id": "@id",
            "placeholder": "@placeholder",
            "selectedObject": "=selectedobject",
            "url": "@url",
            "dataField": "@datafield",
            "titleField": "@titlefield",
            "descriptionField": "@descriptionfield",
            "imageField": "@imagefield",
            "imageUri": "@imageuri",
            "inputClass": "@inputclass",
            "userPause": "@pause",
            "localData": "=localdata",
            "searchFields": "@searchfields",
            "minLengthUser": "@minlength",
            "matchClass": "@matchclass"
        },
        template: '<div class="angucomplete-holder" id="{{expID}}"><input name="{{expID}}" id="{{id}}_value" ng-model="searchStr" type="text" placeholder="{{placeholder}}" class="{{inputClass}}" onmouseup="this.select();" ng-focus="resetHideResults()" ng-blur="hideResults()" /><div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-if="showDropdown"><div class="angucomplete-searching" ng-show="searching">Searching...</div><div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)">Not results</div><div class="angucomplete-row" ng-repeat="result in results" ng-mousedown="selectResult(result)" ng-mouseover="hoverRow()" ng-class="{\'angucomplete-selected-row\': $index == currentIndex}"><div ng-if="imageField" class="angucomplete-image-holder"><img ng-if="result.image && result.image != \'\'" ng-src="{{result.image}}" class="angucomplete-image"/><div ng-if="!result.image && result.image != \'\'" class="angucomplete-image-default"></div></div><div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div><div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div><div ng-if="result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div></div></div></div>',
        link: function ($scope, elem, attrs) {
            var api = CONFIG.api[$state.current.name];
            $scope.lastSearchTerm = null;
            $scope.currentIndex = null;
            $scope.justChanged = false;
            $scope.searchTimer = null;
            $scope.hideTimer = null;
            $scope.searching = false;
            $scope.pause = 500;
            $scope.minLength = 3;
            $scope.searchStr = null;
            $scope.autocomplete = {};
            if ($scope.minLengthUser && $scope.minLengthUser != "") {
                $scope.minLength = $scope.minLengthUser;
            }
            if ($scope.userPause) {
                $scope.pause = $scope.userPause;
            }
            isNewSearchNeeded = function (newTerm, oldTerm) {
                return newTerm.length >= $scope.minLength && newTerm != oldTerm
            }
            $scope.processResults = function (responseData, str) {
                if (responseData && responseData.length > 0) {
                    $scope.results = [];
                    var titleFields = [];
                    if ($scope.titleField && $scope.titleField != "") {
                        titleFields = $scope.titleField.split(",");
                    }
                    for (var i = 0; i < responseData.length; i++) {
                        // Get title variables
                        var titleCode = [];
                        for (var t = 0; t < titleFields.length; t++) {
                            titleCode.push(responseData[i][titleFields[t]]);
                        }
                        var description = '';
                        if ($scope.descriptionField) {
                            description = responseData[i][$scope.descriptionField];
                        }
                        var imageUri = '';
                        if ($scope.imageUri) {
                            imageUri = $scope.imageUri;
                        }
                        var image = '';
                        if ($scope.imageField) {
                            image = imageUri + responseData[i][$scope.imageField];
                        }
                        str = str.replace(/\\/g, '').replace(/([\.\?\-\*])/ig, '\\$1');
                        var text = titleCode.join(' ');
                        if ($scope.matchClass) {
                            var re = new RegExp(str, 'i');
                            var strPart = text.match(re);
                            text = $sce.trustAsHtml(text.replace(re, '<span class="' + $scope.matchClass + '">' + strPart + '</span>'));
                        }
                        var resultRow = {
                            title: text,
                            description: description,
                            image: image,
                            originalObject: responseData[i],
                            id: responseData[i].id
                        }
                        $scope.results[$scope.results.length] = resultRow;
                    }
                } else {
                    $scope.results = [];
                }
            }
            $scope.selectResult = function (result) {
                if ($scope.matchClass) {
                    result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
                }
                $scope.searchStr = $scope.lastSearchTerm = result.title;
                $scope.expID = result.id;
                $scope.selectedObject = result;
                $scope.showDropdown = false;
                $scope.results = [];
                //$scope.$apply();
            }
            $scope.searchTimerComplete = function (str, id) {
                id = $.trim(id);
                var searchTimerData = ['soft_version', 'phone_model'];
                if (id == 'phone_model') {
                    var platform = $('#phone_manufacturer_value').val();
                }
                if ($.inArray(id, searchTimerData) == -1) {
                    platform = '';
                }

                function autocompleteData(data, key) {
                    key = key.replace(/\\/g, '').replace(/([\.\?\-\*])/ig, '\\$1');
                    var reg = new RegExp(key, "gi");
                    var keyData = [];
                    angular.forEach(data, function (value, key) {
                        if (reg.test(value.name)) {
                            keyData.push(value)
                        }
                    });
                    $scope.processResults(keyData, key)
                    $scope.searching = false;
                }

                if (!$scope.autocomplete[id]) {
                    $scope.autocomplete[id] = {};
                }
                str = str.toLowerCase();
                var dataSearch = '';
                if ($scope.autocomplete[id]) {

                    dataSearch = JSON.stringify($scope.autocomplete[id]).toLowerCase();
                    console.log(dataSearch)
                }
                if (dataSearch.indexOf(str) == -1) {
                    var searchObject = {
                        field: id,
                        keyOne: str,
                        keyTwo: platform
                    };
                    var fetchArr = [{
                        url: CONFIG.getApi(api.mainFilter),
                        data: searchObject
                    }];
                    fetchService.get(fetchArr).then(function (data) {
                        data = data[0].data;
                        $scope.autocomplete[id] = data.data;
                        autocompleteData(data.data, str);
                    });
                } else {
                    autocompleteData($scope.autocomplete[id], str);
                }
            };
            $scope.hideResults = function () {
                $scope.hideTimer = $timeout(function () {
                    $scope.showDropdown = false;
                }, $scope.pause);
            };
            $scope.resetHideResults = function () {
                if ($scope.hideTimer) {
                    $timeout.cancel($scope.hideTimer);
                };
            };
            $scope.hoverRow = function (index) {
                $scope.currentIndex = index;
            }
            $scope.keyPressed = function (event) {
                if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                    if (!$scope.searchStr || $scope.searchStr == "") {
                        $scope.showDropdown = false;
                        $scope.lastSearchTerm = null
                    } else if (isNewSearchNeeded($scope.searchStr, $scope.lastSearchTerm)) {
                        $scope.lastSearchTerm = $scope.searchStr
                        $scope.showDropdown = true;
                        $scope.currentIndex = -1;
                        $scope.results = [];
                        if ($scope.searchTimer) {
                            $timeout.cancel($scope.searchTimer);
                        }
                        $scope.searching = true;
                        $scope.searchTimer = $timeout(function () {
                            $scope.searchTimerComplete($scope.searchStr, $scope.id);
                        }, $scope.pause);
                    }
                    if (!$rootScope.autocomplete) {
                        $rootScope.autocomplete = {};
                    }
                    if (!$rootScope.autocomplete.dataList) {
                        $rootScope.autocomplete.dataList = {};
                    }
                    $rootScope.autocomplete.dataList[event.target.id] = $scope.searchStr;
                } else {
                    event.preventDefault();
                }
            }
            var inputField = elem.find('input');
            inputField.on('keyup', $scope.keyPressed);
            elem.on("keyup", function (event) {
                if (event.which === 40) {
                    if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                        $scope.currentIndex++;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }
                    $scope.$apply();
                } else if (event.which == 38) {
                    if ($scope.currentIndex >= 1) {
                        $scope.currentIndex--;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }
                } else if (event.which == 13) {
                    if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                        $scope.selectResult($scope.results[$scope.currentIndex]);
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    } else {
                        $scope.results = [];
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                    }
                } else if (event.which == 27) {
                    $scope.results = [];
                    $scope.showDropdown = false;
                    $scope.$apply();
                } else if (event.which == 8) {
                    $scope.selectedObject = null;
                    $scope.$apply();
                }
            });
        }
    };
});
