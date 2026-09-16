# nuxt-eno

8つのレイヤーをリアルタイムにミックスして、自分だけの環境音楽（アンビエント）を作れる Web アプリです。作ったミックスは URL で共有できます。

**本番:** https://nii-nuxt-eno.web.app/

## 使い方

1. 画面をクリックして音声を開始する
2. 8つのレイヤーそれぞれのスライダーで音量・エフェクトを調整する
3. 上部のプリセットボタンでミックス全体を切り替える（最後に選んだプリセットはブラウザに保存されます）
4. Color でアンビエント向けのカラースキンを選べます（Share に含まれます）
5. タイトル（任意）を入れて Share を押すと、同じミックスを再生できる URL（`/mix/{id}`）が発行されます

共有 URL を開いた相手も、クリック後に同じ 8 レイヤー・同じエフェクト状態・同じカラースキンで再生できます。ミックスは保存時点のスナップショットで、あとから編集はできません。開き直して触って Share すると、新しい URL が発行されます。

音楽の知識がなくても、聴きながら・触りながら環境音楽を楽しめます。

## エフェクト

| 名前 | 説明 |
|------|------|
| Volume | 音量を操作します |
| Filter | 高音を抑えます |
| Tremolo | 音量を周期的に変化させます |
| Vibrato | 音程を周期的に変化させます |
| Panner | 左右ステレオを周期的に変化させます |

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
| ミックス保存 | Cloud Firestore（データベース `mixes` の `mixes/{id}`） |
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

既存プロジェクトの `(default)` は Datastore モードのため、ミックスは Native モードのデータベース `mixes`（asia-northeast1）に保存します。ルールは認証なしの作成と公開読み取りを許可しています。一覧・いいね・認証はまだないため、スパム対策は面接後の課題です。

```bash
npm run generate
firebase deploy --only firestore,hosting
```

`master` への push 時は GitHub Actions から Hosting へ自動デプロイされます。Firestore ルールは上記コマンドで別途デプロイしてください。以下の Secrets が必要です。

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
data/           tracks.json, presets.json, skins.json
lib/            mix.js（スナップショット・Firestore）
pages/          index.vue（メイン画面と `/mix/:id`）
plugins/        firebase.js, tone.client.js
firestore.rules ミックスの公開読み取り・作成のみ
static/sounds/  音源 MP3
scripts/        download-sounds.mjs
```

## 今後の構想

- 作ったミックスの URL 共有（最小構成として実装済み）
- アプリ上で音源を作成できる環境
- ユーザー登録・一覧・いいねなど、誰もが環境音楽を作成・ミックスできるプラットフォーム
