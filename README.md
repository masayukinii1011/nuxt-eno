＊現在開発中です。不具合あるかもしれません、ご了承ください。

## 概要
環境音楽で遊べるアプリです。

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
Nuxt.js(フロントエンド)  
Tone.js(Web Audio APIを扱うライブラリ)  
Firebase Hosting(ホスティング)  
Firebase Cloud Storage(音源ファイルを保存)

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
