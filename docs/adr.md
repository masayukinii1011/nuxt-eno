# Architecture Decision Records

| # | タイトル | 状態 |
| --- | --- | --- |
| 0001 | Nuxt SPA + 静的 Hosting | Accepted |
| 0002 | Tone.js | Accepted |
| 0003 | Firestore DB `mixes` | Accepted |
| 0004 | スナップショット共有 | Accepted |
| 0005 | 音源 Hosting 静的配信 | Accepted |
| 0006 | Firebase 一体運用 | Accepted |

---

## 0001 Nuxt SPA + 静的 Hosting

- **決定**: `ssr: false`, `target: 'static'`, `/mix/:id` は fallback + 同一 `index.vue`
- **理由**: Web Audio はクライアント前提。Hosting CDN 配信
- **結果**: SSR / Server API 不可

## 0002 Tone.js

- **決定**: 8 × Player + Filter / Vibrato / Tremolo / Panner。初回 `Tone.start()`
- **理由**: エフェクトチェーンを短く書ける
- **結果**: バンドルサイズ増

## 0003 Firestore DB `mixes`

- **決定**: `(default)` が Datastore のため Native DB **`mixes`** に `addDoc`。read + create、Auth なし
- **理由**: サーバーレスで URL 共有
- **結果**: スパム未防御（v1 已知）

## 0004 スナップショット共有

- **決定**: update/delete 禁止。再 Create URL は新 doc
- **理由**: リンクの意味を不変に保つ
- **結果**: 取り消し・編集不可

## 0005 音源 Hosting 静的配信

- **決定**: `/sounds/c/*.mp3` を static 同梱。Storage は DL スクリプトと非 `/` フォールバックのみ
- **理由**: Spark Storage 制限回避、CDN 配信
- **結果**: 音源更新は redeploy

## 0006 Firebase 一体運用

- **決定**: Hosting + Firestore + PWA。**`nuxt.config env`** で CI に Firebase 設定を bundle 化
- **理由**: デプロイ・Secrets 一元化
- **結果**: ベンダー依存
