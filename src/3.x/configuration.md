# Configuration

---

Publish the Rapidez config files with:

```
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag="config"
```

After that you'll find all configuration options in `config/rapidez/*.php` with comments explaining the options. Most of them use the `env()` function so it's possible to have different configurations per environment in the `.env`.

::: tip
For more info on how the configuration works read the [Laravel configuration docs](https://laravel.com/docs/11.x/configuration#main-content)
:::

---

[[toc]]

## Magento configuration

Some Magento configuration options involve the frontend, as the Magento frontend is not used most of them don't do anything. Rapidez listens to some of those configurations:

Configuration | Explanation
:--- | :---
`web/secure/base_url` | See [base url](configuration.html#base-url)
`general/locale/code` | Locale
`currency/options/default` | Currency
`checkout/cart/redirect_to_cart` | Redirect to the cart when adding a product
`catalog/seo/product_url_suffix` | Product url suffix
`catalog/seo/category_url_suffix` | Category url suffix
`catalog/frontend/show_swatches_in_product_list` | Show the product options in product lists
`customer/address/middlename_show` | Show/hide middlename
`customer/address/telephone_show` | Show/hide telephone
`customer/address/company_show` | Show/hide company
`customer/address/taxvat_show` | Show/hide VAT on address forms
`customer/address/street_lines` | Show street, housenumber and/or addition
`customer/create_account/vat_frontend_visibility` | Show/hide VAT during registration
`reports/options/product_view_enabled` | Report product views
`cataloginventory/options/show_out_of_stock` | Show/hide out of stock products
`design/head/includes` | Additional scripts/styles in the head
`design/head/default_title` | The default title to use when no customized title has been set
`design/head/title_prefix` | Prefix to give to a customized title when set
`design/head/title_suffix` | Suffix to give to a customized title when set
`design/search_engine_robots/default_robots` | Meta robots tag value
`design/search_engine_robots/custom_instructions` | See [Robots.txt](configuration.html#robots-txt)

If you need to access a Magento configuration you can use the [`@config` Blade Directive](theming.html#config) or the Rapidez facade `Rapidez::config()` which accepts the same parameters as the directive.

## Base URL

Rapidez will be the frontend, Magento just as backend. So they'll need 2 different urls; we suggest to set the `web/secure/base_url` differently per scope:

- **Store View:** `https://webshop.com`
- **Website:** `https://magento.webshop.com`

## Forgot password email

You've to change the URL in the forgot password email to the Rapidez URL:

```diff
- {{var this.getUrl($store,'customer/account/createPassword/',[_query:[token:$customer.rp_token],_nosid:1])}}
+ https://your-rapidez-url.com/resetpassword?token={{var customer.rp_token}}
```

### Alternatively

If you [set the store view "Base URL" to that of your Rapidez installation](configuration.html#base-url) you can keep the `getUrl()` to dynamically determine the url.

```diff
- {{var this.getUrl($store,'customer/account/createPassword/',[_query:[token:$customer.rp_token],_nosid:1])}}
+ {{var this.getUrl($store,'resetpassword',[_query:[token:$customer.rp_token],_nosid:1])}}
```

## Customer Token Lifetime

By default the customer token lifetime is set to 1 hour in Magento so a customer needs to login again when the token expires in Rapidez. It's recommended to raise the expiration to for example 24 hours. See: Stores > Configuration > Services > OAuth > Access Token Expiration.

## Enable Guest Checkout Login

See: Stores > Configuration > Sales > Checkout > Checkout Options, but keep in mind as also mentioned there:

> Enabling this setting will allow unauthenticated users to query if an e-mail address is already associated with a customer account. This can be used to enhance the checkout workflow for guests that do not realize they already have an account but comes at the cost of exposing information to unauthenticated users.

## Robots.txt

By default Rapidez will use the [robots.txt](https://github.com/rapidez/rapidez/blob/master/public/robots.txt) file. If you'd like to use the Magento configuration from `design/search_engine_robots/custom_instructions` which gives you the flexibility to have a `robots.txt` per website; you need to remove that file from your repository. That way it will fallback to the [`robots.txt` route](https://github.com/rapidez/core/blob/master/routes/web.php). Depending on your webserver configuration you could get a 404 response. For example [Laravel Forge](https://forge.laravel.com/) and [Laravel Valet](https://laravel.com/docs/11.x/valet#main-content) do include a line causing this as the file could not be found:
```
location = /robots.txt  { access_log off; log_not_found off; }
```
The trick is to remove this line or extend it, depending on if you want the other log configurations:
```
location = /robots.txt  { access_log off; log_not_found off; try_files $uri $uri/ /index.php?$query_string; }
```

## Elasticsearch

To communicate with Elasticsearch, Rapidez is using the [laravel-elasticsearch](https://github.com/mailerlite/laravel-elasticsearch) package. If you need to change the Elasticsearch credentials you can do so with these `.env` configurations:

```dotenv
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_SCHEME=
ELASTICSEARCH_USER=
ELASTICSEARCH_PASS=
```

## Early hints

We come with [Early Hints](https://github.com/justbetter/laravel-http3earlyhints) built in. You should enable your early hints in [Cloudflare](https://developers.cloudflare.com/cache/advanced-configuration/early-hints/#enable-early-hints) or your CDN for a boost. Anything loaded with `@vite()` will properly get loaded with early hints, it will also discover other elements on your page which could benefit from early hints. Like your `preload`, and `preconnect` links, eager loaded images, blocking scripts and bocking styles. You can disable it with:

```dotenv
EARLY_HINTS_ENABLED=false
```

::: tip
You should [preload your custom fonts](https://web.dev/articles/codelab-preload-web-fonts) if they're used during the initial render.
:::
