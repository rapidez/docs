# Statamic

---

The Rapidez with [Statamic](https://statamic.com/) integration! 🤝🚀

::: info Version 8
This documentation is for [`rapidez/statamic`](https://github.com/rapidez/statamic) `^8.0`, which requires PHP 8.4 and [Statamic 6](https://statamic.dev/).
:::

[[toc]]

## Features

- Products, categories, and read-only product attributes (plus attribute options) are integrated through [Runway](https://github.com/statamic-rad-pack/runway)
- Brand landing pages use a regular Statamic collection named `brands` (with page builder and SEO) that is linked to the Runway resource, which is unlike other Runway resources. The Runway resource itself is hidden.
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

## Content migration

The `statamic-content-migration:migrate-cms-pages` command migrates your Magento 2 CMS pages into Statamic's `pages` collection.
You can use this command as inspiration to create your own content migrations, like blog pages, or FAQ pages.

Optionally limit which pages are migrated with `--identifiers` (comma-separated Magento identifiers) and `--identifier-type` (`whitelist` or `blacklist`, default `whitelist`).

The ConvertField action will transform html into the bard component with the fieldName you pass.
It will use the CleanHtml action to transform messy Magento templates with widgets, variables, nested cms blocks into plain html.

:::tip
Don't like what your html turned into? You can add or remove cleaning steps in `config/rapidez/statamic/migration.php`
:::

## Runway / Magento data

With [Runway](https://github.com/statamic-rad-pack/runway), you're able to display data from an Eloquent model within Statamic. We're using this to have products, categories, and product attribute data from Magento visible within Statamic, without the need of importing and syncing data. These Runway models can be used to link anything within Statamic to existing Magento data.

Brands still use a Runway model under the hood (for example in relations), but the brands Runway resource is **hidden** in the control panel. You add and edit brand landing content as entries in the **`brands` collection** instead, so editors are not faced with two separate brand UIs.

For example, the product slider component within the page builder has a relation with the products Runway model. This way, you can select from all Magento products you'd like to display within the slider.

You can also enrich data with this; when you want to use Statamic to add data on product, category, or brand pages. When saving an entry we're not touching the Magento tables, those are always read-only! We are observing the "updating" event on those models and save all data to a Statamic entry. When retrieving a model we're doing the opposite; merging the data from Magento with the data from the Statamic entry so you still have a single merged view (for brands, that Statamic side is the `brands` collection entry linked to the Magento option).

### Displaying content

If you are going to enrich product or category pages with content from Statamic, you'll find the page builder field on the merged entry in `$content->content`.

To display the default page builder content, you have to add this to your view:

```blade
@includeWhen(isset($content), 'rapidez-statamic::page_builder', ['content' => $content?->content])
```

- Product: `resources/views/vendor/rapidez/product/overview.blade.php`
- Category: `resources/views/vendor/rapidez/category/overview.blade.php`

Brand landing pages use the same `rapidez-statamic::page_builder` partial, but the default blueprint exposes **two** page builder areas. The bundled brand view passes **`$content`** (top) and **`$bottom_content`** straight into the page builder include. Override `resources/views/vendor/rapidez-statamic/brands/show.blade.php` if you want a different layout around the listing.

::: details Disable `$content`
If you don't want `$content` on the product or category pages, you can disable it from the `config/rapidez/statamic.php` config file by setting `fetch.product` or `fetch.category` to `false`
:::

## Brand pages

Just make sure the `brand_attribute_id` is correct within `config/rapidez/statamic.php` so Magento knows which attribute represents a brand. Brand landing content (page builder above and below the product listing, plus SEO fields) lives in the **`brands` collection** in the control panel; the Runway brands resource is configured with `hidden` so you manage brands there only.

If you want to have actual brand pages on the frontend displaying all the products of that brand, you have to enable the route per store within `config/rapidez/statamic/builder.php`:

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

With Statamic you can get data by tag in Blade with:

```php
Statamic::tag('nav:footer')->fetch()
```

This will result in multiple queries to get all data. When you're linking to for example a category, each category will be a query resulting in a lot of queries. This package provides a "helper" that fetches the navigation completely with all children and the result will be unified and cached. When a navigation changes; the cache will be refreshed automatically.

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

When you create a form, you can use `rapidez-statamic::emails.form` as the HTML template, which uses the [Laravel mail template](https://laravel.com/docs/12.x/mail#customizing-the-components) with all fields in a table. Make sure you enable markdown!

## Images
When using Rapidez Statamic, the package pre-integrates the [Glide directive package](https://github.com/justbetter/statamic-glide-directive) to work seamlessly with your Statamic install. It also pushes the Glide head partial onto the `rapidez::layouts.app` stack so the directive can load correctly. Just use the Glide directive as shown, and the package will handle image manipulation with the transformations dictated by your parameters.

```blade
@responsive($image, [
    'alt' => 'This is an alt text.', 
    'class' => 'some classes here',
    'loading' => 'lazy'
])
```

## Sitemap

This package hooks into the [Rapidez Sitemap](https://github.com/rapidez/sitemap) generation by adding Statamic-specific sitemaps to the store's sitemap index. For each store, we generate sitemaps for collections and taxonomies that have a route and content. The folder layout will look like:

```bash
rapidez-sitemaps/{store_id}/{sitemap_prefix}_collection_{collection_handle}.xml
rapidez-sitemaps/{store_id}/{sitemap_prefix}_taxonomy_{taxonomy_handle}.xml
```

With the [default rapidez/sitemap config](https://github.com/rapidez/sitemap/blob/master/config/sitemap.php), the prefix default is `statamic_sitemap_` and can be configured within `config/rapidez/statamic.php`

## Meta title and description

If you want to use Statamic for managing your meta title and description you will have to add it to your templates.
As an example, the category pages:
`vendor/rapidez/core/resources/views/category/overview.blade.php`
```diff
 @extends('rapidez::layouts.app')
 
- @section('title', $category->meta_title ?: $category->name)
- @section('description', $category->meta_description)
+ @section('title', $content?->meta_title ?: $category->meta_title ?: $category->name)
+ @section('description', $content?->meta_description ?: $category->meta_description)
 @section('canonical', url($category->url))
```

## Static caching

Statamic comes with [static caching](https://statamic.dev/static-caching) and this package adds the middleware for that. This means that when you configure static caching with Statamic, it will also be applied to all Rapidez routes.

::: details I'm using multiple stores
When using Statamic Static caching in a multisite setup, you typically need to [manually configure](https://statamic.dev/static-caching#paths) a path for each site for the static files to be stored. However, with Rapidez Statamic, this manual step isn't necessary. The integration automatically sets the correct paths based on the store definitions in the Magento database, saving you time and reducing potential errors.
:::

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

We recommend to schedule this command in `routes/console.php` to invalidate periodically. For more information, see [Task Scheduling](https://laravel.com/docs/12.x/scheduling).

```php
Schedule::command('rapidez-statamic:invalidate-cache')->everyFifteenMinutes();
```

You should also set up exclusions for a few routes in your `config/statamic/static_caching.php` config file:

```php
'exclude' => [
    'exclude' => [
        'class' => null,
        'urls' => [
            '/login',
            '/register',
            '/checkout',
            '/checkout/*',
        ],
    ],
]
```

You should add any other custom routes here that you don't want cached. Most importantly, any routes that will differ based on login state or cart state.

:::tip
You can use this package to make sure caches purged in Statamic also get purged in Cloudflare: [justbetter/statamic-cloudflare-purge](https://github.com/justbetter/statamic-cloudflare-purge).
:::

## Indexing

You can extend the `BaseEntry` model provided with this package to index your collection data into ElasticSearch. See the following example of a blog collection:

```php
<?php

namespace App\Models;

use Rapidez\Statamic\Models\BaseEntry;
use Statamic\Eloquent\Entries\Entry;

class Blog extends BaseEntry
{
    protected static $collection = 'blog';

    protected function getAdditionalIndexData(Entry $entry): array
    {
        return [
            'image' => $entry->image ? $entry->image->url() : '',
            'categories' => $entry->blog_categories->map(fn ($category) => [
                'title' => $category->title,
                'slug' => $category->slug,
            ]),
            'content' => is_array($entry->content) ? json_encode($entry->content) : $entry->content,
        ];
    }
}
```

Note the required definition of `$collection` here. This example also optionally adds some extra data to the indexer by using the `getAdditionalIndexData` function.

You will then also need to add this model into the `rapidez/models.php` config file, like so:

```diff
return [
    ...
+   'blog' => App\Models\Blog::class,
];
```

## Upgrading

### From 7.x to 8.x

::: details

Version 8 upgrades the integration to [Statamic 6](https://statamic.dev/) (and related dependencies such as Runway 9 and the Glide directive v4). Make sure your stack meets PHP 8.4, then run:

```bash
composer update rapidez/statamic -W
```

Follow Statamic's own upgrade guide for any control panel or content changes required by Statamic 6.
:::
