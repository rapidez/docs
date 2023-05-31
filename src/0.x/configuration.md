# Configuration

---

[[toc]]

## Rapidez

Publish the Rapidez config file:

```
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
`customer/address/middlename_show` | Show/hide middlename
`customer/address/telephone_show` | Show/hide telephone
`customer/address/company_show` | Show/hide company
`customer/address/street_lines` | Show street, housenumber and/or addition
`design/head/default_title` | The default title to use when no customized title has been set
`design/head/title_prefix` | Prefix to give to a customized title when set
`design/head/title_suffix` | Suffix to give to a customized title when set

If you need to access a Magento configuration you can use the [`@config` Blade Directive](theming.html#config) or the Rapidez facade `Rapidez::config()` which accepts the same parameters as the directive.

### Forgot password email

You've to change the url in the forgot password email as this points to Magento instead of Rapidez. Replace this:
```
{{var this.getUrl($store,'customer/account/createPassword/',[_query:[token:$customer.rp_token],_nosid:1])}}
```
With
```
https://your-rapidez-url.com/resetpassword?token={{var customer.rp_token}}
```

#### Alternatively

If you set the store view base url to that of your Rapidez installation you can keep the getUrl to dynamically determine the url.

```diff
- {{var this.getUrl($store,'customer/account/createPassword/',[_query:[token:$customer.rp_token],_nosid:1])}}
+ {{var this.getUrl($store,'resetpassword',[_query:[token:$customer.rp_token],_nosid:1])}}
```

### Customer Token Lifetime

By default the customer token lifetime is set to 1 hour in Magento so a customer needs to login again when the token expires in Rapidez. It's recommended to raise the expiration to for example 24 hours. See: Stores > Settings > Configuration > Services > OAuth > Access Token Expiration.

## Elasticsearch

To communicate with Elasticsearch, Rapidez is using the [laravel-elasticsearch](https://github.com/cviebrock/laravel-elasticsearch) package. If you need to change the Elasticsearch credentials you can do so with these `.env` configurations:

```
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_SCHEME=
ELASTICSEARCH_USER=
ELASTICSEARCH_PASS=
```
