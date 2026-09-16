
export default {
  ssr: false,
  target: 'static',
  // CI では .env が無いため、@nuxtjs/dotenv だけではクライアント bundle に載らない
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID
  },
  head: {
    title: 'Ambient Music Mixer',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'アンビエントミュージック（環境音楽）を8つのレイヤーでミックスできるWebアプリです。'
      },
      { hid: 'og:title', property: 'og:title', content: 'Ambient Music Mixer' },
      {
        hid: 'og:description',
        property: 'og:description',
        content: '音楽の知識がなくても、環境音楽を聴いたり作ったりできるアプリです。'
      },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: 'https://nii-nuxt-eno.web.app/' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  css: [
    '@/assets/theme-default.css'
  ],
  plugins: [
    '@/plugins/firebase',
    '@/plugins/tone.client.js'
  ],
  components: true,
  buildModules: [],
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv'
  ],
  pwa: {
    manifest: {
      name: 'Ambient Music Mixer',
      short_name: 'Ambient Mixer',
      lang: 'ja',
      description: '環境音楽をミックスできるアプリ',
      theme_color: '#131419',
      background_color: '#131419'
    }
  },
  router: {
    extendRoutes (routes, resolve) {
      routes.push({
        name: 'mix-id',
        path: '/mix/:id',
        component: resolve(__dirname, 'pages/index.vue')
      })
    }
  },
  generate: {
    fallback: true
  },
  build: {
    extend (config) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
    }
  }
}
