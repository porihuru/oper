// [JST 2026-01-07 01] 02_auth.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.Auth = {
    init: function () {
      firebase.auth().onAuthStateChanged(function (user) {
        APP.State.setUser(user);
        APP.Render.renderAuth();
      });
    },

    // メール/パスワードでログイン（Googleは使わない）
    loginEmailPassword: function (email, password) {
      email = APP.Util.trim(email);
      password = String(password || "");

      if (APP.Util.isEmpty(email)) {
        return Promise.reject(new Error("メールアドレスが空です。"));
      }
      if (APP.Util.isEmpty(password)) {
        return Promise.reject(new Error("パスワードが空です。"));
      }
      return firebase.auth().signInWithEmailAndPassword(email, password);
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
