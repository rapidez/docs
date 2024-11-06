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

### Sites configuration

There is no need for a `sites.yaml` in your project anymore. The sites will be registered automatically based on the configured stores in Magento.

The current site will be determined based on the `MAGE_RUN_CODE`. By default Statamic uses the url for this; that's still the fallback. The `group` within the `attributes` will be set based on the `website_code` from Magento. This makes it possible to add alternate hreflang link tags.
You could also add the `store_code` to the `disabled_sites` array within the `rapidez/statamic.php` config if you want to exclude this site from being altered with Statamic data.
```php
'disabled_sites' => [
    '{store_code}'
],
```
When adding a new store in Magento make sure to clear the Laravel cache.

### Routing

As Rapidez uses route fallbacks to allow routes to be added with lower priority than Magento routes, this package is used to fix this, as statamic routes on itself will overwrite your Magento routes. Make sure default Statamic routing is disabled in `config/statamic/routes.php`. We'll register the Statamic routes from this packages after the Magento routes.

```php
'enabled' => false,
```

#### Magento CMS pages

The routing will choose Magento CMS pages over Statamic pages.
This can happen when a CMS page in Magento has the same slug as a page in Statamic, like the homepage.
To show the Statamic page, simply disable the page in Magento.

### Assets disk

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

### Publish Collections, Blueprints and Fieldsets

If you have run the install command these will already have been published.

```bash
php artisan vendor:publish --provider="Rapidez\Statamic\RapidezStatamicServiceProvider" --tag=rapidez-statamic-content
```

And if you'd like to change the views:

```bash
php artisan vendor:publish --provider="Rapidez\Statamic\RapidezStatamicServiceProvider" --tag=views
```

### Showing content on categories and products

By default you'll get the configured content on categories and products available withint the `$content` variable. This can be enabled/disabled with the `fetch` configurations within the `rapidez/statamic.php` config file. If you want to display the configured content from the default page builder you can include this in your view:
```blade
@includeWhen(isset($content), 'rapidez-statamic::page_builder', ['content' => $content?->content])
```
- Product: `resources/views/vendor/rapidez/product/overview.blade.php`
- Category: `resources/views/vendor/rapidez/category/overview.blade.php`


### Brand overview and single brand
#### Brand pages
Single brand pages display a listing page with your products linked to that brand. By default the single brand pages are disabled. You can enable routing for them in `content/collections/brands.yaml` by adding a route for them:

```yaml
route: '/brands/{slug}'
```
#### Brand overview
If you want an overview page for your brands you can add a `Brand overview` component on a normal page. This will automaticly load a view with your brands grouped by their first letter.

### Importing categories or products from Magento

#### Categories

To make it easier to change category content in bulk you can create category entries with content copied over in bulk.

To do this run one of the following:

```bash
# Most basic, import all categories in all sites
php artisan rapidez:statamic:import:categories --all

# Import all categories in the site with handle "default" only
php artisan rapidez:statamic:import:categories --all --site=default

# import select categories in multiple sites
php artisan rapidez:statamic:import:categories 5 8 9 category-url-key --site=default --site=another_site
```

By default the slug and title of the category are copied.

If you have a custom blueprint and would like to add more data from the category you can do so by hooking into the Eventy event: `rapidez-statamic:category-entry-data`

```php
Eventy::addFilter('rapidez.statamic.category.entry.data', fn($category) => [
        'description' => $category->description,
    ]
);
```

#### Products

To make it easier to change product content in bulk you can create product entries with content copied over in bulk.

To do this run one of the following:

```bash
# Most basic, import all products in all sites
php artisan rapidez:statamic:import:products

# Import all products in the site with handle "default" only
php artisan rapidez:statamic:import:products --site=default
```

By default the slug and title of the product are copied.

If you have a custom blueprint and would like to add more data from the product you can do so by hooking into the Eventy event: `rapidez.statamic.product.entry.data`

```php
Eventy::addFilter('rapidez.statamic.product.entry.data', fn($product) => [
        'description' => $product->description,
    ]
);
```

#### Brands

To make it easier to change brands content in bulk you can create brand entries with content copied over in bulk.

To do this run one of the following:

```bash
# Import all brands in all sites
php artisan rapidez:statamic:import:brands

# Import all brands in the site with handle "default" only
php artisan rapidez:statamic:import:brands --site=default
```

By default the slug and title of the brand are copied.

If you have a custom blueprint and would like to add more data from the brand you can do so by hooking into the Eventy event `rapidez.statamic.brand.entry.data`

```php
Eventy::addFilter('rapidez.statamic.brand.entry.data', fn($brand) => [
        'description' => $brand->description,
    ]
);
```

### Globals

Globals will be available through the `$globals` variable.
For example; If you created a global with the handle `header` and added a field called `logo` in this global it will be available as `$globals->header->logo`.

### Forms

When you create a form you could use `rapidez-statamic::emails.form` as HTML template which uses the [Laravel mail template](https://laravel.com/docs/master/mail#customizing-the-components) with all fields in a table, make sure you enable markdown!
