# nuxt-eno

8つのレイヤーをリアルタイムにミックスして、自分だけの環境音楽（アンビエント）を作れる Web アプリです。

**本番:** https://nii-nuxt-eno.web.app/

## 使い方

1. 画面をクリックして音声を開始する
2. 8つのレイヤーそれぞれのスライダーで音量・エフェクトを調整する
3. 上部のプリセットボタンでミックス全体を切り替える（最後に選んだプリセットはブラウザに保存されます）

音楽の知識がなくても、聴きながら・触りながら環境音楽を楽しめます。

## エフェクト

| 名前 | 説明 |
|------|------|
| Volume | 音量を操作します |
| Filter | 高音を抑えます |
| Tremolo | 音量を周期的に変化させます |
| Vibrato | 音程を周期的に変化させます |
| Panner | 左右ステレオを周期的に変化させます |

## レイヤー（8トラック）

| # | 名前 | 説明 |
|---|------|------|
| 01 | Pad | 柔らかなシンセパッド |
| 02 | Drone | 低く響く持続音 |
| 03 | Texture | 粒状のテクスチャー |
| 04 | Bell | 澄んだ鐘のような音 |
| 05 | Wind | 風のような息づかい |
| 06 | Pulse | ゆるやかなリズム感 |
| 07 | Shimmer | きらめく高域のレイヤー |
| 08 | Space | 広がりのある残響感 |

## プリセット

| 名前 | 説明 |
|------|------|
| Reset | すべてのレイヤーを初期状態に戻す |
| Soft Ambient | 穏やかで柔らかいミックス |
| Deep Focus | 集中向けの落ち着いた低域中心ミックス |
| Dreamscape | 浮遊感のある広がりのあるミックス |
| Minimal | 控えめな音量設定のミックス |

## 環境音楽について

またの名をアンビエント音楽と言います。空間に添える形で提供され、微妙な音の変化に耳を傾けたり、ただ空間に漂う「音」として楽しむことを意識して作られています。ヒーリングや瞑想などにも使われます。

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | Nuxt.js 2 |
| 音声処理 | Tone.js |
| 背景アニメーション | CreateJS |
| ホスティング | Firebase Hosting |
| 音源配信 | Firebase Hosting（`static/sounds/c/`） |

## 開発

### 必要環境

- Node.js 18 以上 22 未満（`.nvmrc` は 20）
- npm
- Firebase CLI（デプロイ時）

### セットアップ

```bash
git clone https://github.com/masayukinii1011/nuxt-eno.git
cd nuxt-eno
npm install
cp .env.example .env
```

`.env` には [Firebase コンソール](https://console.firebase.google.com/project/nii-nuxt-eno/settings/general) のプロジェクト設定値を設定します。

### コマンド

```bash
npm run dev              # 開発サーバー (http://localhost:3000)
npm run generate         # 静的サイト生成 (dist/)
npm run lint             # ESLint
npm run download-sounds  # Storage から音源を取得（後述）
```

## デプロイ

```bash
npm run generate
firebase deploy --only hosting
```

`master` への push 時は GitHub Actions から Hosting へ自動デプロイされます。以下の Secrets が必要です。

- `FIREBASE_API_KEY` / `FIREBASE_AUTH_DOMAIN` / `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID` / `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID` / `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`

## 音源ファイル

音源 MP3 は `static/sounds/c/` に置き、Firebase Hosting から配信しています。リポジトリ clone 後はこのディレクトリにファイルがある前提です。

Storage から再取得する場合（初回セットアップや復旧時）:

> 2026年2月以降、Firebase Storage の API 利用には Blaze プランが必要です（[FAQ](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024)）。無料枠内であれば課金されません。

```bash
npm run download-sounds
npm run generate
firebase deploy --only hosting
```

## プロジェクト構成

```
components/     Instrument.vue, Canvas.vue
data/           tracks.json, presets.json
pages/          index.vue（メイン画面）
plugins/        firebase.js, tone.client.js
static/sounds/  音源 MP3
scripts/        download-sounds.mjs
```

## 今後の構想

- アプリ上で音源を作成できる環境
- 作成した音源の投稿・シェア
- 誰もが環境音楽を作成・ミックスできるプラットフォーム
