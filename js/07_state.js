// [JST 2026-01-15 21:00] 07_state.js
(function (global) {
  var APP = global.APP = global.APP || {};

  // ============================================================
  // [ST-00] アプリ状態（画面の単一ソース）
  // ============================================================
  var state = {
    user: null,
    role: null,
    bidNo: "",
    header: null,
    items: [],
    dirty: false
  };

  APP.State = {
    // ============================================================
    // [ST-01] 取得
    // ============================================================
    get: function () { return state; },

    // ============================================================
    // [ST-10] 全リセット（ログアウトや完全初期化向け）
    //   - bidNo/header/items を全て消す
    //   - 画面も全描画
    // ============================================================
    resetAll: function () {
      state.bidNo = "";
      state.header = null;
      state.items = [];
      state.dirty = false;
      APP.Render.renderAll();
    },

    // ============================================================
    // [ST-20] ★追加★ 新規として開始（重要）
    //   目的:
    //     - 既存入札を読込して closed/open が残っていても
    //       新規開始時に必ず draft になるようにする
    //   仕様:
    //     - bidNo が指定されていればセット（空でも可）
    //     - header を「初期テンプレ」で作成し status="draft" を固定
    //     - items は空にする
    //     - 描画更新
    // ============================================================
    startNewBid: function (bidNo) {
      // [ST-20-1] bidNo
      state.bidNo = bidNo || "";

      // [ST-20-2] header を必ず新規生成（前回の status を引き継がない）
      state.header = {
        bidNo: state.bidNo,
        to1: "",
        to2: "",
        to3: "",
        bidDate: "",
        deliveryPlace: "",
        dueDate: "",

        // ★備考1〜5（あなたの拡張仕様）
        note1: "",
        note2: "",
        note3: "",
        note4: "",
        note5: "",

        // ★最重要★ 新規は必ず draft
        status: "draft"
      };

      // [ST-20-3] items 初期化
      state.items = [];
      state.dirty = false;

      // [ST-20-4] 画面更新
      APP.Render.renderAll();

      // [ST-20-5] 上部/ログにも状況を出す（任意だが実務上便利）
      // ここは既存の表示仕様に合わせ、必要最小限で入れている
      if (APP.State.setActionNote) APP.State.setActionNote("新規開始: " + (state.bidNo || "(bidNo未設定)") + "（status=draft）");
      if (APP.State.setMessage) APP.State.setMessage("", "新規として開始しました。（status=draft）");
    },

    // ============================================================
    // [ST-30] ユーザー設定
    // ============================================================
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

    // ============================================================
    // [ST-40] bidNo 設定
    // ============================================================
    setBidNo: function (bidNo) {
      state.bidNo = bidNo || "";
      state.dirty = true;
      APP.Render.renderBidInfo();
    },

    // ============================================================
    // [ST-50] header 設定
    //   [ST-50-1] ★保険★ header.status が無ければ draft を補う
    //     - 古いデータ/旧コード経由でも status 未設定を防ぐ
    // ============================================================
    setHeader: function (headerObj) {
      // null/undefined も許容
      state.header = headerObj || null;

      // ★保険（重要）: header があるのに status が無い → draft にする
      if (state.header && (state.header.status == null || state.header.status === "")) {
        state.header.status = "draft";
      }

      state.dirty = true;
      APP.Render.renderHeaderPreview();
      APP.Render.renderBidInfo();
    },

    // ============================================================
    // [ST-60] items 設定
    // ============================================================
    setItems: function (itemsArr) {
      state.items = itemsArr || [];
      state.dirty = true;
      APP.Render.renderItemsPreview();
    },

    // ============================================================
    // [ST-70] メッセージ表示（上部）
    // ============================================================
    setMessage: function (err, ok) {
      var elE = document.getElementById("topError");
      var elO = document.getElementById("topOk");
      elE.textContent = err || "";
      elO.textContent = ok || "";
    },

    // ============================================================
    // [ST-80] ログ表示（下部）
    // ============================================================
    setActionNote: function (msg) {
      document.getElementById("actionNote").textContent = "ログ：" + (msg || "なし");
    }
  };
})(window);
