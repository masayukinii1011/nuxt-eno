# ドメイン（ミックスとレイヤー）

アプリのユビキタス言語と不変条件。バリデーションの正本は [lib/mix.js](../lib/mix.js)（クライアント）と [firestore.rules](../firestore.rules)（サーバー）。

## 前提

- **8 レイヤー固定** — `data/tracks.json` の 8 トラックが常に存在し、各 1 つずつミックスに含まれる
- **ループ再生** — 各レイヤーは Tone.js `Player` で MP3 をループ。テンポ同期や DAW 的編集は v1 にない
- **共有 = スナップショット** — Share 時点の 8 レイヤー × 5 エフェクト + タイトル + スキンを保存。**更新・削除 API なし**
- **認証なし** — 誰でも読み取り・作成可能（スパム対策は未実装）

## 用語

| 用語 | 説明 |
| --- | --- |
| **Layer（トラック）** | `01`〜`08` の 1 音源 + 5 エフェクト値 |
| **Preset** | 8 レイヤー分のエフェクト初期セット（`data/presets.json`）。ローカルのみ、Share には含めない |
| **Skin** | UI カラートークン（`data/skins.json`）。Share に含む |
| **Mix** | Firestore に保存された共有スナップショット。URL は `/mix/{id}` |

## エフェクト（レイヤーごと）

| キー | 役割（Tone.js） | 範囲（`EFFECT_RANGES`） |
| --- | --- | --- |
| `volume` | Player 音量 (dB) | -64 … 0 |
| `filter` | AutoFilter octaves | 0 … 10 |
| `vibrato` | Vibrato frequency | 0 … 40 |
| `tremolo` | Tremolo frequency | 0 … 8 |
| `panner` | AutoPanner frequency | 0 … 16 |

UI 上の説明は [README](../README.md#エフェクト) を参照。

## Mix ドキュメント（Firestore）

コレクション: データベース **`mixes`**（Native、region `asia-northeast1`）の `mixes/{id}`。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `schemaVersion` | number | 現行 `1` |
| `title` | string | 1〜80 文字。空はクライアント側で `Untitled mix` |
| `skinId` | string | [lib/theme.js](../lib/theme.js) で正規化済み ID |
| `tracks` | array | 長さ 8。各要素 `{ id, volume, filter, vibrato, tremolo, panner }` |
| `createdAt` | timestamp | サーバー時刻（作成のみ） |

`tracks` は `tracks.json` の id をすべて含み、重複不可。各数値は `EFFECT_RANGES` 内。

## ローカル状態（Firestore 外）

| キー | 保存先 | 内容 |
| --- | --- | --- |
| `nuxt-eno:last-preset` | localStorage | 最後に選んだプリセット id |
| `nuxt-eno:last-skin` | localStorage | 最後に選んだ skin id（共有 URL 表示時は Mix の skin を優先） |

## ユーザーフロー

1. **初回**: 画面クリック → `$tone.start()`（ブラウザ AudioContext 解放）
2. **通常**: スライダー調整、プリセット / Skin 変更（localStorage のみ）
3. **リンク作成**: `snapshotMix` → `createMix` → `/mix/{id}` を表示・コピー
4. **共有 URL**: `getMix` → 全 Instrument に `applyPreset` + skin 適用。編集して再作成すると **新 id** が発行される

## v1 でやらないこと

- Mix の更新・削除、一覧、いいね、ユーザー登録
- サーバー側レート制限（Firestore ルールは形状検証のみ）
- 音源のアップロード・リアルタイム合成（MP3 はビルド済み静的ファイル）
