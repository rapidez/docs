# Upgrading

---

[[toc]]

## Rapidez v4

In this release, we migrated from [ReactiveSearch](https://github.com/appbaseio/reactivesearch/) to [InstantSearch](https://github.com/algolia/instantsearch) 🚀 to index products we're now using [Laravel Scout](https://github.com/laravel/scout) with [Searchkit](https://github.com/searchkit/searchkit) and introducing some new features:

- Search within results filter
- Select super attributes on products while filtering, so when you filter on a color this will be selected on all items so the matching images will show

Other changes included in this release:

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

We switched [mailerlite/laravel-elasticsearch](https://github.com/mailerlite/laravel-elasticsearch) for [matchish/laravel-scout-elasticsearch](https://github.com/matchish/laravel-scout-elasticsearch), with that the configs changed, they are [compatible](https://github.com/matchish/laravel-scout-elasticsearch/pull/307) but we recommend to change them:

```dotenv
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_SCHEME=http
ELASTICSEARCH_USER=
ELASTICSEARCH_PASS=
```
To
```dotenv
ELASTICSEARCH_HOST=http://localhost:9200
ELASTICSEARCH_USER=
ELASTICSEARCH_PASSWORD=
```

You will also have to add the following lines:

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
