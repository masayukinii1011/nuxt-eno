# Runbook

## ローカル

```bash
npm install && cp .env.example .env && npm run dev
```

Node 18〜22 未満（`.nvmrc` 20）。デプロイ・ルール・音源 DL 時は Firebase CLI。

## 環境変数

`FIREBASE_API_KEY`, `AUTH_DOMAIN`, `DATABASE_URL`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID` — Firebase コンソールの Web アプリ設定。

CI: workflow が Secrets を注入 → [nuxt.config.js](../nuxt.config.js) の **`env`** でクライアント bundle に焼き込む。

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発 |
| `npm run generate` | `dist/` |
| `npm run lint` | ESLint |
| `npm run download-sounds` | Storage → `static/sounds/c/`（Blaze） |

## デプロイ

- **CI**: `master` push → [deploy.yml](../.github/workflows/deploy.yml) → Hosting
- **手動**: `firebase deploy --only firestore,hosting`（Mix は Native DB **`mixes`**、`(default)` は Datastore モード）
- Secrets: 上記 `FIREBASE_*` + `FIREBASE_SERVICE_ACCOUNT`

## 音源

本番は `static/sounds/c/` を Hosting 配信。無い場合は [Storage FAQ](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024) 参照のうえ `download-sounds` → generate → hosting deploy。

## 障害時

| 症状 | 確認 |
| --- | --- |
| Create URL / Firestore タイムアウト | bundle の Firebase `env`、Secrets、ルール |
| 音源 402 | `download-sounds` + 再デプロイ |
| `/mix/id` 404 | `firebase.json` rewrite、`generate.fallback` |
