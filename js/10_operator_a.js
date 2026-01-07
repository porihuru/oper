// [JST 2026-01-07 00] 10_operator_a.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.OperatorA = {
    parseHeaderCsv: function (text) {
      var rows = APP.CSV.parse(text);
      if (!rows.length) return { error: "ヘッダーCSVが空です。" };

      // 最小：1行目が列名の場合はスキップ（完全判定は後で強化）
      var r0 = rows[0];
      // 列数が多い/少ないは後で厳密化可能
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
        var sample = (sampleRaw === "1" || sampleRaw.toLowerCase() === "true" || sampleRaw === "○");

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

      // seq 昇順
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

      var bidDoc = {
        bidNo: bidNo,
        to1: st.header.to1,
        to2: st.header.to2,
        to3: st.header.to3,
        bidDate: st.header.bidDate,
        deliveryPlace: st.header.deliveryPlace,
        dueDate: st.header.dueDate,
        note: st.header.note,
        status: APP.CONFIG.bidDefaults.status,
        updatedAt: APP.Util.nowIso(),
        updatedByUid: st.user.uid
      };

      APP.State.setActionNote("保存中...");
      return APP.DB.setBid(bidNo, bidDoc)
        .then(function () {
          // items は bids/{bidNo}/items/{seq}
          // bidNoフィールドは不要だが、残しても良い。最小版は残す。
          return APP.DB.upsertItemsBatch(bidNo, st.items);
        })
        .then(function () {
          APP.State.setActionNote("保存完了: " + bidNo);
          APP.State.setMessage("", "保存しました（bids と items）。");
        })
        .catch(function (e) {
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
            // stateへ反映（header/items 形式へ変換）
            var header = {
              bidNo: bidNo,
              to1: bid.to1 || "",
              to2: bid.to2 || "",
              to3: bid.to3 || "",
              bidDate: bid.bidDate || "",
              deliveryPlace: bid.deliveryPlace || "",
              dueDate: bid.dueDate || "",
              note: bid.note || ""
            };
            // items整形
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
    }
  };
})(window);
