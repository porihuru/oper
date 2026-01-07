// [JST 2026-01-07 00] 07_state.js
(function (global) {
  var APP = global.APP = global.APP || {};

  var state = {
    user: null,
    role: null,
    bidNo: "",
    header: null,
    items: [],
    dirty: false
  };

  APP.State = {
    get: function () { return state; },

    resetAll: function () {
      state.bidNo = "";
      state.header = null;
      state.items = [];
      state.dirty = false;
      APP.Render.renderAll();
    },

    setUser: function (user) {
      state.user = user || null;
      state.role = null;
      if (!user) {
        APP.Render.renderAll();
        return;
      }
      // role取得
      APP.Auth.fetchRole(user.uid).then(function (role) {
        state.role = role;
        APP.Render.renderAll();
      });
    },

    setBidNo: function (bidNo) {
      state.bidNo = bidNo || "";
      state.dirty = true;
      APP.Render.renderBidInfo();
    },

    setHeader: function (headerObj) {
      state.header = headerObj;
      state.dirty = true;
      APP.Render.renderHeaderPreview();
      APP.Render.renderBidInfo();
    },

    setItems: function (itemsArr) {
      state.items = itemsArr || [];
      state.dirty = true;
      APP.Render.renderItemsPreview();
    },

    setMessage: function (err, ok) {
      var elE = document.getElementById("topError");
      var elO = document.getElementById("topOk");
      elE.textContent = err || "";
      elO.textContent = ok || "";
    },

    setActionNote: function (msg) {
      document.getElementById("actionNote").textContent = "ログ：" + (msg || "なし");
    }
  };
})(window);
