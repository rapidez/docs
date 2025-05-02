# Upgrading

---

[[toc]]

## Rapidez v4

In this release, we migrated from [ReactiveSearch](https://github.com/appbaseio/reactivesearch/) to [InstantSearch](https://github.com/algolia/instantsearch) 🚀 (using [Searchkit](https://github.com/searchkit/searchkit) and [Laravel Scout](https://github.com/laravel/scout)), with that some new features where added:

- Search within results filter
- Select super attributes on products while filtering, so when you filter on a color this will be selected on all items so the matching images will show

And some other changes included in this release:

- Config refactor
- Custom range slider, removing the [vue-slider-component](https://github.com/NightCatSama/vue-slider-component) dependency
- Made more components customizable from Blade:
    - Category filter
    - Pagination
    - Toolbar (stats, items per page and sorting)

You should review [all template/config changes](https://github.com/rapidez/core/compare/3.x..master)

## Composer dependencies

Check all your dependencies one by one to see if they're compatible and what has changed in changelogs / release notes. To get a nice overview run:
```bash
composer outdated
```

### `.env` changes

We changed the product index to use [Laravel Scout](https://github.com/laravel/scout), to support [ElasticSearch](https://github.com/elastic/elasticsearch) as driver we need an [elasticsearch driver](https://github.com/matchish/laravel-scout-elasticsearch) and with this change we don't need [mailerlite/laravel-elasticsearch](https://github.com/mailerlite/laravel-elasticsearch) anymore. To configure scout, you need to add the following `.env` lines:

```dotenv
SCOUT_DRIVER=Matchish\ScoutElasticSearch\Engines\ElasticSearchEngine
SCOUT_PREFIX="your_prefix_here"
```

Note that `ELASTICSEARCH_PREFIX` has been replaced with `SCOUT_PREFIX`.

### `providers.php` changes

You need to add the Scout Elasticsearch provider to your providers file:

```php
Matchish\ScoutElasticSearch\ElasticSearchServiceProvider::class,
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
