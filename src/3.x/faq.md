# FAQ

---

[[toc]]

## Why is it so fast?

> Because Rapidez does not use the Magento frontend stack. Just Laravel, which queries the Magento database directly, and GraphQL for other parts like the cart and checkout. Category filters are so fast because of ReactiveSearch, which uses Elasticsearch as a database. For the smooth page transitions, Rapidez uses Turbo.

## Why headless and not a PWA?

> Do you really need an offline experience on your webshop? PWA makes things more complicated than necessary.

## Why query the Magento database instead of using GraphQL everywhere?

> Speed! The Magento database structure hasn't changed much over the years, and Rapidez is just using it to read data. Changes will go through GraphQL.

## Are all product types supported?

> Simple, configurable, downloadable, and grouped product types are currently supported.

## How is this different from Vue Storefront?

> Vue Storefront does support multiple platforms, where the focus of Rapidez is Magento 2. The learning curve of Vue Storefront can be steep because it's totally different from Magento, which uses a PHP stack. Rapidez combines the best of both worlds by using PHP and Vue.

## Do I need to know Vue?

> No, Vue is only used for some functional frontend components like the cart. All Vue components are "renderless", so most likely you never need to touch them because all the HTML is in the Blade files. But some basic knowledge of Vue could be useful.

## TailwindCSS is used, do I need to use it?

> No, you do not need to use it. You are completely free to use whatever you want. We like it, so we use it for basic styling.

## Is it production ready?

> Absolutely! Check out some [showcases](https://rapidez.io/showcases) to see live projects! Please [let us know](https://github.com/rapidez/rapidez/discussions) if you're missing something.