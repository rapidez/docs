# FAQ

---

[[toc]]

## Why is it so fast?

> Because Rapidez does not use the Magento frontend stack. Just Laravel which queries the Magento database directly and the Magento REST API / GraphQL for other parts like the cart and checkout. Category filters are so fast because of Reactive Search which uses Elasticsearch as database. For the smooth page transitions Rapidez uses Turbolinks.

## Why headless and not a PWA?

> Do you really need a offline experience on your webshop? PWA makes things more complicated then necessary.

## Why query the Magento database instead of using GraphQL?

> Speed; and not all data is available through GraphQL. The Magento database structure hasn't changed much over the years and Rapidez is just using it to get data. For inserting and updating Rapidez uses the REST API or GraphQL.

## Are all product types supported?

> Simple, configurable and downloadable product types are currently supported.

## How is this different from Vue Storefront?

> Vue Storefront does support multiple platforms where the focus of Rapidez is Magento 2. The learning curve of Vue Storefront can be steep because it's totally different from Magento which uses a PHP stack. Rapidez combines best of both worlds by using PHP and Vue.

## Do I need to know Vue?

> No, Vue is only used for some functional frontend components like the cart. All Vue components are "renderless" so most likely you never need to touch them because all the HTML is in the Blade files. But some basic knowledge of Vue could be useful.

## TailwindCSS is used, do I need to use it?

> No, you do not need to use it. You are completely free to use whatever you want. We like it so we use it for basic styling.

## Is it production ready?

> If it fits your needs; yes. Please [let us know](https://github.com/rapidez/rapidez/discussions) if you're missing something.
