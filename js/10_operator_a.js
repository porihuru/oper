// [JST 2026-01-12 10:xx] 10_operator_a.js
// ============================================================
// 取扱者（OperatorA）画面ロジック
// ------------------------------------------------------------
// [OP-A-00] 目的:
//   - ヘッダーCSV / 品目CSV の解析
//   - 「決定（登録/更新）」で bids と items を保存
//   - 状態変更（draft→open→closed）
//   - 画面に「現在の入札状態」を常に表示（メッセージ欄＋ログ欄）
// ------------------------------------------------------------
// [OP-A-01] 修正方針（後で直しやすいように番号付け）:
//   - [OP-A-20] showBidStatus() を追加（状態の常時表示の核）
//   - [OP-A-40] commit() で「決定押下」「保存中止」時に必ず状態表示
//   - [OP-A-50] loadBid() で「読込」時に必ず状態表示
//   - [OP-A-60] setBidStatus() で「状態変更」時に必ず状態表示
// ============================================================

(function (global) {
  var APP = global.APP = global.APP || {};

  APP.OperatorA = {

    // ============================================================
    // [OP-A-10] ヘッダーCSV解析
    //   - 1行目が見出し（入札番号）なら2行目を採用
    //   - bidNo 必須チェック
    // ============================================================
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

    // ============================================================
    // [OP-A-11] 品目CSV解析
    //   - 見本列: ○/〇/◯/1/true を true 扱い
    //   - seq（1連番号）必須・数値チェック
    //   - seq昇順ソート
    // ============================================================
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

        // [OP-A-11-1] ○/〇/◯/1/true を「見本=true」扱い
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

    // ============================================================
    // [OP-A-20] 現在の入札状態を「常に」表示（メッセージ欄＋ログ欄）
    //   - 表示場所①: APP.State.setMessage("", "...") の場所
    //   - 表示場所②: APP.Util.log("...") のログ欄
    // ------------------------------------------------------------
    // 引数:
    //   bidNo  : 入札番号（表示用）
    //   status : "draft" / "open" / "closed"（表示用）
    //   reason : "読込" / "決定押下" / "保存中止" / "状態変更" 等
    // ============================================================
    showBidStatus: function (bidNo, status, reason) {
      var s = status || "(不明)";
      var r = reason ? (" / " + reason) : "";

      // [OP-A-20-1] メッセージ欄に常時表示（他メッセージで上書きされる点は仕様）
      APP.State.setMessage(
        "",
        "現在の入札状態： " + s +
        "（draft=編集中 / open=入札中 / closed=終了）" +
        (bidNo ? (" / bidNo=" + bidNo) : "") +
        r
      );

      // [OP-A-20-2] ログ欄にも必ず残す（保存中止などの追跡用）
      APP.Util.log(
        "[status] " + (bidNo ? bidNo : "-") + " status=" + s + (reason ? (" (" + reason + ")") : "")
      );
    },

// ============================================================
// [OP-A-21] 初期表示（ページ起動直後）
//   - まだ bidNo を読込していない状態でも、ユーザーに現在状況を提示する
//   - 表示場所①（メッセージ欄）と表示場所②（ログ欄）の両方に出す
// ============================================================
initStatusBanner: function () {
  try {
    var st = APP.State.get();

    // bidNo / status が分かっていれば表示、無ければ「未読込」を表示
    var bidNo = (st && st.header && st.header.bidNo) ? st.header.bidNo : (st && st.bidNo ? st.bidNo : "");
    var status = (st && st.header && st.header.status) ? st.header.status : "";

    if (bidNo && status) {
      APP.OperatorA.showBidStatus(bidNo, status, "初期表示");
    } else if (bidNo && !status) {
      APP.OperatorA.showBidStatus(bidNo, "(状態未取得)", "初期表示");
    } else {
      APP.OperatorA.showBidStatus("", "未読込", "初期表示（入札番号未設定）");
    }
  } catch (e) {
    // 初期表示で例外が出ても動作を止めない
    if (APP && APP.Util && APP.Util.log) APP.Util.log("[initStatusBanner] EX: " + (e && e.message ? e.message : e));
  }
},



    

    // ============================================================
    // [OP-A-40] 決定（登録/更新）
    //   - 事前チェック（ログイン/権限/ヘッダー/品目/番号一致/重複）
    //   - 既存bids/{bidNo} を取得して status を確認
    //   - operator は draft の間だけ更新可能（open/closed は中止）
    //   - status は勝手に変えない（既存は維持 / 新規はデフォルト）
    //   - bids 保存 → items 一括 upsert
    //   - ここで「現在状態」を必ず表示（決定押下 / 保存中止）
    // ============================================================
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

      APP.State.setActionNote("保存準備中...");

      // [OP-A-40-1] 既存bidを取得して、status と存在有無を確認
      return APP.DB.getBid(bidNo)
        .then(function (existing) {
          var exists = !!existing;
          var currentStatus = exists ? (existing.status || "") : "";

          // [OP-A-40-2] 「決定押下」時点で現在状態を必ず表示
          APP.OperatorA.showBidStatus(bidNo, exists ? currentStatus : "draft", "決定押下");

          // [OP-A-40-3] operator は draft の間だけ更新可能
          if (st.role === "operator" && exists && currentStatus !== "draft") {
            // [OP-A-40-3a] 保存中止理由を「常に」表示（メッセージ欄＋ログ欄）
            APP.OperatorA.showBidStatus(bidNo, currentStatus, "保存中止");

            APP.State.setActionNote("保存中止（status=" + currentStatus + "）");
            return APP.State.setMessage(
              "保存できません：入札が draft ではありません（status=" + currentStatus + "）。\n" +
              "入札開始(open)/終了(closed)後は、取扱者は更新できない仕様です。",
              ""
            );
          }

          // [OP-A-40-4] status は commit で勝手に変えない（既存は維持 / 新規はデフォルト）
          var statusToWrite = exists
            ? (existing.status || APP.CONFIG.bidDefaults.status)
            : APP.CONFIG.bidDefaults.status;

          // [OP-A-40-5] bids に保存するドキュメント（ヘッダー＋状態＋更新者）
          var bidDoc = {
            bidNo: bidNo,
            to1: st.header.to1,
            to2: st.header.to2,
            to3: st.header.to3,
            bidDate: st.header.bidDate,
            deliveryPlace: st.header.deliveryPlace,
            dueDate: st.header.dueDate,
            note: st.header.note,

            status: statusToWrite,               // ★ポイント：draft維持でも許可されるルールに修正済み
            updatedAt: APP.Util.nowIso(),
            updatedByUid: st.user.uid
          };

          APP.State.setActionNote("保存中...");

          // [OP-A-40-6] bids 保存 → items 一括 upsert
          return APP.DB.setBid(bidNo, bidDoc)
            .then(function () {
              return APP.DB.upsertItemsBatch(bidNo, st.items);
            })
            .then(function () {
              APP.State.setActionNote("保存完了: " + bidNo);
              APP.State.setMessage("", "保存しました（bids と items）。");

              // [OP-A-40-7] state.header.status を最新化（表示の整合用）
              var latest = APP.State.get();
              if (latest.header) {
                latest.header.status = statusToWrite;
                APP.State.setHeader(latest.header);
              }

              // [OP-A-40-8] 保存完了後も「現在状態」を残したい場合はここで再表示してもよい
              // ただし、直後の setMessage() と競合するため、必要なら以下を有効化してください。
              // APP.OperatorA.showBidStatus(bidNo, statusToWrite, "保存完了");
            });
        })
        .catch(function (e) {
          var msg =
            (e && e.message) ? e.message :
              (typeof e === "string") ? e :
                JSON.stringify(e);

          console.error("[commit] FAILED:", e);
          APP.State.setActionNote("保存失敗");
          APP.State.setMessage("保存エラー: " + msg, "");
        });
    },

    // ============================================================
    // [OP-A-50] 入札読込（bids + items）
    //   - bids/{bidNo} を取得
    //   - items を取得
    //   - state に反映
    //   - 読込時に「現在状態」を必ず表示
    // ============================================================
    loadBid: function (bidNo) {
      APP.State.setMessage("", "");

  // ★追加★：読込ボタン押下直後に、即時ステータス表示（まだ未取得なので「取得中」）
  // 表示場所①：メッセージ欄（状態表示）
  // 表示場所②：ログ欄
  if (!APP.Util.isEmpty(bidNo)) {
    APP.OperatorA.showBidStatus(bidNo, "取得中...", "既存データ読込（開始）");
  }
      
      if (APP.Util.isEmpty(bidNo)) return APP.State.setMessage("入札番号が空です。", "");

      APP.State.setActionNote("読込中...");
      return APP.DB.getBid(bidNo)
        .then(function (bid) {
          if (!bid) throw new Error("bids/" + bidNo + " が見つかりません。");
          return APP.DB.getItems(bidNo).then(function (items) {

            // [OP-A-50-1] state に入れる header を構築
            var header = {
              bidNo: bidNo,
              to1: bid.to1 || "",
              to2: bid.to2 || "",
              to3: bid.to3 || "",
              bidDate: bid.bidDate || "",
              deliveryPlace: bid.deliveryPlace || "",
              dueDate: bid.dueDate || "",
              note: bid.note || "",
              status: bid.status || ""   // ★status を保持
            };

            // [OP-A-50-2] 読込時に「現在状態」を必ず表示（※オブジェクトの外で呼ぶのが正しい）
            APP.OperatorA.showBidStatus(bidNo, header.status, "読込");

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

    // ============================================================
    // [OP-A-60] 入札の状態を変更（draft→open→closed）
    //   - newStatus は open または closed のみ許可
    //   - 状態変更成功時に「現在状態」を必ず表示
    // ============================================================
    setBidStatus: function (newStatus) {
      try {
        var st = APP.State.get();
        APP.State.setMessage("", "");

        // [OP-A-60-1] すでに同じ状態なら終了
        if (st.header && st.header.status && st.header.status === newStatus) {
          return APP.State.setMessage("", "すでに " + newStatus + " です。");
        }

        // [OP-A-60-2] 権限チェック
        if (!st.user) return APP.State.setMessage("未ログインです。", "");
        if (st.role !== "operator" && st.role !== "admin") {
          return APP.State.setMessage("権限がありません（operator/adminのみ）。", "");
        }

        // [OP-A-60-3] bidNo 取得
        var bidNo = (st.header && st.header.bidNo) ? st.header.bidNo : st.bidNo;
        if (APP.Util.isEmpty(bidNo)) {
          return APP.State.setMessage("入札番号がありません。先にヘッダー解析または入札番号入力をしてください。", "");
        }

        // [OP-A-60-4] newStatus 検証
        if (newStatus !== "open" && newStatus !== "closed") {
          return APP.State.setMessage("不正な状態です: " + newStatus, "");
        }

        APP.State.setActionNote("状態更新中...");

        // [OP-A-60-5] Firestore 更新
        return APP.DB.updateBidStatus(bidNo, newStatus)
          .then(function () {
            APP.Util.log("[setBidStatus] updateBidStatus OK");
            APP.State.setActionNote("状態更新完了: " + newStatus);

            // [OP-A-60-6] 状態変更直後に必ず表示（loadBidでも再表示される）
            APP.OperatorA.showBidStatus(bidNo, newStatus, "状態変更");

            APP.State.setMessage("", "状態を更新しました: " + newStatus);

            // [OP-A-60-7] 再読込して画面の整合を取る
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
  };


// ============================================================
// [OP-A-90] 起動時：最初に「現在状況」を必ず表示
//   - DOM や他JSの初期化順の影響を避けるため setTimeout で1tick遅延
// ============================================================
setTimeout(function () {
  if (window.APP && window.APP.OperatorA && typeof window.APP.OperatorA.initStatusBanner === "function") {
    window.APP.OperatorA.initStatusBanner();
  }
}, 0);


  
})(window);


