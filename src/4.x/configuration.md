# Configuration

---

Publish the Rapidez config files with:

```
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag="config"
```

After that, you'll find all configuration options in `config/rapidez/*.php` with comments explaining the options. Most of them use the `env()` function, so it's possible to have different configurations per environment in the `.env`.

::: tip
For more info on how the configuration works, read the [Laravel configuration docs](https://laravel.com/docs/12.x/configuration).
:::

---

[[toc]]

## Multistore

When you need a different configuration for a specific store, you can create a store specific configuration file: `/config/rapidez/stores/{store_code}/{config_file}` with only the changes you need compared with the default. For example, when store code `de` needs different checkout steps; create `/config/rapidez/stores/de/frontend.php` with:
```php
<?php

return [
    'checkout_steps' => [
        'onestep'
    ],
];
```

## Magento configuration

Some Magento configuration options involve the frontend. As the Magento frontend is not used, most of them don't do anything. Rapidez listens to some of those configurations, they are listed here: [`config/rapidez/magento-defaults.php`](https://github.com/rapidez/core/blob/master/config/rapidez/magento-defaults.php) with their defaults as not all of those can be queried from Magento.

If you need to access a Magento configuration, you can use the [`@config` Blade Directive](theming.html#config) or the Rapidez facade `Rapidez::config()`, which accepts the same parameters as the directive. For more advanced usage (like defining which scope), you can use:
```php
\Rapidez\Core\Models\Config::getValue($path, ConfigScopes::SCOPE_STORE, $scopeId, $options)
```

## Base URL

Rapidez will become the frontend, Magento will only be used for the backend. Because of this, they'll need two different URLs. We suggest setting the `web/secure/base_url` differently per scope:

- **Store View:** `https://webshop.com`
- **Website:** `https://magento.webshop.com`

If you have set this correctly, you can set `GET_MAGENTO_URL_FROM_DATABASE=true` in the Rapidez `.env`, and it will automatically apply the URLs in Rapidez itself.

## Forgot password email

You have to change the URL in the forgot password email to the Rapidez URL:

```diff
- {{var this.getUrl($store,'customer/account/createPassword/',[_query:[token:$customer.rp_token],_nosid:1])}}
+ https://your-rapidez-url.com/resetpassword?token={{var customer.rp_token}}
```

### Alternatively

If you [set the store view "Base URL" to that of your Rapidez installation](configuration.html#base-url), you can keep the `getUrl()` to dynamically determine the URL.

```diff
- {{var this.getUrl($store,'customer/account/createPassword/',[_query:[token:$customer.rp_token],_nosid:1])}}
+ {{var this.getUrl($store,'resetpassword',[_query:[token:$customer.rp_token],_nosid:1])}}
```

## Customer Token Lifetime

By default, the customer token lifetime is set to 1 hour in Magento, so a customer needs to log in again when the token expires in Rapidez. It's recommended to raise the expiration to, for example, 24 hours. See: Stores > Configuration > Services > OAuth > Access Token Expiration.

## Customer Data Lifetime

When using the Standalone Checkout the default Customer Data Lifetime of 1 hour may result in the customer and/or their cart being removed in Magento. It's recommended to raise the lifetime to, for example, 3 hours. See: Stores > Configuration > Customers > Customer configuration > Online Customers Options > Customer Data Lifetime

## Enable Guest Checkout Login

See: Stores > Configuration > Sales > Checkout > Checkout Options, but keep in mind as also mentioned there:

> Enabling this setting will allow unauthenticated users to query if an e-mail address is already associated with a customer account. This can be used to enhance the checkout workflow for guests that do not realize they already have an account but comes at the cost of exposing information to unauthenticated users.

## Robots.txt

By default, Rapidez will use the [robots.txt](https://github.com/rapidez/rapidez/blob/master/public/robots.txt) file. If you'd like to use the Magento configuration from `design/search_engine_robots/custom_instructions`, which gives you the flexibility to have a `robots.txt` per website, you need to remove that file from your repository. That way, it will fallback to the [`robots.txt` route](https://github.com/rapidez/core/blob/master/routes/web.php). Depending on your webserver configuration, you could get a 404 response. For example, [Laravel Forge](https://forge.laravel.com/) and [Laravel Valet](https://laravel.com/docs/12.x/valet) do include a line causing this as the file could not be found:
```
location = /robots.txt  { access_log off; log_not_found off; }
```
The trick is to remove this line or extend it, depending on if you want the other log configurations:
```
location = /robots.txt  { access_log off; log_not_found off; try_files $uri $uri/ /index.php?$query_string; }
```

## Elasticsearch

To communicate with Elasticsearch, Rapidez is using the [rapidez/laravel-scout-elasticsearch](https://github.com/rapidez/laravel-scout-elasticsearch) package. If you need to change the Elasticsearch credentials, you can do so with these `.env` configurations:

```dotenv
ELASTICSEARCH_HOST=http://localhost:9200
ELASTICSEARCH_USER=
ELASTICSEARCH_PASSWORD=
ELASTICSEARCH_SSL_VERIFICATION=true
```

You will also need to set a prefix for your indices:

```dotenv
SCOUT_PREFIX=
```

## Opensearch

For OpenSearch the same applies but you need to add this in your `.env`:

```dotenv
SCOUT_SEARCH_BACKEND=opensearch
```

## Early hints

Rapidez comes with [Early Hints](https://github.com/justbetter/laravel-http3earlyhints) built in. You should enable your early hints in [Cloudflare](https://developers.cloudflare.com/cache/advanced-configuration/early-hints/#enable-early-hints) or your CDN for a boost. Anything loaded with `@vite()` will properly get loaded with early hints, it will also discover other elements on your page which could benefit from early hints. Like your `preload` and `preconnect` links, eager-loaded images, blocking scripts, and blocking styles. You can disable it with:

```dotenv
EARLY_HINTS_ENABLED=false
```

::: tip
You should [preload your custom fonts](https://web.dev/articles/codelab-preload-web-fonts) if they're used during the initial render.
:::
