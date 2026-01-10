// [JST 2026-01-10 00] 10_operator_a.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.OperatorA = {
    parseHeaderCsv: function (text) {
      var rows = APP.CSV.parse(text);
      if (!rows.length) return { error: "ヘッダーCSVが空です。" };

      var r0 = rows[0];
      var bidNo = r0[0];
      if (bidNo === "入札番号") {
        if (rows.length < 2) return { error: "ヘッダーCSVにデータ行がありません。" };
        r0 = rows[1];
      }

      var header = {
        bidNo: APP.Util.trim(r0[0] || ""),
        to1: APP.Util.trim(r0[1] || ""),
        to2: APP.Util.trim(r0[2] || ""),
        to3: APP.Util.trim(r0[3] || ""),
        bidDate: APP.Util.trim(r0[4] || ""),
        deliveryPlace: APP.Util.trim(r0[5] || ""),
        dueDate: APP.Util.trim(r0[6] || ""),
        note: APP.Util.trim(r0[7] || "")
      };

      var err = APP.Validation.requireBidNo(header.bidNo);
      if (err) return { error: err };

      return { header: header };
    },

    parseItemsCsv: function (text) {
      var rows = APP.CSV.parse(text);
      if (!rows.length) return { error: "品目CSVが空です。" };

      var start = 0;
      if (rows[0][0] === "入札番号") start = 1;

      var items = [];
      for (var i = start; i < rows.length; i++) {
        var r = rows[i];
        var bidNo = APP.Util.trim(r[0] || "");
        var seq = APP.Util.toNumberOrNull(r[1]);

        var sampleRaw = APP.Util.trim(r[2] || "");

        // ★修正★：○/〇/◯/1/true を「見本=true」扱い
        var sr = sampleRaw;
        var sample =
          (sr === "1") ||
          (String(sr).toLowerCase() === "true") ||
          (sr === "○") || (sr === "〇") || (sr === "◯");

        var it = {
          bidNo: bidNo,
          seq: seq,
          sample: sample,
          name: APP.Util.trim(r[3] || ""),
          spec: APP.Util.trim(r[4] || ""),
          qty: APP.Util.toNumberOrNull(r[5]),
          unit: APP.Util.trim(r[6] || ""),
          note: APP.Util.trim(r[7] || ""),
          updatedAt: APP.Util.nowIso()
        };
        if (it.seq == null) return { error: "一連番号（seq）が数値ではありません（行 " + (i + 1) + "）。" };
        items.push(it);
      }

      items.sort(function (a, b) { return a.seq - b.seq; });
      return { items: items };
    },

    commit: function () {
      var st = APP.State.get();
      APP.State.setMessage("", "");

      if (!st.user) return APP.State.setMessage("未ログインです。", "");
      if (st.role !== "operator" && st.role !== "admin") {
        return APP.State.setMessage("取扱者権限がありません（role=" + st.role + "）。", "");
      }
      if (!st.header) return APP.State.setMessage("ヘッダーが未解析です。", "");
      if (!st.items || st.items.length === 0) return APP.State.setMessage("品目が未解析です。", "");

      var err = APP.Validation.matchBidNo(st.header.bidNo, st.items[0].bidNo);
      if (err) return APP.State.setMessage(err, "");

      err = APP.Validation.checkDupSeq(st.items);
      if (err) return APP.State.setMessage(err, "");

      var bidNo = st.header.bidNo;

      // ★重要修正★：status を固定で上書きしない
      // - loadBid 済みなら st.header.status に現在の status が入っている
      // - 新規（まだ status 不明）のときだけ default(draft) を使う
      var currentStatus = (st.header && st.header.status) ? st.header.status : null;

      var bidDoc = {
        bidNo: bidNo,
        to1: st.header.to1,
        to2: st.header.to2,
        to3: st.header.to3,
        bidDate: st.header.bidDate,
        deliveryPlace: st.header.deliveryPlace,
        dueDate: st.header.dueDate,
        note: st.header.note,

        // ★ここがポイント★
        status: currentStatus || APP.CONFIG.bidDefaults.status,

        updatedAt: APP.Util.nowIso(),
        updatedByUid: st.user.uid
      };


      
    APP.State.setActionNote("保存中...");

return APP.DB.setBid(bidNo, bidDoc)
  .then(function () {
    // ★どこまで通ったか確認するログ
    APP.Util.log("[commit] setBid OK: bids/" + bidNo);
    return APP.DB.upsertItemsBatch(bidNo, st.items);
  })
  .then(function () {
    APP.Util.log("[commit] upsertItemsBatch OK: bids/" + bidNo + "/items/*");
    APP.State.setActionNote("保存完了: " + bidNo);
    APP.State.setMessage("", "保存しました（bids と items）。");
    return APP.OperatorA.loadBid(bidNo);
  })
  .catch(function (e) {
    console.error("[commit] FAILED:", e);
    APP.State.setActionNote("保存失敗");
    APP.State.setMessage("保存エラー: " + (e && e.message ? e.message : e), "");
  });



      
    },

    loadBid: function (bidNo) {
      APP.State.setMessage("", "");
      if (APP.Util.isEmpty(bidNo)) return APP.State.setMessage("入札番号が空です。", "");

      APP.State.setActionNote("読込中...");
      return APP.DB.getBid(bidNo)
        .then(function (bid) {
          if (!bid) throw new Error("bids/" + bidNo + " が見つかりません。");
          return APP.DB.getItems(bidNo).then(function (items) {

            // ★ここで status も state.header に載せる
            var header = {
              bidNo: bidNo,
              to1: bid.to1 || "",
              to2: bid.to2 || "",
              to3: bid.to3 || "",
              bidDate: bid.bidDate || "",
              deliveryPlace: bid.deliveryPlace || "",
              dueDate: bid.dueDate || "",
              note: bid.note || "",
              status: bid.status || ""   // ★追加（カンマ必須）
            };

            items.sort(function (a, b) { return Number(a.seq) - Number(b.seq); });
            APP.State.setBidNo(bidNo);
            APP.State.setHeader(header);
            APP.State.setItems(items);
            APP.State.setActionNote("読込完了: " + bidNo);
            APP.State.setMessage("", "読込しました。");
          });
        })
        .catch(function (e) {
          APP.State.setActionNote("読込失敗");
          APP.State.setMessage("読込エラー: " + (e && e.message ? e.message : e), "");
        });
    },

    // ★これを追加★：入札の状態を変更（draft→open→closed）
    setBidStatus: function (newStatus) {
      try {
        var st = APP.State.get();
        APP.State.setMessage("", "");

        // すでに同じ状態なら何もしない（Rules拒否/二重クリック対策）
        if (st.header && st.header.status && st.header.status === newStatus) {
          return APP.State.setMessage("", "すでに " + newStatus + " です。");
        }

        if (!st.user) return APP.State.setMessage("未ログインです。", "");
        if (st.role !== "operator" && st.role !== "admin") {
          return APP.State.setMessage("権限がありません（operator/adminのみ）。", "");
        }

        var bidNo = (st.header && st.header.bidNo) ? st.header.bidNo : st.bidNo;
        if (APP.Util.isEmpty(bidNo)) {
          return APP.State.setMessage("入札番号がありません。先にヘッダー解析または入札番号入力をしてください。", "");
        }

        if (newStatus !== "open" && newStatus !== "closed") {
          return APP.State.setMessage("不正な状態です: " + newStatus, "");
        }

        APP.State.setActionNote("状態更新中...");
        return APP.DB.updateBidStatus(bidNo, newStatus)
          .then(function () {
            APP.Util.log("[setBidStatus] updateBidStatus OK");
            APP.State.setActionNote("状態更新完了: " + newStatus);
            APP.State.setMessage("", "状態を更新しました: " + newStatus);
            return APP.OperatorA.loadBid(bidNo);
          })
          .catch(function (e) {
            var msg =
              (e && e.message) ? e.message :
              (typeof e === "string") ? e :
              JSON.stringify(e);

            console.error("[setBidStatus] FAILED:", e);
            APP.Util.log("[setBidStatus] FAILED: " + msg);

            APP.State.setActionNote("状態更新失敗");
            APP.State.setMessage("状態更新に失敗: " + msg, "");
          });

      } catch (e) {
        APP.State.setMessage("状態更新で例外: " + (e && e.message ? e.message : e), "");
      }
    }
    // ★ここまで追加★
  };
})(window);

