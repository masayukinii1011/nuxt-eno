# アプリ内部構造

Nuxt 2 **SPA + 静的ホスティング**（`ssr: false`, `target: 'static'`）。音声・Firestore アクセスはすべてブラウザ。インフラ図は [README](../README.md#アーキテクチャ)。

## 関連ドキュメント

| 参照 | 内容 |
| --- | --- |
| [domain.md](domain.md) | Mix スキーマ、エフェクト、共有の不変条件 |
| [adr.md](adr.md) | 技術選定 |
| [runbook.md](runbook.md) | 環境変数、デプロイ、音源取得 |

## コードの正本

| 役割 | パス |
| --- | --- |
| Mix 検証・Firestore CRUD | [lib/mix.js](../lib/mix.js) |
| Skin CSS 変数 | [lib/theme.js](../lib/theme.js) |
| メイン UI・Share フロー | [pages/index.vue](../pages/index.vue) |
| 1 レイヤー音声チェーン | [components/Instrument.vue](../components/Instrument.vue) |
| 背景パーティクル | [components/Canvas.vue](../components/Canvas.vue) |
| ルート定義 | [nuxt.config.js](../nuxt.config.js)（`router.extendRoutes`） |
| Firestore ルール | [firestore.rules](../firestore.rules) |

## スタック

- Nuxt 2、Vue 2、PWA モジュール
- Tone.js（`plugins/tone.client.js` で inject）
- Firebase compat（Storage フォールバック）+ Firestore modular（`mix.js`）
- CreateJS（Canvas 背景）

## ページ構成

| パス | 実装 | 内容 |
| --- | --- | --- |
| `/` | `pages/index.vue` | 新規ミックス |
| `/mix/:id` | 同上（`extendRoutes`） | 共有 Mix 読み込み |

単一 SFC が `$route.name === 'mix-id'` で分岐。`generate.fallback: true` で Hosting が SPA フォールバック。

## コンポーネント責務

```
pages/index.vue
  ├── Canvas.vue          CreateJS、skin の particleHue
  └── Instrument.vue ×8   Tone チェーン、スライダー、getValues / applyPreset
```

## 音声パイプライン（1 レイヤー）

`Instrument.vue` 内:

1. `Tone.Player`（loop）→ `AutoFilter` → `Vibrato` → `AutoPanner` → `Tremolo` → Destination
2. MP3 URL: `track.path` が `/` 始まりなら **Hosting 静的パス**（本番）。それ以外は Firebase Storage `getDownloadURL`（開発・レガシー用）

本番音源は [static/sounds/c/](../static/sounds/) を `tracks.json` の `/sounds/c/*.mp3` で参照。

## データファイル

| ファイル | 内容 |
| --- | --- |
| [data/tracks.json](../data/tracks.json) | 8 レイヤーの id / label / path |
| [data/presets.json](../data/presets.json) | プリセット定義 |
| [data/skins.json](../data/skins.json) | スキン id / tokens |

## Share シーケンス

1. `snapshotMix(instruments, title, skinId)` — 各 `Instrument.getValues()` を集約
2. `isValidMix`（クライアント）→ `createMix` → Firestore `addDoc`
3. `$router.push('/mix/' + id)`
4. 共有先: `watch mixId` → `getMix` → `applySharedMix`

タイムアウト: Firestore 操作 10 秒（`mix.js`）。

## ビルドと配信

- `npm run generate` → `dist/` → Firebase Hosting
- `master` push で GitHub Actions が Hosting のみデプロイ（Firestore ルールは手動 `firebase deploy --only firestore`）

詳細は [runbook.md](runbook.md)。
