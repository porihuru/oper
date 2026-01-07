// [JST 2026-01-07 00] 06_validation.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.Validation = {
    requireBidNo: function (bidNo) {
      if (APP.Util.isEmpty(bidNo)) return "入札番号（bidNo）が空です。";
      return null;
    },

    // ヘッダーbidNoと品目bidNoの一致
    matchBidNo: function (headerBidNo, itemBidNo) {
      if (APP.Util.isEmpty(headerBidNo) || APP.Util.isEmpty(itemBidNo)) return null;
      if (String(headerBidNo) !== String(itemBidNo)) {
        return "ヘッダーCSVの入札番号と品目CSVの入札番号が一致しません。";
      }
      return null;
    },

    // seq重複
    checkDupSeq: function (items) {
      var map = {};
      for (var i = 0; i < items.length; i++) {
        var seq = String(items[i].seq);
        if (map[seq]) return "一連番号（seq）が重複しています: " + seq;
        map[seq] = true;
      }
      return null;
    }
  };
})(window);
