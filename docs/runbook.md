# Runbook

## ローカル開発

```bash
npm install
cp .env.example .env   # Firebase コンソールの Web アプリ設定
npm run dev            # http://localhost:3000
```

### 必要環境

- Node.js 18 以上 22 未満（`.nvmrc` は 20）
- npm
- Firebase CLI（デプロイ・ルール・音源 DL 時）

## 環境変数

`.env` / CI の `generate` ステップ:

| 変数 | 説明 |
| --- | --- |
| `FIREBASE_API_KEY` | Firebase Web 設定 |
| `FIREBASE_AUTH_DOMAIN` | 同上 |
| `FIREBASE_DATABASE_URL` | 同上 |
| `FIREBASE_PROJECT_ID` | 同上 |
| `FIREBASE_STORAGE_BUCKET` | 同上（`download-sounds` 用） |
| `FIREBASE_MESSAGING_SENDER_ID` | 同上 |
| `FIREBASE_APP_ID` | 同上 |

## npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run generate` | 静的生成 → `dist/` |
| `npm run lint` | ESLint |
| `npm run download-sounds` | Storage → `static/sounds/c/`（Blaze 要） |

## デプロイ

### CI（Hosting）

`master` push → [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) → `npm run generate` → Firebase Hosting `live`。

GitHub Secrets: 上記 `FIREBASE_*` + `FIREBASE_SERVICE_ACCOUNT`。

### 手動（Hosting + Firestore）

プロジェクト `(default)` は Datastore モードのため、Mix は **Native DB `mixes`**（asia-northeast1）を使用。

```bash
npm run generate
firebase deploy --only firestore,hosting
```

Firestore ルール変更のみ:

```bash
firebase deploy --only firestore
```

## 音源ファイル

本番は `static/sounds/c/*.mp3` を Hosting から配信。clone 後にファイルが無い場合:

> 2026年2月以降、Storage API は Blaze プランが必要（[FAQ](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024)）。

```bash
npm run download-sounds
npm run generate
firebase deploy --only hosting
```

## 障害時

| 症状 | 確認 |
| --- | --- |
| Share 失敗 | ブラウザコンソール、Firestore ルール、Mix 形状 |
| 音源 402 / quota | Storage Spark 制限 → `download-sounds` + Hosting 再デプロイ |
| `/mix/id` が 404 | Hosting rewrite（`firebase.json`）、`generate.fallback` |
| 古い Hosting | Actions ログ、手動 `firebase deploy` |
