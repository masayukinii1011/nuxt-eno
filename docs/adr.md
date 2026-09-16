# Architecture Decision Records

本プロジェクトの技術選定。実装の入口は [architecture.md](architecture.md)。

| # | タイトル | 状態 |
| --- | --- | --- |
| 0001 | Nuxt SPA + 静的 Hosting | Accepted |
| 0002 | Tone.js で 8 レイヤー realtime ミックス | Accepted |
| 0003 | Firestore `mixes` DB で URL 共有 | Accepted |
| 0004 | スナップショット共有（更新不可） | Accepted |
| 0005 | 音源は Hosting 静的配信 | Accepted |
| 0006 | Firebase Hosting 一体運用 | Accepted |

---

## 0001 Nuxt SPA + 静的 Hosting

### 状態

Accepted

### コンテキスト

Web Audio はブラウザのユーザー操作後に開始する必要があり、サーバー SSR で音声状態を扱うメリットが薄い。デプロイは静的ファイル中心にしたい。

### 決定

- `nuxt.config.js`: **`ssr: false`**, **`target: 'static'`**
- `npm run generate` → `dist/` を Firebase Hosting へ
- `/mix/:id` は同一 `index.vue` + **`generate.fallback: true`** でクライアントルーティング

### 理由

- Tone.js と Firebase SDK をクライアントに閉じられる
- Hosting の CDN で HTML/JS/MP3 をまとめて配信できる

### 結果

- 良い: 構成が単純。面接デモ・個人運用に向く
- 悪い: SEO は限定的（OG メタは固定）。動的 SSR 不可
- 見送り: Nuxt 3 移行、SSR + hydration

---

## 0002 Tone.js で 8 レイヤー realtime ミックス

### 状態

Accepted

### コンテキスト

8 音源を同時にループし、スライダーで即時反映する UI が必要。生 Web Audio API だけではエフェクトチェーンの記述コストが高い。

### 決定

- **Tone.js** を `plugins/tone.client.js` で inject
- レイヤーごとに Player + AutoFilter / Vibrato / Tremolo / AutoPanner のチェーン（[Instrument.vue](../components/Instrument.vue)）
- 初回クリックで **`Tone.start()`**（Autoplay ポリシー対応）

### 理由

- エフェクトノードの API が揃っており、スライダー値と 1:1 で結びつけやすい
- ループ MP3 再生が `Tone.Player` で簡潔

### 結果

- 良い: プロトタイプから本番まで一貫
- 悪い: バンドルサイズ・学習コスト
- 見送り: AudioWorklet 自前実装、MIDI 入力

---

## 0003 Firestore `mixes` DB で URL 共有

### 状態

Accepted

### コンテキスト

Share 機能でミックス状態を URL 化する必要がある。既存 Firebase プロジェクトの `(default)` DB は **Datastore モード** で Firestore Native API が使えない。

### 決定

- **Native モード DB 名 `mixes`**（asia-northeast1）に `mixes/{autoId}` を `addDoc`
- クライアントは modular SDK（[mix.js](../lib/mix.js) の `getFirestore(app, 'mixes')`）
- 認証なし **read + create のみ**（[firestore.rules](../firestore.rules)）

### 理由

- サーバーレスで URL 共有の最小実装ができる
- ルール側でも `schemaVersion` / 8 tracks 等を検証できる

### 結果

- 良い: バックエンド実装なしで Share が動く
- 悪い: スパム作成の抑止なし（v1 已知課題）
- 見送り: Cloud Functions 経由の作成、Auth 必須化

---

## 0004 スナップショット共有（更新不可）

### 状態

Accepted

### コンテキスト

共有 URL は「その時の聴き心地」の保存物として扱いたい。共同編集や上書きは v1 の範囲外。

### 決定

- Firestore: **`allow update, delete: if false`**
- 再 Share は常に **新規 doc** → 新 `/mix/{id}`
- クライアントも `createMix` / `getMix` のみ（更新 API なし）

### 理由

- ルールと UI の期待が一致する（リンクは不変のスナップショット）
- 実装が単純

### 結果

- 良い: 共有リンクの意味が明確
- 悪い: タイトル修正・取り消し不可
- 見送り: 所有者 Auth + update

---

## 0005 音源は Hosting 静的配信

### 状態

Accepted

### コンテキスト

8 つの MP3 を常時ループ再生する。Firebase Storage 直読みは Spark プラン制限（402）の影響を受けた。

### 決定

- 本番パス: `tracks.json` の **`/sounds/c/*.mp3`**（Hosting の [static/sounds](../static/sounds/)）
- Storage URL 取得は **path が `/` で始まらない場合のフォールバック**（[Instrument.vue](../components/Instrument.vue)）
- 開発者向け復旧: `npm run download-sounds` で Storage → static に同期

### 理由

- Hosting CDN で latency・コストを抑える
- ランタイムの Storage 依存を避けられる

### 結果

- 良い: 本番再生が安定
- 悪い: 音源更新は再 generate + deploy が必要
- 見送り: ユーザーアップロード音源

---

## 0006 Firebase Hosting 一体運用

### 状態

Accepted

### コンテキスト

フロントと MP3 と Firestore が同一 Firebase プロジェクト内にある。別クラウドへ分離するほどの規模ではない。

### 決定

- **Firebase Hosting** + **Firestore (`mixes`)** + （開発用）**Storage**
- CI: GitHub Actions → `FirebaseExtended/action-hosting-deploy`
- PWA: `@nuxtjs/pwa`（manifest / アイコン）

### 理由

- 個人プロジェクトでデプロイ・Secrets が一箇所にまとまる
- Firestore ルールと Hosting rewrite を `firebase.json` で管理

### 結果

- 良い: 運用コマンドが `firebase deploy` 中心
- 悪い: ベンダーロックイン
- 見送り: Cloudflare Pages + 別 BFF
