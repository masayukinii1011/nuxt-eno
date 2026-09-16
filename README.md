# nuxt-eno

8つのレイヤーをリアルタイムにミックスして、自分だけの環境音楽（アンビエント）を作れる Web アプリです。作ったミックスは URL で共有できます。

**本番:** [nii-nuxt-eno.web.app](https://nii-nuxt-eno.web.app/)

## 使い方

1. 画面をクリックして音声を開始する
2. 8つのレイヤーそれぞれのスライダーで音量・エフェクトを調整する
3. 上部のプリセットボタンでミックス全体を切り替える（最後に選んだプリセットはブラウザに保存されます）
4. Color でアンビエント向けのカラースキンを選べます（リンクに含まれます）
5. Mix 名（任意）を入れて「Create URL」を押すと、いまの設定で再生できる Mix URL（`/mix/{id}`）が発行され、画面に表示されます

その URL を開いた相手も、クリック後に同じ 8 レイヤー・同じエフェクト状態・同じカラースキンで再生できます。URL は保存時点のスナップショットで、あとからスライダーを動かしても変わりません。もう一度「Create URL」すると、新しい URL が発行されます。

音楽の知識がなくても、聴きながら・触りながら環境音楽を楽しめます。

## エフェクト

| 名前 | 説明 |
| --- | --- |
| Volume | 音量を操作します |
| Filter | 高音を抑えます |
| Tremolo | 音量を周期的に変化させます |
| Vibrato | 音程を周期的に変化させます |
| Panner | 左右ステレオを周期的に変化させます |

## プリセット

| 名前 | 説明 |
| --- | --- |
| Quiet | 静かな土台に戻す。すべてのレイヤーを初期状態にする |
| Bright Air | 明るく軽やかに広がる、開放的なアンビエント |
| Dreamscape | やわらかく広がる、穏やかなアンビエント |
| Deep Focus | 集中向けの落ち着いた低域中心ミックス |
| Soft Vibe | 浮遊感と揺らぎのある、ふわっとしたミックス |
| Slow Pulse | ゆっくりうねる、呼吸のようなリズム |

## 環境音楽について

またの名をアンビエント音楽と言います。空間に添える形で提供され、微妙な音の変化に耳を傾けたり、ただ空間に漂う「音」として楽しむことを意識して作られています。ヒーリングや瞑想などにも使われます。

## 技術スタック

| 用途 | 技術 |
| --- | --- |
| フロントエンド | Nuxt.js 2（SPA / static） |
| 音声処理 | Tone.js |
| 背景アニメーション | CreateJS |
| ホスティング | Firebase Hosting |
| ミックス保存 | Cloud Firestore（DB `mixes` / `mixes/{id}`） |
| 音源配信 | Firebase Hosting（`static/sounds/c/`） |

## アーキテクチャ

### ランタイム

```mermaid
flowchart TB
  Browser["Browser"]
  Browser --> Hosting["Firebase Hosting SPA"]
  Browser -->|"MP3 loop"| Sounds["/sounds/c/*.mp3"]
  Browser -->|"Share get/create"| FS["Firestore DB mixes"]
```

### 共有

```mermaid
sequenceDiagram
  participant U as User
  participant A as App
  participant F as Firestore
  U->>A: スライダー調整
  U->>A: Create URL
  A->>F: createMix snapshot
  F-->>A: document id
  A->>U: /mix/id
  participant G as Guest
  G->>A: /mix/id を開く
  A->>F: getMix
  A->>G: 同設定で再生
```

`ssr: false` + 静的 generate。Mix スキーマと不変条件は [docs/domain.md](docs/domain.md)。

## セットアップ

```bash
npm install
cp .env.example .env
npm run dev
```

環境変数・デプロイ・音源取得は [docs/runbook.md](docs/runbook.md)。

## ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [docs/runbook.md](docs/runbook.md) | ローカル開発、デプロイ、音源、障害時 |
| [docs/architecture.md](docs/architecture.md) | コンポーネント、音声パイプライン、ルート |
| [docs/domain.md](docs/domain.md) | Mix / レイヤー、Firestore 形状 |
| [docs/adr.md](docs/adr.md) | 技術選定 ADR |
| [lib/mix.js](lib/mix.js) | 検証・Firestore（コード正本） |

## 今後の構想

- 作ったミックスの URL 共有（最小構成として実装済み）
- アプリ上で音源を作成できる環境
- ユーザー登録・一覧・いいねなど、誰もが環境音楽を作成・ミックスできるプラットフォーム
