// [JST 2026-01-07 00] 09_render.js
(function (global) {
  var APP = global.APP = global.APP || {};

  APP.Render = {
    renderAll: function () {
      APP.Render.renderAuth();
      APP.Render.renderBidInfo();
      APP.Render.renderHeaderPreview();
      APP.Render.renderItemsPreview();
    },

    renderAuth: function () {
      var st = APP.State.get();
      var s = "未ログイン";
      if (st.user) {
        s = "ログイン中: uid=" + st.user.uid + " / role=" + (st.role || "(role未設定)");
      }
      document.getElementById("authStatus").textContent = s;
      document.getElementById("btnLogout").disabled = !st.user;
    },

    renderBidInfo: function () {
      var st = APP.State.get();
      var txt = "状態：未選択";
      if (!APP.Util.isEmpty(st.bidNo)) {
        txt = "選択中 bidNo=" + st.bidNo
          + " / header=" + (st.header ? "あり" : "なし")
          + " / items=" + (st.items ? st.items.length : 0);
      }
      document.getElementById("bidInfo").textContent = txt;
    },

    renderHeaderPreview: function () {
      var st = APP.State.get();
      var el = document.getElementById("headerPreview");
      if (!st.header) {
        el.innerHTML = '<div class="muted">プレビュー：未解析</div>';
        return;
      }
      // 8項目だけ
      var h = st.header;
      el.innerHTML =
        '<div><strong>ヘッダー（編集は後で追加）</strong></div>' +
        '<div class="muted">入札番号: ' + (h.bidNo || "") + '</div>' +
        '<div>宛先1: ' + (h.to1 || "") + '</div>' +
        '<div>宛先2: ' + (h.to2 || "") + '</div>' +
        '<div>宛先3: ' + (h.to3 || "") + '</div>' +
        '<div>入札年月日: ' + (h.bidDate || "") + '</div>' +
        '<div>納入場所: ' + (h.deliveryPlace || "") + '</div>' +
        '<div>納期: ' + (h.dueDate || "") + '</div>' +
        '<div>備考: ' + (h.note || "") + '</div>';
    },

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
          '<td>' + (it.sample ? "○" : "") + '</td>' +
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

