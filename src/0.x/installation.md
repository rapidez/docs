# Installation

---

[[toc]]

## Requirements

- [Laravel requirements](https://laravel.com/docs/8.x/installation#server-requirements)
- PHP >= 7.4
- MySQL >= 5.7.13
- Elasticsearch Basic >= 7.6
- Magento >= 2.4.1 installation with [flat tables enabled](#flat-tables) ([or use a demo shop](#magento-demo-shop))

::: tip Elasticsearch Basic
There are multiple Elasticsearch versions and licenses, see the [subscriptions page](https://www.elastic.co/subscriptions). Rapidez requires at least the basic version which is free but not always installed by default. Make sure you use the "full" or "non-OSS" version otherwise you'll get "no handler for type flattened" errors while [indexing](indexer.md).
:::

## Create your first project

```
composer create-project rapidez/rapidez rapidez
```
```
php artisan rapidez:install
```

::: tip Credentials
Add the url and database credentials from your Magento 2 installation to the `.env`. Have a look at the [configuration docs](configuration.md) for all options.
:::

```
yarn
yarn run prod
php artisan storage:link
php artisan rapidez:validate
php artisan rapidez:index
```
Use your favorite webserver (we like [Valet+](https://github.com/weprovide/valet-plus) on macOS) or use Laravel's built-in development server:
```
php artisan serve
```
See it in the browser! 🚀

::: tip Note
The `rapidez/rapidez` repository contains a fresh Laravel installation with the Rapidez Core and some other packages installed to give you a good start. If you have an existing project or want to start from scratch you can install the Rapidez packages yourself. Just have a look at the `composer.json`
:::

::: warning Product image speed
The first time product images will load slowly as they are resized on the fly. Have a look at the [Image Resizer](https://github.com/rapidez/image-resizer) package to read how this is working.
:::

## CORS

### Magento

Rapidez is making AJAX requests to the Magento API which requires CORS to be opened.
- To do so with Laravel Valet see [this](https://gist.github.com/poul-kg/b669a76fc27afcc31012aa0b0e34f738) and for Valet+ see [this](https://github.com/weprovide/valet-plus/issues/493).
- With the Docker Magento installation it's already opened [with a patch](https://github.com/michielgerritsen/magento2-extension-integration-test/blob/master/magento/patches/cors.patch).
- For production you've to restrict this to your domain within your webserver configuration or with for example this [Magento 2 CORS module](https://github.com/graycoreio/magento2-cors).

### Elasticsearch

If you're using your own Elasticsearch installation you've to open CORS in `elasticsearch.yml` and restart Elasticsearch. An example can be found in the the project: [`elasticsearch.yml`](https://github.com/rapidez/rapidez/blob/master/elasticsearch.yml). That configuration is used when you're using Elasticsearch from the [Docker Compose config](https://github.com/rapidez/rapidez/blob/master/docker-compose.yml).

## Flat tables

The flat tables need to be enabled in Magento because Rapidez needs them to easily query for products and categories. You can follow [this guide](https://docs.magento.com/user-guide/catalog/catalog-flat.html#step-1-enable-the-flat-catalog) to enable it. After that you need to make sure the [Storefront Properties](https://docs.magento.com/user-guide/stores/attributes-product.html#storefront-properties) are configured correctly for all your attributes, you can validate the settings with `php artisan rapidez:validate`. If the result is that some attributes are not in the flat table you can enable "Used in Product Listing" on them and validate again.

::: warning
All attributes with "Used in Product Listing" enabled will be indexed into Elasticsearch. As this index is publicly available you should be careful with attributes which contain "sensitive" data like for example sale counts.
:::

Finally when your settings are validated you should [run the Magento indexes](https://devdocs.magento.com/guides/v2.4/config-guide/cli/config-cli-subcommands-index.html#config-cli-subcommands-index-reindex). For example with `bin/magento indexer:reindex` from your Magento installation.

::: warning Row size too large
If you run into "Row size too large" MySQL errors when indexing in Magento then you disable "Used in Product Listing" for the attributes which contains the most data like descriptions until the indexes run fine.
:::

## Multistore

When you've setup multiple stores in Magento then Rapidez needs to know which store to show. Rapidez listens to the `MAGE_RUN_CODE` like Magento does. So just set that variable from your webserver.

With Nginx you could use a map, for example:

```
map $http_host $MAGE_RUN_CODE {
    default default_store_code;
    second-store.com second_store_code;
    thrid-store.com third_store_code;
}
```

And pass that to PHP-FPM:
```
fastcgi_param MAGE_RUN_CODE $MAGE_RUN_CODE;
```

## Demo Magento 2 webshop

If you do not have a Magento 2 installation yet, you want to test Rapidez or like to develop with a fresh Magento 2 installation you can use a Magento 2 and Elasticsearch installation in a Docker container.

::: tip
Make sure Docker can use at least 4GB of memory!
:::

```
docker-compose up -d
docker exec rapidez_magento magerun2 indexer:reindex
```
Edit the `.env`

```
MAGENTO_URL=http://localhost:1234
DB_PORT=3307
DB_DATABASE=magento
DB_USERNAME=magento
DB_PASSWORD=password
```
