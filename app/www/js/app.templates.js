angular.module('MyApp.Templates', []).run(['$templateCache', function($templateCache) {
  "use strict";
  $templateCache.put("test.tpl.html",
    "<h1>{{message}}</h1>");
}]);
