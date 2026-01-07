// [JST 2026-01-07 01] 08_ui_bind.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.UI = {
    bind: function () {

// ★これを追加★：OperatorA が未読込なら即エラー表示
function requireOperatorA() {
  if (!APP.OperatorA) {
    APP.State.setMessage("OperatorA が未定義です。10_operator_a.js の読込失敗(404/構文エラー)を確認してください。", "");
    return false;
  }
  if (typeof APP.OperatorA.loadBid !== "function") {
    APP.State.setMessage("OperatorA.loadBid が未定義です。10_operator_a.js の内容/キャッシュを確認してください。", "");
    return false;
  }
  return true;
}
// ★ここまで追加★
    
      // ログイン（メール/パスワード）
      document.getElementById("btnLogin").addEventListener("click", function () {
        try {
          var email = document.getElementById("emailInput").value;
          var pass = document.getElementById("passInput").value;

          APP.Auth.loginEmailPassword(email, pass)
            .then(function () {
              APP.State.setMessage("", "ログインしました。");
            })
            .catch(function (e) {
              APP.State.setMessage("ログイン失敗: " + (e && e.message ? e.message : e), "");
            });
        } catch (e) {
          APP.State.setMessage("ログイン処理で例外: " + (e && e.message ? e.message : e), "");
        }
      });

      document.getElementById("btnLogout").addEventListener("click", function () {
        APP.Auth.logout();
      });

      document.getElementById("btnReset").addEventListener("click", function () {
        location.reload();
      });

      document.getElementById("bidNoInput").addEventListener("input", function (e) {
        APP.State.setBidNo(e.target.value);
      });

      document.getElementById("btnNewBid").addEventListener("click", function () {
        var bidNo = document.getElementById("bidNoInput").value;
        APP.State.setBidNo(bidNo);
        APP.State.setHeader(null);
        APP.State.setItems([]);
        APP.State.setMessage("", "新規モードにしました。ヘッダーCSVと品目CSVを貼って解析してください。");
      });

      document.getElementById("btnParseHeader").addEventListener("click", function () {
        var text = document.getElementById("headerCsv").value;
        var res = APP.OperatorA.parseHeaderCsv(text);
        if (res.error) return APP.State.setMessage(res.error, "");
        APP.State.setBidNo(res.header.bidNo);
        APP.State.setHeader(res.header);
        APP.State.setMessage("", "ヘッダーを解析しました。");
      });

      document.getElementById("btnClearHeader").addEventListener("click", function () {
        document.getElementById("headerCsv").value = "";
        APP.State.setHeader(null);
      });

      document.getElementById("btnParseItems").addEventListener("click", function () {
        var text = document.getElementById("itemsCsv").value;
        var res = APP.OperatorA.parseItemsCsv(text);
        if (res.error) return APP.State.setMessage(res.error, "");
        APP.State.setItems(res.items);

        // bidNoチェック（ヘッダーがあれば一致確認）
        var st = APP.State.get();
        if (st.header && st.items.length) {
          var err = APP.Validation.matchBidNo(st.header.bidNo, st.items[0].bidNo);
          if (err) return APP.State.setMessage(err, "");
        }
        APP.State.setMessage("", "品目を解析しました。");
      });

      document.getElementById("btnClearItems").addEventListener("click", function () {
        document.getElementById("itemsCsv").value = "";
        APP.State.setItems([]);
      });

      document.getElementById("btnCheckDup").addEventListener("click", function () {
        var st = APP.State.get();
        var err = APP.Validation.checkDupSeq(st.items || []);
        if (err) return APP.State.setMessage(err, "");
        APP.State.setMessage("", "重複はありません。");
      });

      document.getElementById("btnCommit").addEventListener("click", function () {
        APP.OperatorA.commit();
      });

      document.getElementById("btnLoadBid").addEventListener("click", function () {
        var bidNo = document.getElementById("bidNoInput").value;
        APP.OperatorA.loadBid(bidNo);
      });

      // ★これを追加★：入札開始
      document.getElementById("btnOpenBid").addEventListener("click", function () {
        APP.OperatorA.setBidStatus("open");
      });

      // ★これを追加★：入札終了
      document.getElementById("btnCloseBid").addEventListener("click", function () {
        APP.OperatorA.setBidStatus("closed");
      });
      // ★ここまで追加★

      document.getElementById("btnReload").addEventListener("click", function () {
        var st = APP.State.get();
        if (!st.header || APP.Util.isEmpty(st.header.bidNo)) {
          return APP.State.setMessage("読込対象の入札番号がありません。", "");
        }
        APP.OperatorA.loadBid(st.header.bidNo);
      });
    }
  };
})(window);


