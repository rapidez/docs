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
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600&display=swap', rel: 'stylesheet', type: 'text/css' }]
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
    nav: [
      {
        text: 'Version',
        items: [
          { text: '1.x', link: '/1.x/intro' },
          { text: '0.x', link: '/0.x/intro' },
        ]
      },
      { text: 'Website', link: 'https://rapidez.io' },
      { text: 'Demo', link: 'https://demo.rapidez.io' },
    ],
    sidebar: {
      '/0.x/': [
        {
          title: 'Getting started',
          collapsable: false,
          children: [
            'intro',
            'installation',
            'configuration',
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
            'package-development',
            'graphql-components',
            'extending',
            'testing',
            'tips'
          ]
        },
        {
          title: 'Components',
          collapsable: false,
          children: [
            'indexer',
            'cache',
            'packages'
          ]
        }
      ],
      '/1.x/': [
        {
          title: 'Getting started',
          collapsable: false,
          children: [
            'intro',
            'installation',
            'configuration',
            'upgrading',
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
            'package-development',
            'graphql-components',
            'extending',
            'testing',
            'tips'
          ]
        },
        {
          title: 'Components',
          collapsable: false,
          children: [
            'indexer',
            'cache',
            'packages'
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
    ['vuepress-plugin-code-copy', {
      color: '#3eaf7c',
      backgroundColor: '#3eaf7c',
    }],
  ]
}
