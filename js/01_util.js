// [JST 2026-01-07 00] 01_util.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.Util = {
    nowIso: function () {
      return new Date().toISOString();
    },
    trim: function (s) {
      return (s == null) ? "" : String(s).replace(/^\s+|\s+$/g, "");
    },
    isEmpty: function (s) {
      return APP.Util.trim(s) === "";
    },
    toNumberOrNull: function (v) {
      if (v == null) return null;
      var s = APP.Util.trim(v);
      if (s === "") return null;
      var n = Number(s);
      return isNaN(n) ? null : n;
    },
    log: function (msg) {
      try { console.log(msg); } catch (e) {}
    }
  };
})(window);
