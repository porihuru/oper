// [JST 2026-01-07 00] 02_auth.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.Auth = {
    init: function () {
      // Auth状態監視
      firebase.auth().onAuthStateChanged(function (user) {
        APP.State.setUser(user);
        APP.Render.renderAuth();
      });
    },

    loginGoogle: function () {
      var provider = new firebase.auth.GoogleAuthProvider();
      return firebase.auth().signInWithPopup(provider);
    },

    logout: function () {
      return firebase.auth().signOut();
    },

    // users/{uid} から role を取得（operator/admin/bidder）
    fetchRole: function (uid) {
      return APP.DB.getUser(uid).then(function (doc) {
        if (!doc) return null;
        return doc.role || null;
      });
    }
  };
})(window);
