// [JST 2026-01-07 00] 05_csv.js
(function (global) {
  var APP = global.APP = global.APP || {};

  // 最小CSVパーサ（カンマ区切り前提／引用符は最小対応）
  APP.CSV = {
    parse: function (text) {
      var lines = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
      var rows = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (APP.Util.trim(line) === "") continue;
        rows.push(APP.CSV._splitCsvLine(line));
      }
      return rows;
    },

    // ダブルクォートの基本処理のみ
    _splitCsvLine: function (line) {
      var out = [];
      var cur = "";
      var inQ = false;
      for (var i = 0; i < line.length; i++) {
        var ch = line.charAt(i);
        if (ch === '"') {
          // "" はエスケープ
          if (inQ && line.charAt(i + 1) === '"') {
            cur += '"';
            i++;
          } else {
            inQ = !inQ;
          }
        } else if (ch === "," && !inQ) {
          out.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      // trim
      for (var j = 0; j < out.length; j++) out[j] = APP.Util.trim(out[j]);
      return out;
    }
  };
})(window);
