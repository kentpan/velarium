
/**
 * select2封装
 * @param {scope} ng-model 选中的ID
 * @param {scope} select2-model 选中的详细内容
 * @param {scope} config 自定义配置
 * @param {String} [query] 内置的配置 (怎么也还得默认一个config)
 * @example
 * <input select2 ng-model="a" select2-model="b" config="config" type="text" placeholder="占位符" />
 * <input select2 ng-model="a" select2-model="b" config="default" query="member" type="text" placeholder="占位符" />
 * <select select2 ng-model="b" class="form-control"></select>
 */
angular.module(window.ProjectName).directive('select2', function () {
    return {
        restrict: 'A',
        scope: {
            config: '=',
            ngModel: '=',
            select2Model: '='
        },
        link: function (scope, element, attrs) {
            // 初始化
            var tagName = element[0].tagName,
                config = {
                    allowClear: true,
                    multiple: !!attrs.multiple,
                    placeholder: attrs.placeholder || ' '   // 修复不出现删除按钮的情况
                };

            // 生成select
            if(tagName === 'SELECT') {
                // 初始化
                var $element = $(element);
                delete config.multiple;

                $element
                    .prepend('<option value=""></option>')
                    .val('')
                    .select2(config);

                // model - view
                scope.$watch('ngModel', function (newVal) {
                    setTimeout(function () {
                        $element.find('[value^="?"]').remove();    // 清除错误的数据
                        $element.select2('val', newVal);
                    },0);
                }, true);
                return false;
            }
        }
    }
});

/**
 * select2 内置查询功能
 */


// app.controller('appCtrl', function ($scope, $timeout) {
//     $scope.config1 = {
//         data: [],
//         placeholder: '尚无数据'
//     };

//     $scope.config1.data = [{id:1,text:'bug'},{id:2,text:'duplicate'},{id:3,text:'invalid'},{id:4,text:'wontfix'}]
//     $scope.config1.placeholder = '加载完毕';
// });

// angular.bootstrap(document, ['app']);
