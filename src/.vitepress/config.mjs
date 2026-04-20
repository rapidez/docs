import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Rapidez",
  description: "Rapidez Docs",

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#27AE60' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ],

  sitemap: {
    hostname: 'https://docs.rapidez.io',
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: 'https://raw.githubusercontent.com/rapidez/art/master/r.svg',

    externalLinkIcon: true,

    editLink: {
      pattern: 'https://github.com/rapidez/docs/edit/master/src/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
           */
          options: {
          },

          /**
           * @type {import('minisearch').SearchOptions}
           */
          searchOptions: {
            filter: (result) => {
              return window.location.pathname.split('/')[1] === result.id.split('/')[1]
            },
          }
        }
      },
    },

    nav: [
      {
        text: 'Version',
        items: [
          { text: '5.x', link: '/5.x/intro' },
          { text: '4.x', link: '/4.x/intro' },
          { text: '3.x', link: '/3.x/intro' },
          { text: '2.x', link: '/2.x/intro' },
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
          text: 'Getting started',
          collapsed: false,
          items: [
            { text: 'Intro', link: '/0.x/intro' },
            { text: 'Installation', link: '/0.x/installation' },
            { text: 'Configuration', link: '/0.x/configuration' },
            { text: 'Deployment', link: '/0.x/deployment' },
            { text: 'Faq', link: '/0.x/faq' },
            { text: 'Troubleshooting', link: '/0.x/troubleshooting' },
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Theming', link: '/0.x/theming' },
            { text: 'Package development', link: '/0.x/package-development' },
            { text: 'GraphQL components', link: '/0.x/graphql-components' },
            { text: 'Extending', link: '/0.x/extending' },
            { text: 'Testing', link: '/0.x/testing' },
            { text: 'Tips', link: '/0.x/tips' },
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Indexer', link: '/0.x/indexer' },
            { text: 'Cache', link: '/0.x/cache' },
            { text: 'Packages', link: '/0.x/packages' },
          ]
        }
      ],
      '/1.x/': [
        {
          text: 'Getting started',
          collapsed: false,
          items: [
            { text: 'Intro', link: '/1.x/intro' },
            { text: 'Installation', link: '/1.x/installation' },
            { text: 'Configuration', link: '/1.x/configuration' },
            { text: 'Upgrading', link: '/1.x/upgrading' },
            { text: 'Deployment', link: '/1.x/deployment' },
            { text: 'Faq', link: '/1.x/faq' },
            { text: 'Troubleshooting', link: '/1.x/troubleshooting' },
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Theming', link: '/1.x/theming' },
            { text: 'Package development', link: '/1.x/package-development' },
            { text: 'GraphQL components', link: '/1.x/graphql-components' },
            { text: 'Extending', link: '/1.x/extending' },
            { text: 'Testing', link: '/1.x/testing' },
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Indexer', link: '/1.x/indexer' },
            { text: 'Cache', link: '/1.x/cache' },
            { text: 'Packages', link: '/1.x/packages' },
          ]
        }
      ],
      '/2.x/': [
        {
          text: 'Getting started',
          collapsed: false,
          items: [
            { text: 'Intro', link: '/2.x/intro' },
            { text: 'Installation', link: '/2.x/installation' },
            { text: 'Configuration', link: '/2.x/configuration' },
            { text: 'Upgrading', link: '/2.x/upgrading' },
            { text: 'Deployment', link: '/2.x/deployment' },
            { text: 'Faq', link: '/2.x/faq' },
            { text: 'Troubleshooting', link: '/2.x/troubleshooting' },
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Theming', link: '/2.x/theming' },
            { text: 'Package development', link: '/2.x/package-development' },
            { text: 'GraphQL components', link: '/2.x/graphql-components' },
            { text: 'Extending', link: '/2.x/extending' },
            { text: 'Testing', link: '/2.x/testing' },
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Indexer', link: '/2.x/indexer' },
            { text: 'Cache', link: '/2.x/cache' },
          ]
        },
        {
          text: 'Packages',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/2.x/packages' },
            { text: 'Statamic', link: '/2.x/packages/statamic' },
          ]
        }
      ],
      '/3.x/': [
        {
          text: 'Getting started',
          collapsed: false,
          items: [
            { text: 'Intro', link: '/3.x/intro' },
            { text: 'Installation', link: '/3.x/installation' },
            { text: 'Configuration', link: '/3.x/configuration' },
            { text: 'Upgrading', link: '/3.x/upgrading' },
            { text: 'Deployment', link: '/3.x/deployment' },
            { text: 'Faq', link: '/3.x/faq' },
            { text: 'Troubleshooting', link: '/3.x/troubleshooting' },
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Theming', link: '/3.x/theming' },
            { text: 'Extending', link: '/3.x/extending' },
            { text: 'Testing', link: '/3.x/testing' },
            { text: 'GraphQL components', link: '/3.x/graphql-components' },
            { text: 'Package development', link: '/3.x/package-development' },
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Indexer', link: '/3.x/indexer' },
            { text: 'Cache', link: '/3.x/cache' },
          ]
        },
        {
          text: 'Packages',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/3.x/packages' },
            { text: 'Statamic', link: '/3.x/packages/statamic' },
          ]
        }
      ],
      '/4.x/': [
        {
          text: 'Getting started',
          collapsed: false,
          items: [
            { text: 'Intro', link: '/4.x/intro' },
            { text: 'Installation', link: '/4.x/installation' },
            { text: 'Configuration', link: '/4.x/configuration' },
            { text: 'Upgrading', link: '/4.x/upgrading' },
            { text: 'Deployment', link: '/4.x/deployment' },
            { text: 'Faq', link: '/4.x/faq' },
            { text: 'Troubleshooting', link: '/4.x/troubleshooting' },
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Theming', link: '/4.x/theming' },
            { text: 'Extending', link: '/4.x/extending' },
            { text: 'Testing', link: '/4.x/testing' },
            { text: 'GraphQL components', link: '/4.x/graphql-components' },
            { text: 'Package development', link: '/4.x/package-development' },
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Indexer', link: '/4.x/indexer' },
            { text: 'Cache', link: '/4.x/cache' },
            { text: 'Turbo', link: '/4.x/turbo' },
          ]
        },
        {
          text: 'Packages',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/4.x/packages' },
            { text: 'Statamic', link: '/4.x/packages/statamic' },
          ]
        },
        {
          text: 'Tutorials',
          collapsed: false,
          items: [
            { text: 'Semantic Search', link: '/4.x/semantic-search' },
          ]
        },
      ],
      '/5.x/': [
        {
          text: 'Getting started',
          collapsed: false,
          items: [
            { text: 'Intro', link: '/5.x/intro' },
            { text: 'Installation', link: '/5.x/installation' },
            { text: 'Configuration', link: '/5.x/configuration' },
            { text: 'Upgrading', link: '/5.x/upgrading' },
            { text: 'Deployment', link: '/5.x/deployment' },
            { text: 'Faq', link: '/5.x/faq' },
            { text: 'Troubleshooting', link: '/5.x/troubleshooting' },
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Theming', link: '/5.x/theming' },
            { text: 'Extending', link: '/5.x/extending' },
            { text: 'Testing', link: '/5.x/testing' },
            { text: 'GraphQL components', link: '/5.x/graphql-components' },
            { text: 'Package development', link: '/5.x/package-development' },
          ]
        },
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Indexer', link: '/5.x/indexer' },
            { text: 'Cache', link: '/5.x/cache' },
            { text: 'Turbo', link: '/5.x/turbo' },
          ]
        },
        {
          text: 'Packages',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/5.x/packages' },
            { text: 'Statamic', link: '/5.x/packages/statamic' },
          ]
        },
        {
          text: 'Tutorials',
          collapsed: false,
          items: [
            { text: 'Semantic Search', link: '/5.x/semantic-search' },
          ]
        },
      ],
    },

    socialLinks: [
      { icon: 'x', link: 'https://twitter.com/rapidez_io' },
      { icon: 'slack', link: 'https://rapidez.io/slack' },
      { icon: 'github', link: 'https://github.com/rapidez/rapidez' },
    ]
  }
})
