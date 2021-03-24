module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Rapidez',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: 'Rapidez Docs',

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#27AE60' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    logo: 'https://raw.githubusercontent.com/rapidez/art/master/logo.svg',
    repo: 'rapidez/rapidez',
    repoLabel: 'GitHub',
    editLinks: true,
    docsRepo: 'rapidez/docs',
    docsDir: 'src',
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',
    smoothScroll: true,
    sidebar: {
      '/0.x/': [
        {
          title: 'Getting started',
          collapsable: false,
          children: [
            'intro',
            'installation',
            'deployment',
            'faq',
            'troubleshooting'
          ]
        },
        {
          title: 'Development',
          collapsable: false,
          children: [
            'theming',
            'packages'
          ]
        },
        {
          title: 'Components',
          collapsable: false,
          children: [
            'indexer',
            'caching'
          ]
        }
      ],
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ]
}
