
// var _API_Path = window.location.protocol + "//" + window.location.host + "/ecity_js_api1.0";

window._API_Path = "http://arcgisapi-zhyytest.oennso.enn.cn/ecity_js_api1.0";

window._jscache = [];
var _loadLocal = function (url) {
  if (!window._jscache[url]) {
    var content = null;
    if (url.indexOf(".css") > -1) {
      content = "<link type='text/css' rel='stylesheet' href='" + url + "'>";
      document.write(content);
    } else {
      content = "<script async type='text/javascript' src='" + url + "'><" + "/script>";
      document.write(content);
    }
    window._jscache[url] = 1;
  }
};
window._load = function () {
    var args = arguments;
    for (var i = 0; i < args.length; i++) {
      var url = _API_Path + (args[i].indexOf("/") === 0 ? "" : "/") + args[i];
        _loadLocal(url);
    }
};


(function () {
  window._load("frame/js/jquery-1.9.1.min.js",
      "frame/arcgis_js_api/library/3.20/3.20/esri/css/esri.css",
      "frame/arcgis_js_api/library/3.20/3.20/dijit/themes/tundra/tundra.css");
})();
