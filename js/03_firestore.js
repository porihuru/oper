// [JST 2026-01-07 00] 03_firestore.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.DB = {
    init: function () {
      var cfg = APP.CONFIG.firebaseConfig;
      if (!cfg || !cfg.projectId) {
        APP.Util.log("firebaseConfig が未設定です（00_config.js）");
        return;
      }
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      APP._firestore = firebase.firestore();
    },

    // users
    getUser: function (uid) {
      return APP._firestore.collection(APP.CONFIG.paths.users).doc(uid).get()
        .then(function (snap) { return snap.exists ? snap.data() : null; });
    },

    // bids
    getBid: function (bidNo) {
      return APP._firestore.collection(APP.CONFIG.paths.bids).doc(bidNo).get()
        .then(function (snap) { return snap.exists ? snap.data() : null; });
    },

    setBid: function (bidNo, data) {
      return APP._firestore.collection(APP.CONFIG.paths.bids).doc(bidNo).set(data, { merge: true });
    },

    // items subcollection: bids/{bidNo}/items/{seq}
    getItems: function (bidNo) {
      return APP._firestore.collection(APP.CONFIG.paths.bids).doc(bidNo)
        .collection(APP.CONFIG.paths.itemsSub)
        .get()
        .then(function (qs) {
          var arr = [];
          qs.forEach(function (doc) {
            var d = doc.data();
            d._id = doc.id;
            arr.push(d);
          });
          return arr;
        });
    },

    upsertItemsBatch: function (bidNo, items) {
      var batch = APP._firestore.batch();
      var base = APP._firestore.collection(APP.CONFIG.paths.bids).doc(bidNo)
        .collection(APP.CONFIG.paths.itemsSub);

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var id = String(it.seq);
        batch.set(base.doc(id), it, { merge: true });
      }
      return batch.commit();
    },

// ★これを追加★ bids の status 更新（draft→open→closed）
updateBidStatus: function (bidNo, status) {
  return APP._firestore.collection(APP.CONFIG.paths.bids).doc(bidNo).update({
    status: status
  });
}
// ★ここまで追加★


    
  };
})(window);


