# Statamic

---

The Rapidez with [Statamic](https://statamic.com/) integration! 🤝🚀

::: info Version 4
This documentation is for [`rapidez/statamic`](https://github.com/rapidez/statamic/tree/4.x) version 4
:::

[[toc]]

## Features

- Products, categories, and brands are integrated through [Runway](https://github.com/statamic-rad-pack/runway)
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

1. **Install Statamic**

> Just follow the [Statamic installation guide](https://statamic.dev/installing/laravel)

2. **Prepare the user model**

> Copy these two files from Laravel into your project:
>
> - [app/Models/User.php](https://github.com/laravel/laravel/blob/11.x/app/Models/User.php)
> - [database/migrations/0001_01_01_000000_create_users_table.php](https://github.com/laravel/laravel/blob/11.x/database/migrations/0001_01_01_000000_create_users_table.php)

3. **Install the Rapidez Statamic integration**

```bash
composer require rapidez/statamic
```

4. **Finish the user model**

> Follow the [storing users in a database guide](https://statamic.dev/tips/storing-users-in-a-database#in-an-existing-laravel-app)

5. **Run the install command**

```bash
php artisan rapidez-statamic:install
```

When running the install command, you will be prompted to setup the Eloquent driver. In this configuration, you can choose what to keep in the flat file system and what to migrate to the database. We recommend migrating the following options to the database when setting up the eloquent driver:

- Assets
- Collection Trees
- Entries
- Forms
- Form Submissions
- Globals
- Global Variables
- Navigation Trees
- Terms
- Tokens

## Configuration

The configuration file can be published with:

```bash
php artisan vendor:publish --provider="Rapidez\Statamic\RapidezStatamicServiceProvider" --tag=config
```

After that, you'll find all options within `config/rapidez/statamic.php`

### Sites

Sites can be configured in the `config/rapidez/statamic.php`, no need for a `sites.yaml`

```php
'sites' => [
    'default' => [
        'name' => env('APP_NAME', 'Statamic'),
        'locale' => 'en_EN',
        'lang' => 'en_EN',
        'url' => '/',
        'attributes' => [
            'magento_store_id' => 1,
            'group' => 'default',
            'disabled' => false,
        ],
    ],
]
```

The current site will be determined based on the `MAGE_RUN_CODE`, and the alternate hreflang link tags are grouped by the `group`

::: warning Sites cache
Make sure to flush the cache after editing stores in Magento!
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

You can also enrich data with this. For example, when you want to use Statamic to add data on product, category, or brand pages. Therefore, next to the "Runway product collection" (which is read-only and has all data from Magento), there is also a "Product content collection". From there, you're free to use anything from Statamic. Only the `linked_product` field using the `belongs_to` field type should be there to link your custom content to a product within Magento.

::: warning This is changed in rapidez/statamic v5!
See the [rapidez/statamic v5 docs](../../3.x/packages/statamic.md#runway-magento-data) and the [pull request](https://github.com/rapidez/statamic/pull/80) for more information.
:::

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

You'll get a brand collection out-of-the-box. You could just create entries, but those can also be imported from Magento. Double-check the `brand_attribute_id` within `config/rapidez/statamic.php` and run the import command:

```bash
php artisan rapidez:statamic:import:brands
```

::: details I'm using the Amasty ShopBy Brand module
Good news! We'll detect that module and import all existing data into Statamic!
:::

If you want to have actual brand pages on the frontend displaying all the products of that brand, you have to enable the route within `content/collections/brands.yaml`

```yaml
route: '/brands/{slug}'
```

For a "brand overview" page with all brands listed alphabetically, you can just create a normal page from the control panel and use the "brand overview" component.

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

Invalidation is handled by a command that checks the `updated_at` column on products, categories and pages in Magento. Everything updated after the latest invalidation will be invalidated:

```bash
php artisan rapidez-statamic:invalidate-cache
```

We recommend to schedule this command in `routes/console.php` to invalidate periodically. For more information, see [Task Scheduling](https://laravel.com/docs/11.x/scheduling).

```php
Schedule::command('rapidez-statamic:invalidate-cache')->everyFifteenMinutes();
```

## Upgrading

### From 2.x to 3.x

::: details
Since 3.0.0, we have started using [`optionalDeep()`](https://github.com/rapidez/blade-directives#optionaldeep) for the `$globals` and `$content` variables. Some code may need to be upgraded. Things you need to change:

The class will always be returned; you explicitly need to check if the value is set:

```diff
- @if($globals->cookie_notice->text)
+ @if($globals->cookie_notice->text->isset())
```

This also means that checks for specific values need to be updated:

```diff
- @if($globals->cookie_notice->text === 'foo')
+ @if($globals->cookie_notice->text->get() === 'foo')
```

However, anything that will attempt to cast the value to a string will get the value right away. No changes needed here:

```blade
{{ $globals->cookie_notice->text }}
{{ $globals->cookie_notice->text ?? 'fallback value' }}
{{ $globals->cookie_notice->text . ' string concatenation' }}
@foreach($content->blocks as $contentBlock)
    {{ $contentBlock }}
@endForeach
```
:::
