## 概要
環境音楽で遊べるアプリです。

本番: https://nii-nuxt-eno.web.app/

## 環境音楽とは
またの名をアンビエント音楽と言います。  
空間や場所に添えるような形で提供され、ポップスのように定型があるわけではなく、まるで自然環境の音のように微妙な音の変化に耳を傾けたり、ただ空間に漂う「音」として楽しむことを意識して作られています。  
ヒーリング、瞑想などによく使われます。

## このアプリの効果
・環境音楽を"聴く"ことで気持ちをリラックスできます。  
・環境音楽を"作る"ことでクリエイティビティを高められます。  
・"音楽の知識が無くても"、誰でも音楽が作れる。音楽で遊ぶ事の入り口になります。

## 操作
・Volume -> 音量を操作します。  
・Filter -> 高音を抑えます。  
・Tremolo -> 音量を周期的に変化させます。  
・Vibrato -> 音程を周期的に変化させます。  
・Panner -> 左右ステレオを周期的に変化させます。

## 今後の構想
・ユーザーがアプリケーション上で音源を作成できる環境を用意する。  
・作成した音源を投稿、他のユーザとシェアできる機能を用意する。  
・"音楽の知識が無くても"、誰もが環境音楽を作成、ミックスできるプラットフォームを目指す。

## 使用している技術
Nuxt.js 2（フロントエンド）  
Tone.js（Web Audio）  
CreateJS（背景アニメーション）  
Firebase Hosting（ホスティング）  
Firebase Cloud Storage（音源ファイルを保存）

## 必要環境
- Node.js 18 以上 22 未満（`.nvmrc` は 20 を指定）
- npm

## セットアップ

```bash
# 依存関係をインストール
npm install

# 環境変数を用意
cp .env.example .env
# .env に Firebase の各種キーを設定
```

`.env` には Firebase コンソールのプロジェクト設定から以下を設定します。

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## 開発

```bash
# 開発サーバー起動（http://localhost:3000）
npm run dev

# 静的サイト生成
npm run generate

# Lint
npm run lint
```

## デプロイ

```bash
npm run generate
firebase deploy --only hosting,storage
```

GitHub Actions では `master` への push 時に Hosting へ自動デployします。  
以下の Secrets が必要です。

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`（Firebase サービスアカウント JSON）

## プロジェクト構成メモ
- `data/tracks.json` — 8トラックのメタデータ
- `data/presets.json` — ミックスプリセット
- `data/effects.json` — エフェクト説明
- `store/` — 現状未使用（Vuex は導入していません）

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
