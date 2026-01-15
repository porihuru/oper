// [JST 2026-01-13 21:15] 09_render.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.Render = {
    // ============================================================
    // [RENDER-00] 全体描画
    // ============================================================
    renderAll: function () {
      APP.Render.renderAuth();
      APP.Render.renderBidInfo();
      APP.Render.renderHeaderPreview();
      APP.Render.renderItemsPreview();
    },

    // ============================================================
    // [RENDER-10] 認証状態表示
    // ============================================================
    renderAuth: function () {
      var st = APP.State.get();
      var s = "未ログイン";
      if (st.user) {
        s = "ログイン中: uid=" + st.user.uid + " / role=" + (st.role || "(role未設定)");
      }
      document.getElementById("authStatus").textContent = s;
      document.getElementById("btnLogout").disabled = !st.user;
    },

    // ============================================================
    // [RENDER-20] 入札選択情報（上部の「選択中 bidNo=...」）
    //   [RENDER-BI-01] ★修正★ status を併記
    // ============================================================
    renderBidInfo: function () {
      var st = APP.State.get();
      var txt = "状態：未選択";
      if (!APP.Util.isEmpty(st.bidNo)) {

        // [RENDER-BI-01] ★追加★ status を表示（headerがあれば header.status を優先）
        var status = "(未取得)";
        if (st.header && st.header.status) status = st.header.status;

        txt = "選択中 bidNo=" + st.bidNo
          + " / status=" + status
          + " / header=" + (st.header ? "あり" : "なし")
          + " / items=" + (st.items ? st.items.length : 0);
      }
      document.getElementById("bidInfo").textContent = txt;
    },

    // ============================================================
    // [RENDER-30] ヘッダープレビュー
    //   [RENDER-HP-01] ★修正★ 備考を備考1〜5に拡張（後方互換あり）
    // ============================================================
    renderHeaderPreview: function () {
      var st = APP.State.get();
      var el = document.getElementById("headerPreview");
      if (!st.header) {
        el.innerHTML = '<div class="muted">プレビュー：未解析</div>';
        return;
      }

      var h = st.header;

      // [RENDER-HP-01] ★追加★ 備考1〜5（旧noteのみでも表示できるよう互換）
      var n1 = (h.note1 != null) ? (h.note1 || "") : (h.note || "");
      var n2 = (h.note2 || "");
      var n3 = (h.note3 || "");
      var n4 = (h.note4 || "");
      var n5 = (h.note5 || "");

      el.innerHTML =
        '<div><strong>ヘッダー（編集は後で追加）</strong></div>' +
        '<div class="muted">入札番号: ' + (h.bidNo || "") + '</div>' +
        '<div>宛先1: ' + (h.to1 || "") + '</div>' +
        '<div>宛先2: ' + (h.to2 || "") + '</div>' +
        '<div>宛先3: ' + (h.to3 || "") + '</div>' +
        '<div>入札年月日: ' + (h.bidDate || "") + '</div>' +
        '<div>納入場所: ' + (h.deliveryPlace || "") + '</div>' +
        '<div>納期: ' + (h.dueDate || "") + '</div>' +
        '<div>備考1: ' + n1 + '</div>' +
        '<div>備考2: ' + n2 + '</div>' +
        '<div>備考3: ' + n3 + '</div>' +
        '<div>備考4: ' + n4 + '</div>' +
        '<div>備考5: ' + n5 + '</div>';
    },

    // ============================================================
    // [RENDER-40] 品目プレビュー（現状変更なし）
    // ============================================================
    renderItemsPreview: function () {
      var st = APP.State.get();
      var el = document.getElementById("itemsPreview");
      if (!st.items || st.items.length === 0) {
        el.innerHTML = '<div class="muted">プレビュー：未解析</div>';
        return;
      }
      var html = '<table><thead><tr>' +
        '<th>seq</th><th>見本</th><th>品名</th><th>規格</th><th>予定数量</th><th>単位</th><th>備考</th>' +
        '</tr></thead><tbody>';

      for (var i = 0; i < st.items.length; i++) {
        var it = st.items[i];
        html += '<tr>' +
          '<td>' + it.seq + '</td>' +
          '<td>' + (it.sample ? "〇" : "") + '</td>' +
          '<td>' + (it.name || "") + '</td>' +
          '<td>' + (it.spec || "") + '</td>' +
          '<td>' + (it.qty == null ? "" : it.qty) + '</td>' +
          '<td>' + (it.unit || "") + '</td>' +
          '<td>' + (it.note || "") + '</td>' +
          '</tr>';
      }
      html += '</tbody></table>';
      el.innerHTML = html;
    }
  };
})(window);
