angular.module(window.ProjectName).directive("datePicker", function ($timeout) {
    var directive = {
        restrict: 'AE',
        scope: true,
        //replace: true,
        //template: '<div class="echarts-bar" style="height:100%;"></div>',
        link: function (scope, element, attrs) {
            var options = {
                //  singleDate : true,
                format: 'YYYY.MM.DD',
                autoClose: true,
                //  showShortcuts: false,
                showTopbar: false,
                // defaultTime: moment().startOf('day').toDate(),
                // defaultEndTime: moment().endOf('day').toDate(),
                extraClass: 'date-range-picker19'
            };
            scope.$watch(attrs.dateOptions, function (newValue, oldValue) {
                if (!!newValue) {
                    newValue = angular.extend(options, newValue);
                    var onchange = null;
                    if (newValue.onChange) {
                        onchange = newValue.onChange;
                        // delete opt.onChange;
                    }
                    var datePicker = $(element).dateRangePicker(newValue);
                    (!!onchange) && datePicker.bind('datepicker-change', onchange);
                }
            }, true);
            scope.$watch(attrs.datePicker, function (newValue, oldValue) {
                if (!!newValue) {
                    angular.element(element).val(newValue);
                }
            }, true);
            scope.$on('$destroy', function () {
                $('.date-picker-wrapper').remove();
            });
        }
    };
    return directive;
});
