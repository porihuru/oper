// [JST 2026-01-07 00] 00_config.js
(function (global) {
  global.APP = global.APP || {};

  // ★ここを最初に編集する：Firebaseの設定
  // Firebase Console > プロジェクト設定 > あなたのアプリ > SDK設定 から貼る
  global.APP.CONFIG = {
    firebaseConfig: {
      // apiKey: "...",
      // authDomain: "...",
      // projectId: "...",
      // storageBucket: "...",
      // messagingSenderId: "...",
      // appId: "..."
    },

    // Firestore パス設計（固定）
    paths: {
      users: "users",
      bids: "bids",
      itemsSub: "items",
      bidders: "bidders",
      offersSub: "offers",
      linesSub: "lines"
    },

    // ヘッダーCSV（住所/会社名等は削除後の定義）
    headerCsv: {
      columns: [
        "入札番号",
        "宛先1",
        "宛先2",
        "宛先3",
        "入札年月日",
        "納入場所",
        "納期",
        "備考"
      ]
    },

    // 品目CSV 定義
    itemCsv: {
      columns: [
        "入札番号",
        "一連番号",
        "見本",
        "品名",
        "規格",
        "予定数量",
        "単位",
        "備考"
      ]
    },

    // bids の初期値
    bidDefaults: {
      status: "draft"
    }
  };
})(window);
