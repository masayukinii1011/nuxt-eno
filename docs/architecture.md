# アプリ内部構造

Nuxt 2 SPA（`ssr: false`, `target: 'static'`）。インフラ図は [README](../README.md#アーキテクチャ)。使い方は [README](../README.md#使い方)。

## 正本

| 役割 | パス |
| --- | --- |
| Mix 検証・Firestore | [lib/mix.js](../lib/mix.js) |
| メイン UI | [pages/index.vue](../pages/index.vue) |
| 音声チェーン | [components/Instrument.vue](../components/Instrument.vue) |
| ルート `/mix/:id` | [nuxt.config.js](../nuxt.config.js) `extendRoutes` |
| Firestore ルール | [firestore.rules](../firestore.rules) |

## 構成

```
pages/index.vue ── Canvas.vue
               └── Instrument.vue ×8  (Tone.js)
data/tracks.json, presets.json, skins.json
```

| パス | 内容 |
| --- | --- |
| `/` | 新規ミックス |
| `/mix/:id` | 同一 SFC、`getMix` で復元（`generate.fallback: true`） |

## 音声（1 レイヤー）

`Player`(loop) → AutoFilter → Vibrato → AutoPanner → Tremolo → Destination。MP3 は `/sounds/c/`（Hosting）。非 `/` path のみ Storage URL フォールバック。

## Create URL（実装）

`shareMix`: `snapshotMix` → `createMix` → URL 表示・コピー → `history.pushState('/mix/id')`（Router 遷移なし）。詳細は domain / README。

## CI の Firebase

[nuxt.config.js](../nuxt.config.js) の **`env`** で `FIREBASE_*` を bundle に明示（Actions に `.env` 無し）。→ [runbook.md](runbook.md)
