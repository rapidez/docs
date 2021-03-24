# FAQ

---

[[toc]]

## Why is it so fast?

> Because we do not use the Magento frontend stack. Just Laravel which queries the Magento database directly and the Magento REST API / GraphQL for other parts like the cart and checkout. Category filters are so fast because of Reactive Search which uses Elasticsearch as database. For the smooth page transitions we use Turbolinks.

## How is this different from Vue Storefront?

> Vue Storefront does support multiple platforms where the focus of Rapidez is Magento 2. The learning curve of Vue Storefront can be steep because it's totally different from Magento which uses a PHP stack. Rapidez combines best of both worlds by using PHP and Vue.

## Why headless and not a PWA?

> Do you really need a offline experience on your webshop? PWA makes things more complicated then necessary.

## Do I need to know Vue?

> No, Vue is only used for some functional frontend components like the cart. All Vue components are "renderless" so most likely you never need to touch them because all the HTML is in the Blade files. But some basic knowledge of Vue could be useful.

## Why query the Magento database instead of using GraphQL?

> Speed; and not all data is available through GraphQL. The Magento database stucture isn't changed much over the years and Rapidez is just using it to get data. For inserting and updating we use the REST API or GraphQL.

## TailwindCSS is used, do I need to use it?

> No, you do not need te use it. You are completely free to use whatever you want. We like it so we used it for basic styling.

## Is it production ready?

> If it fits your needs; yes. Please let us know if you're missing something.
