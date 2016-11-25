//angular.module("auncelAdmin.permission", []).factory('permissionService', function ($rootScope,$http, $q, $cookieStore, CONFIG) {
angular.module("auncelAdmin.permission", [], function($provide) {
    $provide.factory('permissionService', function ($q, $rootScope, CONFIG) {
      return {
        // 将权限缓存到 Session，以避免后续请求不停的访问服务器
        permissionModel: { permission: CONFIG.userPermissionList, isPermissionLoaded: false },
        permissionCheck: function (roleCollection, args) {
          // 返回一个承诺(promise).
          //return CONFIG.userPermissionList;
          // 这里只是在承诺的作用域中保存一个指向上层作用域的指针。
          var aid = !!args ? (args.aid||null) : null;
            // 检查当前用户权限访问当前路由是否已获取
          var permissions = this.parsePermission(this.permissionModel.permission, aid);
          var permission  = this.getPermission(permissions, roleCollection);
          return permission;
        },
        parsePermission: function(permissions, aid) {
              var pms = [];
              if(angular.isArray(permissions)) {
                    pms = permissions;
              }else if(angular.isObject(permissions)) {
                    if(!!aid) {
                        pms = permissions[aid];
                    }else{
                          angular.forEach(permissions, function (k, v) {
                          pms.push(v);
                      });
                    }
                };
                return pms;
        },
        getPermission: function (permissions, roleCollection) {
          var ifPermissionPassed = false;
          var name  = roleCollection.name;
          var roles = roleCollection.permission;
          angular.forEach(roles, function (role) {
            if($.inArray(role, permissions) > -1) {
                return ifPermissionPassed = true;
            }
          });
          return ifPermissionPassed;
        }
      };
    });
});
