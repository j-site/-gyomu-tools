# CRASTORE 業務ツール — 作業ガイド（Claude向け）

このリポジトリは株式会社Crastoreの業務ツール集です。GitHub Pagesで公開しています。
- 公開URL: https://j-site.github.io/-gyomu-tools/

## 見積書・請求書の発行（最重要・スマホ運用の中心）

書類の発行は **`documents/<書類No>.json` を1つ追加するだけ** です。
追加後、以下のURLでスマホ等から表示・PDF保存できます（PDFはブラウザの「印刷→PDFで保存」）。

```
https://j-site.github.io/-gyomu-tools/estimate.html?doc=<書類No>
（末尾に &print=1 を付けると自動で印刷ダイアログを開く）
```

レンダリングは `estimate.html` が担当（御見積/御請求テンプレを忠実再現。ロゴ・QR・会社情報・
銀行口座・適格請求書番号 T9122001026672 はテンプレに固定済み）。**JSONには工事内容だけ書く。**

### documents/<書類No>.json のスキーマ

```json
{
  "type": "invoice",                  // "estimate"(見積書) か "invoice"(請求書)
  "date": "2026/06/09",               // 発行日
  "clientName": "株式会社ひまわり",     // 宛名
  "honorific": "御中",                 // 敬称: "御中"(法人・デフォルト) または "様"(個人)。省略時は"御中"
  "docNo": "IV260609002",             // 書類No（ファイル名と一致させる）
  "siteAddr": "大阪市西成区萩ノ茶屋2-5-8",
  "workName": "内装工事",
  "validUntil": "発行より2週間",        // 見積書のみ。請求書では省略可
  "remark": "クロス工事等は省いています", // 備考（任意）
  "taxRate": 10,                       // 消費税率(%)。通常10
  "items": [
    { "detail": "サッシ取付工事", "qty": 2, "unit": "カ所", "price": 48000 },
    { "detail": "諸経費 一式",    "unit": "式", "amount": 20000 }
  ]
}
```

- 明細1行 = `{detail, qty, unit, price}`。金額は `qty×price` で自動計算。
- 「一式」など数量が無い行 = `{detail, unit:"式", amount: 金額}`（`amount`を直接指定）。
- 小計・消費税・合計は自動計算。ファイル名は必ず `<docNo>.json`。

### 領収書（type: "receipt"）
領収書は明細ではなく**税込金額を直接指定**する。スキーマ:
```json
{
  "type": "receipt",
  "date": "2026/06/15",
  "clientName": "株式会社ひまわり",
  "honorific": "御中",
  "docNo": "RC260615003",
  "workName": "内装工事",
  "amount": 686400,          // 領収金額（税込）。税抜・消費税内訳は自動計算
  "tadashi": "内装工事",      // 但し書き（「但し ◯◯代として」の◯◯部分）
  "taxRate": 10
}
```

### 入金ステータス（請求書）
`documents/index.json` の請求書エントリに `"status": "unpaid"` / `"paid"` を付けると
一覧ページで「未入金/入金済」バッジが表示される。**入金確認の連絡を受けたら paid に更新する。**

### 顧客マスタ
`documents/clients.json` = `[{ "name", "honorific", "addr" }]`。
estimate.html の顧客選択プルダウンに反映される。新規顧客の書類を作ったらここにも追記する。

### 書類No（番号）ルール
- 見積書 = **MS** / 請求書 = **IV** / 領収書 = **RC** で始まる
- 形式 = `接頭辞 + 発行日YYMMDD + 3桁連番`
- 連番は **案件（顧客）ごとの通し番号**。見積→請求で増える。
  例: 見積 `MS260513001` → 同案件の請求 `IV260609002`。
- 番号が指定されていれば従う。不明なら採番方針をユーザーに確認する。

### 重要な注意
- **請求書は見積書と内容が異なることがある**（追加・変更項目など）。
  見積から機械的にコピーせず、必ず実際の請求内容を確認してから作る。
- 既存の `documents/*.json` を上書きする前に内容を確認する。

### 発行済み一覧（任意）
`documents/index.json` は一覧ページ `documents.html` 用の目録。
新規書類を追加したら、ここにも1件追記すると一覧に表示される（任意・無くてもURL直打ちで開ける）。

## 業者見積入力フォーム（vendor.html）
下請け業者に `vendor.html` のURLを送ると、業者が項目・金額を入力して
「送信用リンク」（`estimate.html?d=<base64データ>`）を作成し、LINE等で返信してくる。
- そのリンクを開くと見積書フォーマットに反映された**編集可能な下書き**が表示される。
- 正式発行する場合は、内容を確認・編集のうえ `documents/<書類No>.json` として保存する
  （業者データはあくまで下書き。宛名・書類No・敬称などはCrastore側で設定する）。
- `?d=` のデータは base64url(UTF-8 JSON)。スキーマは documents/*.json と同じ。

## その他
- `estimate.html` はブラウザ単体でも新規作成できる（`?doc=`無しで開くと空フォーム）。
- ロゴ/QRは `assets/` に原本、`estimate.html` 内にbase64埋め込み済み。
- ローカル(Mac)の顧客フォルダ `~/Desktop/株式会社Crastore/お客様資料/...` はクラウドからは触れない。
  クラウド(Web版Claude Code)では本リポジトリへのコミットで書類を発行する。
