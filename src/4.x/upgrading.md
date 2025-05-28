# Upgrading

---

[[toc]]

## Rapidez v4

In this release, we migrated from [ReactiveSearch](https://github.com/appbaseio/reactivesearch/) to [InstantSearch](https://github.com/algolia/instantsearch) 🚀 to index products. We're now using [Laravel Scout](https://github.com/laravel/scout) with [Searchkit](https://github.com/searchkit/searchkit), and with this are introducing some new features:

- [Search within results filter](https://github.com/rapidez/core/blob/master/resources/views/listing/partials/filter/search.blade.php)
- [Search history](https://github.com/rapidez/core/pull/849), your latest searches visible within the autocomplete
- [Search suggestions](https://github.com/rapidez/core/pull/813), based on previous searches
- Select super attributes on products while filtering, so when you filter on a color this will be selected on all items so the matching images will show

Other changes included in this release:

- [Config refactor](https://github.com/rapidez/core/pull/769)
- [Custom range slider](https://github.com/rapidez/core/blob/master/resources/views/components/input/range-slider.blade.php), removing the [vue-slider-component](https://github.com/NightCatSama/vue-slider-component) dependency
- Made more components customizable from Blade:
    - [Category filter](https://github.com/rapidez/core/blob/master/resources/views/listing/partials/filter/category.blade.php)
    - [Pagination](https://github.com/rapidez/core/blob/master/resources/views/listing/partials/pagination.blade.php)
    - [Toolbar](https://github.com/rapidez/core/blob/master/resources/views/listing/partials/toolbar.blade.php) ([stats](https://github.com/rapidez/core/blob/master/resources/views/listing/partials/toolbar/stats.blade.php), [items per page](https://github.com/rapidez/core/blob/master/resources/views/listing/partials/toolbar/pages.blade.php) and [sorting](https://github.com/rapidez/core/blob/instantsearch/resources/views/listing/partials/toolbar/sorting.blade.php))
- [Visual improvements](https://github.com/rapidez/core/pull/832)

You should review [all template/config changes](https://github.com/rapidez/core/compare/3.x..master)

## Composer dependencies

Check all your dependencies one by one to see if they're compatible and what has changed in changelogs / release notes. To get a nice overview, run the following command:
```bash
composer outdated
```

### `.env` changes

We switched [mailerlite/laravel-elasticsearch](https://github.com/mailerlite/laravel-elasticsearch) for [matchish/laravel-scout-elasticsearch](https://github.com/matchish/laravel-scout-elasticsearch). With that change, the configs have also changed. They are [compatible](https://github.com/matchish/laravel-scout-elasticsearch/pull/307) but we recommend changing them from:

```dotenv
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_SCHEME=http
ELASTICSEARCH_USER=
ELASTICSEARCH_PASS=
```
To:
```dotenv
ELASTICSEARCH_HOST=http://localhost:9200
ELASTICSEARCH_USER=
ELASTICSEARCH_PASSWORD=
```

You will also have to replace `ELASTICSEARCH_PREFIX` with `SCOUT_PREFIX`:

```diff
-  ELASTICSEARCH_PREFIX="your_prefix_here"
+  SCOUT_PREFIX="your_prefix_here"
```

## Frontend changes

### Dependencies

1. **Remove**
```bash
yarn remove @appbaseio/reactivesearch-vue
```

2. **Install**
```bash
yarn add -D @searchkit/instantsearch-client instantsearch.js vue-instantsearch
```
3. **Build**
```bash
yarn build
```

:::tip
We recommend to double check all frontend dependencies with `yarn outdated`. But keep in mind that Rapidez doesn't support Vue 3 yet.
:::

## Config refactor

### Store-specific values

With the config refactor comes a rework of how store-specific config values get defined. You will have to change the `checkout_steps` and `themes` values in `frontend.php` to reflect this:

```diff
'checkout_steps' => [
-  'default' => ['login', 'credentials', 'payment'],
+  'login', 'credentials', 'payment',
],
...
-'themes' => [
-   'default' => resource_path('themes/default'),
-],
+'theme' => resource_path('themes/default'),
```

Any store-specific values have been moved to store-specific config files. For example, if you had a store with store_code `secondstore` with a different theme folder, you need to make a new config file under `config/rapidez/stores/secondstore/frontend.php` like this:

```php
<?php

return [
    'theme' => resource_path('themes/secondstore'),
];
```

With this refactor, you can use this method to override *any* Rapidez config value with a store-specific variant. See also [the documentation for this functionality](configuration.md#multistore).
