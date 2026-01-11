// [JST 2026-01-07 00] 00_config.js
// (番号付きコメントを追加しました)
// 変更点: 各セクションに識別用の番号 [00-xx] と詳細説明を追加。
(function (global) {
  global.APP = global.APP || {};

  // [00-01] アプリ設定オブジェクトのエントリ
  // ★ここを最初に編集する：Firebaseの設定
  // Firebase Console > プロジェクト設定 > あなたのアプリ > SDK設定 から貼る
  global.APP.CONFIG = {

    // [00-02] Firebase クライアント設定オブジェクト
    // ※注意: 公開リポジトリに置く場合は API キーの扱いに注意すること
    firebaseConfig: {
      // (以下はプロジェクト固有の値)
      // [00-02-01] apiKey: Firebase API キー（クライアント識別用、公開されることが多いが権限設定に注意）
      // [00-02-02] authDomain: 認証用ドメイン
      // [00-02-03] projectId: Firebase プロジェクト ID
      // [00-02-04] storageBucket: ストレージバケット名
      // [00-02-05] messagingSenderId: メッセージ送信者 ID
      // [00-02-06] appId: アプリケーション ID
      // [00-02-07] measurementId: Analytics 用 ID（任意）

  apiKey: "AIzaSyAAinuBPDNjxQ63TEgDnRjP2pfWIXRBrQ0",
  authDomain: "bidding-920b8.firebaseapp.com",
  projectId: "bidding-920b8",
  storageBucket: "bidding-920b8.firebasestorage.app",
  messagingSenderId: "554171859200",
  appId: "1:554171859200:web:1b1412a6a8c57fc9a4f3e5",
  measurementId: "G-HC01P1974L"
      
    },

    // [00-03] Firestore 内のコレクション/サブコレクション名を定義
    // 変更する場合は js/03_firestore.js 側の参照箇所も確認すること
    paths: {
      // [00-03-01] users: ユーザ情報コレクション
      users: "users",
      // [00-03-02] bids: 入札ヘッダコレクション（トップレベル）
      bids: "bids",
      // [00-03-03] itemsSub: bids/{bidId}/items のサブコレクション名
      itemsSub: "items",
      // [00-03-04] bidders: 入札参加者情報コレクション（必要に応じて利用）
      bidders: "bidders",
      // [00-03-05] offersSub: bids/{bidId}/bidders/{bidderId}/offers のサブコレクション名
      offersSub: "offers",
      // [00-03-06] linesSub: 入札内の行情報など（用途に合わせて利用）
      linesSub: "lines"
    },

    // [00-04] ヘッダーCSV の列定義（UI の CSV 解析に使用）
    // - index.html の説明に合わせ、貼り付け時の列順と意味を保持します
    headerCsv: {
      columns: [
        // [00-04-01] 入札番号（bidNo）
        "入札番号",
        // [00-04-02] 宛先1（会社名など）
        "宛先1",
        // [00-04-03] 宛先2（住所等の続き）
        "宛先2",
        // [00-04-04] 宛先3
        "宛先3",
        // [00-04-05] 入札年月日（公開フォーマットで期待する形式を検討）
        "入札年月日",
        // [00-04-06] 納入場所
        "納入場所",
        // [00-04-07] 納期
        "納期",
        // [00-04-08] 備考（任意）
        "備考"
      ]
    },

    // [00-05] 品目CSV の列定義（items CSV 解析に使用）
    itemCsv: {
      columns: [
        // [00-05-01] 入札番号（bidNo） - ヘッダーと一致させる
        "入札番号",
        // [00-05-02] 一連番号（行ID 相当）
        "一連番号",
        // [00-05-03] 見本（サンプルフラグなど）
        "見本",
        // [00-05-04] 品名
        "品名",
        // [00-05-05] 規格（サイズ/型番等）
        "規格",
        // [00-05-06] 予定数量
        "予定数量",
        // [00-05-07] 単位（個/箱 等）
        "単位",
        // [00-05-08] 備考
        "備考"
      ]
    },

    // [00-06] bids ドキュメントのデフォルト値
    // ここにデフォルトステータスや初期メタデータを定義しておく
    bidDefaults: {
      // [00-06-01] 初期ステータスは draft
      status: "draft"
    }
  };
})(window);
