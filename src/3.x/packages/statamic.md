# Statamic

---

This is the Rapidez integration for Statamic, this package gives you some good starting points for integrating products, categories & brands.

You can check the whole feature list and installation guide on the [Github page](https://github.com/rapidez/statamic).

[[toc]]

## Configuration

We recommend using the following configuration to setup Statamic in your Rapidez project.
Have a look within the `rapidez/statamic.php` config file, if you need to change something you can publish it with:

```bash
php artisan vendor:publish --provider="Rapidez\Statamic\RapidezStatamicServiceProvider" --tag=config
```

## Sites configuration

There is no need for a `sites.yaml` in your project anymore. The sites will be registered automatically based on the configured stores in Magento.

The current site will be determined based on the `MAGE_RUN_CODE`. By default Statamic uses the url for this; that's still the fallback. The `group` within the `attributes` will be set based on the `website_code` from Magento. This makes it possible to add alternate hreflang link tags. You could also add the `store_code` to the `disabled_sites` array within the `rapidez/statamic.php` config if you want to exclude this site from being altered with Statamic data.
```php
'disabled_sites' => [
    '{store_code}'
],
```
When adding a new store in Magento make sure to clear the Laravel cache.

## Routing

As Rapidez uses route fallbacks to allow routes to be added with lower priority than Magento routes, this package is used to fix this, as statamic routes on itself will overwrite your Magento routes. Make sure default Statamic routing is disabled in `config/statamic/routes.php`. We'll register the Statamic routes from this packages after the Magento routes.

```php
'enabled' => false,
```

### Magento CMS pages

The routing will choose Magento CMS pages over Statamic pages.
This can happen when a CMS page in Magento has the same slug as a page in Statamic, like the homepage.
To show the Statamic page, simply disable the page in Magento.

## Assets disk

Make sure there is an assets disk within `config/filesystems.php`
```php
'disks' => [
    'assets' => [
        'driver' => 'local',
        'root' => public_path('assets'),
        'url' => '/assets',
        'visibility' => 'public',
    ],
],
```

## Publishing views

If you have run the install command these will already have been published.

```bash
php artisan vendor:publish --provider="Rapidez\Statamic\RapidezStatamicServiceProvider" --tag=views
```

## Showing content on categories and products

By default you'll get the configured content on categories and products available withint the `$content` variable. This can be enabled/disabled with the `fetch` configurations within the `rapidez/statamic.php` config file. If you want to display the configured content from the default page builder you can include this in your view:
```blade
@includeWhen(isset($content), 'rapidez-statamic::page_builder', ['content' => $content?->content])
```
- Product: `resources/views/vendor/rapidez/product/overview.blade.php`
- Category: `resources/views/vendor/rapidez/category/overview.blade.php`


## Brand overview and single brand
### Brand pages
Single brand pages display a listing page with your products linked to that brand. By default the single brand pages are disabled. You can enable routing for them in `content/collections/brands.yaml` by adding a route for them:

```yaml
route: '/brands/{slug}'
```
### Brand overview
If you want an overview page for your brands you can add a `Brand overview` component on a normal page. This will automaticly load a view with your brands grouped by their first letter.

## Editing Categories, Products or Brands from Magento

When editing a category, product or brand from Magento, the data is automatically synced to Statamic.
There are 3 Runway resources that are synced:
- Category
- Product
- Brand

It's possible to add more fields to these resources by changing their respective blueprints.
These blueprints can be found in `resources/blueprints/vendor/runway/category.yaml`, `resources/blueprints/vendor/runway/product.yaml` and `resources/blueprints/vendor/runway/brand.yaml`.

The Page Builder is added on these blueprints by default.

### Categories

By default the slug and title of the category are copied.

If you have a custom blueprint and would like to add more data from the category you can do so by hooking into the Eventy event: `rapidez-statamic:category-entry-data`

```php
Eventy::addFilter('rapidez.statamic.category.entry.data', fn($category) => [
        'description' => $category->description,
    ]
);
```

### Products

By default the slug and title of the product are copied.

If you have a custom blueprint and would like to add more data from the product you can do so by hooking into the Eventy event: `rapidez.statamic.product.entry.data`

```php
Eventy::addFilter('rapidez.statamic.product.entry.data', fn($product) => [
        'description' => $product->description,
    ]
);
```

### Brands

By default the slug and title of the brand are copied.

If you have a custom blueprint and would like to add more data from the brand you can do so by hooking into the Eventy event `rapidez.statamic.brand.entry.data`

```php
Eventy::addFilter('rapidez.statamic.brand.entry.data', fn($brand) => [
        'description' => $brand->description,
    ]
);
```

We also added support for the Amasty ShopBy Brand module, if this module is installed it will migrate the data from the Amasty Brand module to Statamic after running the the Brand import command:

```bash
# Import all brands in all sites
php artisan rapidez:statamic:import:brands

# Import all brands in the site with handle "default" only
php artisan rapidez:statamic:import:brands --site=default
```

## Globals

Globals will be available through the `$globals` variable.
For example; If you created a global with the handle `header` and added a field called `logo` in this global it will be available as `$globals->header->logo`.

## Forms

When you create a form you could use `rapidez-statamic::emails.form` as HTML template which uses the [Laravel mail template](https://laravel.com/docs/11.x/mail#customizing-the-components) with all fields in a table, make sure you enable markdown!

## Sitemap

We hook into the [Rapidez Sitemap](https://github.com/rapidez/sitemap) generation by adding our Statamic-specific sitemaps to the store's sitemap index. 

For each store, we generate sitemaps for collections and taxonomies that have actual routes and content. The XML files will be stored in the configured sitemap disk (defaults to 'public') under the configured path (defaults to 'rapidez-sitemaps') with the following structure:
```shell
rapidez-sitemaps/{store_id}/{sitemap_prefix}_collection_{collection_handle}.xml
rapidez-sitemaps/{store_id}/{sitemap_prefix}_taxonomy_{taxonomy_handle}.xml
```

The sitemap prefix can be configured in the `rapidez.statamic.sitemap.prefix` config.

## Upgrade Guide

### Upgrade from `rapidez/statamic` 2.x to 3.x

Since 3.0.0 we have started using optionalDeep for the $globals, and $content variables.
This means some code may need to be upgraded. Here's a list of things you can expect might need to be changed:

Since optionalDeep will always return the optional class we explicitly need to ask it if a value is set
```diff
- @if($globals->cookie_notice->text)
+ @if($globals->cookie_notice->text->isset())
```

This also means that checks for specific values need to be updated
```diff
- @if($globals->cookie_notice->text === 'foo')
+ @if($globals->cookie_notice->text->get() === 'foo')
```

However, anything that will attempt to cast the value to string will get the value right away. Thus bits that can stay unchanged are:
```blade
{{ $globals->cookie_notice->text }}
{{ $globals->cookie_notice->text ?? 'fallback value' }}
{{ $globals->cookie_notice->text . ' string concatenation' }}
@foreach($content->blocks as $contentBlock)

@endForeach
```

### Upgrade from `rapidez/statamic` 4.x to 5.x
Ensure that all dependencies are compatible with version 5.x and follow the upgrade instructions provided in the official documentation.

```bash
composer update rapidez/statamic -W
```

#### Remove Blueprint Directories
> [!IMPORTANT]
> Before removing the blueprint and content directories, ensure you have copied over any custom fields or configurations you need to retain.

You can remove the following blueprint directories:
- `resources/blueprints/collections/categories`
- `resources/blueprints/collections/products`
- `resources/blueprints/collections/brands`

#### Remove Content Directories
The following content directories can also be removed:
- `content/collections/categories`
- `content/collections/products`
- `content/collections/brands`
- `content/collections/products.yaml`
- `content/collections/categories.yaml`
- `content/collections/brands.yaml`

#### Clear Cache
Run the following command to clear the cache:
- `php artisan optimize:clear`

#### Import Page Builder Fieldset
Add the following line to the specified runway resources blueprints:
- `resources/blueprints/vendor/runway/product.yaml`
- `resources/blueprints/vendor/runway/category.yaml`
- `resources/blueprints/vendor/runway/brand.yaml`:

```yaml
import: page_builder
```

#### Change Runway Collections to Not Read-Only
Update the runway collections to be not read-only by modifying the following code in `config/statamic.php`:
```php
\Rapidez\Statamic\Models\Product::class => [
    'name' => 'Products',
    'read_only' => false,
    'title_field' => 'sku',
    'cp_icon' => 'table',
],

\Rapidez\Statamic\Models\Category::class => [
    'name' => 'Categories',
    'read_only' => false,
    'title_field' => 'name',
    'cp_icon' => 'array',
],

\Rapidez\Statamic\Models\Brand::class => [
    'name' => 'Brands',
    'read_only' => false,
    'title_field' => 'value_store',
    'cp_icon' => 'tags',
    'order_by' => 'sort_order',
],
```
Additionally, add `visibility: read_only` to the system fields of Magento in the runway blueprints:
- In `category.yaml`, the fields are: `entity_id`, `name`.
- In `brand.yaml`, the fields are: `option_id`, `sort_order`, `value_admin`, `value_store`.
- In `product.yaml`, the fields are: `entity_id`, `sku`, `name`.

#### Note
- Make sure to back up your project before performing these steps to prevent any data loss.
- Additionally, ensure that if there are any custom fields in the old blueprints we deleted, they are copied over to the new runway blueprints.
