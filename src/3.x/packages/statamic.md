# Statamic

---

The Rapidez with [Statamic](https://statamic.com/) integration! 🤝🚀

::: info Version 5
This documentation is for [`rapidez/statamic`](https://github.com/rapidez/statamic) version 5
:::

[[toc]]

## Features

- Products, categories, and brands are integrated through [Runway](https://github.com/statamic-rad-pack/runway)
- Automatic site registration based on Magento stores
- Routing: Statamic routes are the fallback
- Page builder fieldset with multiple components:
    - Product slider
    - Content
    - Image
    - Form
- Navigation component
- Responsive images with [Glide](https://github.com/justbetter/statamic-glide-directive)
- Breadcrumbs on pages
- Globals available in all views
- SEO meta title and description
- Automatic alternate hreflang link tags
- Sitemap for all sites, collections, and taxonomies

## Installation

1. **Install Statamic with the Rapidez Statamic integration**

```bash
composer require rapidez/statamic
```

2. **Run the install command**

```bash
php artisan rapidez-statamic:install
```

And follow the steps. When finished visit `/cp` for the control panel 🚀

## Configuration

The configuration file can be published with:

```bash
php artisan vendor:publish --provider="Rapidez\Statamic\RapidezStatamicServiceProvider" --tag=config
```

After that, you'll find all options within `config/rapidez/statamic.php`

### Sites

Sites within Statamic will automatically be registered based on the Magento stores. So there is no need for a `sites.yaml`. The current site will be determined based on the `MAGE_RUN_CODE`, and the alternate hreflang link tags are grouped by the `website_code`

::: warning Sites cache
Make sure to flush the cache after editing stores in Magento!
:::

::: details Disable Statamic for a store
To disable Statamic for a specific store, just add the `store_code` to the `disabled_sites` within `config/rapidez/statamic.php`
:::

### Routing

The default Statamic routing will override the Rapidez routes. We don't want that, so you have to disable the default Statamic routing within `config/statamic/routes.php`

```php
'enabled' => false,
```

The integration package will register the Statamic routes as fallback, so it tries the Magento routes first.

::: tip Seeing a Magento page instead of Statamic?
This can happen when a CMS page in Magento has the same slug as a page in Statamic, like the homepage. To show the Statamic page, simply disable the page in Magento.
:::

### Assets

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

## Runway / Magento data

With [Runway](https://github.com/statamic-rad-pack/runway), you're able to display data from an Eloquent model within Statamic. We're using this to have all products, categories, and brands from Magento visible within Statamic, without the need of importing and syncing data. These Runway models can be used to link anything within Statamic to existing Magento data.

For example, the product slider component within the page builder has a relation with the products Runway model. This way, you can select from all Magento products you'd like to display within the slider.

You can also enrich data with this; when you want to use Statamic to add data on product, category, or brand pages. When saving an entry we're not touching the Magento tables, those are always read-only! We are observing the "updating" event on those models and save all data to a Statamic entry. When reveiving a model we're doing opposite; merging the data from Magento with the data from the Statamic entry so we just have one collection.

### Displaying content

If you are going to enrich product / category pages with content from Statamic, you'll find all data within the `$content` variable.

To display the default page builder content, you have to add this to your view:

```blade
@includeWhen(isset($content), 'rapidez-statamic::page_builder', ['content' => $content?->content])
```

- Product: `resources/views/vendor/rapidez/product/overview.blade.php`
- Category: `resources/views/vendor/rapidez/category/overview.blade.php`

::: details Disable `$content`
If you don't want `$content` on the product / category pages, you can disable it from the `config/rapidez/statamic.php` config file by setting the `fetch` option to `false`
:::

## Brand pages

Just make sure the `brand_attribute_id` is correct within `config/rapidez/statamic.php` and all brands will be available within Statamic automatically. If you want to have actual brand pages on the frontend displaying all the products of that brand, you have to enable the route per store within `config/rapidez/statamic/builder.php`:

```php
'routes' => [
    Brands::class => [
        'store_code' => 'brand/{slug}'
    ],
],
```

For a "brand overview" page with all brands listed alphabetically, you can just create a normal page from the control panel and use the "brand overview" component.

::: details I'm using the Amasty ShopBy Brand module
Good news! There is an import command to import the data!
```bash
php artisan rapidez:statamic:import:brands
```
:::

## Navigation

To render a navigation somewhere we provide two options; a full main navigation option with a mobile sliderover menu + a helper with a unified cached output to render it yourself.

### Navigation helper

With Statamic you can get a data by tag in Blade with:

```php
Statamic::tag('nav:footer')->fetch()
```

This will result in multiple queries to get all data. When you're linking to for example a category, each category will be a query resulting in a lot of queries. This packages provides a "helper" that fetches the navigation completely with all children and the result will be unified and cached. When a navigation changes; the cache will refreshed automatically.

```php
RapidezStatamic::nav('nav:footer')
```

::: details Example usage
```blade
<ul>
    @foreach (RapidezStatamic::nav('nav:footer') as $item)
        <li>
            <a href="{{ $item['url'] }}">
                {{ $item['title'] }}
            </a>
        </li>
        {{-- $item['children'] --}}
    @endforeach
</ul>
```
:::

### Main navigation

When you need a navigation from Statamic to be your site's main navigation in the header we provide a Blade component that handles everything for you:

```blade
<x-rapidez-statamic::nav
    nav="nav:main"
    {{-- Optionally a different mobile menu; of multiple combined --}}
    :mobileNav="['nav:main', 'nav:header_links']"
/>
```

In `resources/views/vendor/rapidez/layouts/partials/header.blade.php` replace the default Rapidez navigation with this component and you'll get a navigation displaying the main items in the header and the children within a "mega menu" dropdown on hover.

On mobile the whole menu will be in a slideover from [rapidez/blade-components](https://github.com/rapidez/blade-components); to open the mobile menu you've to add a opener somewhere and style this however you'd like:

```blade
<label for="navigation">
    Open mobile menu
</label>
```

## Globals

All Statamic globals will be available through the `$globals` variable within your Rapidez Blade templates. If you have a global with the handle "header" and added a field called "logo", it will be available as `$globals->header->logo`

## Forms

When you create a form, you can use `rapidez-statamic::emails.form` as the HTML template, which uses the [Laravel mail template](https://laravel.com/docs/11.x/mail#customizing-the-components) with all fields in a table. Make sure you enable markdown!

## Sitemap

This package hooks into the [Rapidez Sitemap](https://github.com/rapidez/sitemap) generation by adding Statamic-specific sitemaps to the store's sitemap index. For each store, we generate sitemaps for collections and taxonomies that have a route and content. The folder layout will look like:

```bash
rapidez-sitemaps/{store_id}/{sitemap_prefix}_collection_{collection_handle}.xml
rapidez-sitemaps/{store_id}/{sitemap_prefix}_taxonomy_{taxonomy_handle}.xml
```

With the [default rapidez/sitemap config](https://github.com/rapidez/sitemap/blob/master/config/sitemap.php), the prefix default is `statamic_sitemap_` and can be configured within `config/rapidez/statamic.php`

## Static caching

Statamic comes with [static caching](https://statamic.dev/static-caching) and with this packages we're adding the middleware that handles that from Statamic to all Rapidez web routes. When you configure static caching with Statamic it will also be applied to all Rapidez routes!

::: details Cloudflare Static Caching
Cloudflare's CDN edge can bring these static files even closer and faster to the customer. To achieve this you will need to create a [Cloudflare cache rule](../cache.md#cloudflare) and add a cache control header to your static route:

```nginx
location @static {
    add_header Cache-Control "max-age=120, stale-while-revalidate=3600";# [!code ++]
    try_files /static${uri}_$args.html $uri $uri/ /index.php?$args;
}
```
:::

Invalidation is handled by a command that checks the `updated_at` column on products, categories and pages in Magento. Everything updated after the latest invalidation will be invalidated:

```bash
php artisan rapidez-statamic:invalidate-cache
```

We recommend to schedule this command in `routes/console.php` to invalidate periodically. For more information, see [Task Scheduling](https://laravel.com/docs/11.x/scheduling).

```php
Schedule::command('rapidez-statamic:invalidate-cache')->everyFifteenMinutes();
```

## Upgrading

### From 4.x to 5.x

:::: details
```bash
composer update rapidez/statamic -W
```

#### Remove blueprints and content

::: danger
Before removing the blueprint and content directories, ensure you have copied over any custom fields or configurations you need to retain!
:::

You can remove all these directories and files:

- `resources/blueprints/collections/categories`
- `resources/blueprints/collections/products`
- `resources/blueprints/collections/brands`
- `content/collections/categories`
- `content/collections/products`
- `content/collections/brands`
- `content/collections/products.yaml`
- `content/collections/categories.yaml`
- `content/collections/brands.yaml`

And clear the cache afterward: `php artisan cache:clear`

#### Import the page builder fieldset

Add this line:

```yaml
import: page_builder
```

In these Runway resource blueprints:

- `resources/blueprints/vendor/runway/product.yaml`
- `resources/blueprints/vendor/runway/category.yaml`
- `resources/blueprints/vendor/runway/brand.yaml`

#### Writable Runway resources

Within the `config/rapidez/statamic.php` config, make the Runway resources writable by changing the `read_only` to `false`. Additionally, add `visibility: read_only` to the system fields of Magento in the Runway blueprints:

- In `category.yaml`, the fields are: `entity_id`, `name`
- In `brand.yaml`, the fields are: `option_id`, `sort_order`, `value_admin`, `value_store`
- In `product.yaml`, the fields are: `entity_id`, `sku`, `name`
::::
