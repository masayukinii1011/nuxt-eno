# ドメイン（Mix）

不変条件の正本: [lib/mix.js](../lib/mix.js)、[firestore.rules](../firestore.rules)。UI 用語・操作手順は [README](../README.md#使い方)。

## 前提

- 8 レイヤー固定（`tracks.json`）、各 5 エフェクト、ループ MP3
- **Create URL = スナップショット** — `title` + `skinId` + 8 tracks。update/delete なし
- 認証なし（read + create のみ）。スパム対策は未実装

## Firestore `mixes` DB / `mixes/{id}`

| フィールド | 制約 |
| --- | --- |
| `schemaVersion` | `1` |
| `title` | 1〜80 文字（空は `Untitled mix`） |
| `skinId` | [theme.js](../lib/theme.js) で正規化 |
| `tracks` | 長さ 8、id 重複なし、全 id が tracks.json と一致 |
| `createdAt` | timestamp（create 時） |

各 track: `{ id, volume, filter, vibrato, tremolo, panner }`。数値範囲は `EFFECT_RANGES`（`mix.js`）。

## ローカルのみ

- Preset: `localStorage` `nuxt-eno:last-preset`（Mix URL に含めない）
- Skin: `nuxt-eno:last-skin`（`/mix/:id` 初回は Mix の skin を優先）

## v1 外

Mix 更新・一覧・Auth、音源アップロード、サーバー側レート制限
