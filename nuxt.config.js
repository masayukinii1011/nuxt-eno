
export default {
  ssr: false,
  target: 'static',
  head: {
    title: 'nuxt-eno | 環境音楽ミキサー',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'アンビエントミュージック（環境音楽）を8つのレイヤーでミックスできるWebアプリです。'
      },
      { hid: 'og:title', property: 'og:title', content: 'nuxt-eno | 環境音楽ミキサー' },
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
  css: [],
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
      name: 'nuxt-eno',
      short_name: 'nuxt-eno',
      lang: 'ja',
      description: '環境音楽をミックスできるアプリ',
      theme_color: '#131419',
      background_color: '#131419'
    }
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
