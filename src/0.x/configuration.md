# Configuration

---

Publish the Rapidez config file:

```sh
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag="config"
```

After that you'll find all configuration options in `config/rapidez.php` with comments explaining the options. Most of them use the `env()` function so it's possible to have different configurations per environment in the `.env`.

::: tip
For more info on how the configuration works read the [Laravel configuration docs](https://laravel.com/docs/master/configuration)
:::

## Magento

Some Magento configuration options involve the frontend, as the Magento frontend is not used most of them don't do anything. Rapidez listens to some of those configurations:

Configuration | Explanation
:--- | :---
`general/locale/code` | Locale
`currency/options/default` | Currency
`checkout/cart/redirect_to_cart` | Redirect to the cart when adding a product
`catalog/seo/product_url_suffix` | Product url suffix
`catalog/seo/category_url_suffix` | Category url suffix
`design/search_engine_robots/default_robots` | Meta robots tag value
`catalog/frontend/show_swatches_in_product_list` | Show the product options in product lists

If you need to access a Magento configuration you can use the [`@config` Blade Directive](theming.html#config) or the Rapidez facade `Rapidez::config()` which accepts the same parameters as the directive.

## Elasticsearch

To communicate with Elasticsearch, Rapidez is using the [laravel-elasticsearch](https://github.com/cviebrock/laravel-elasticsearch) package. If you need to change the Elasticsearch credentials you can do so with these `.env` configurations:

```
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_SCHEME=
ELASTICSEARCH_USER=
ELASTICSEARCH_PASS=
```
