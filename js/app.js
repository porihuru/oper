// [JST 2026-01-07 00] app.js
(function (global) {
  var APP = global.APP = global.APP || {};

  function boot() {
    APP.DB.init();
    APP.Auth.init();
    APP.Render.renderAll();
    APP.UI.bind();
    APP.State.setActionNote("起動しました。firebaseConfig を設定してください（00_config.js）。");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
