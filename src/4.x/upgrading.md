# Upgrading

---

[[toc]]

## Rapidez v4

In this release, we migrated from [ReactiveSearch](https://github.com/appbaseio/reactivesearch/) to [InstantSearch](https://github.com/algolia/instantsearch) 🚀. To index products, we're now using [Laravel Scout](https://github.com/laravel/scout) with [Searchkit](https://github.com/searchkit/searchkit).

With this we're introducing some new features:

- [Search within results filter](https://github.com/rapidez/core/blob/master/resources/views/listing/partials/filter/search.blade.php)
- [Search history](https://github.com/rapidez/core/pull/849), your latest searches visible within the autocomplete
- [Search suggestions](https://github.com/rapidez/core/pull/813), based on previous searches
- [Select super attributes on products while filtering](https://github.com/rapidez/core/pull/781), so when you filter on a color this will be selected on all items so the matching images will show

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

We switched [mailerlite/laravel-elasticsearch](https://github.com/mailerlite/laravel-elasticsearch) for [rapidez/laravel-scout-elasticsearch](https://github.com/rapidez/laravel-scout-elasticsearch). With that change, the configs have also changed. They are [compatible](https://github.com/matchish/laravel-scout-elasticsearch/pull/307) but we recommend changing them from:

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

If you wish to use OpenSearch add this in your `.env`:
```dotenv
SCOUT_SEARCH_BACKEND=opensearch
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

## Using AI?

::: details Using AI? This prompt will give you a head start! Do still check everything manually.
`````markdown
# Rapidez v4 Upgrade Guide

You are a Laravel and Vue expert, use these instructions to upgrade a Rapidez project from V3 to V4.

---

## Table of Contents

1. [Search — ReactiveSearch → vue-instantsearch + Searchkit](#1-search--reactivesearch--vue-instantsearch--searchkit)
2. [Blade Components — Renames, Removals & New Files](#2-blade-components--renames-removals--new-files)
3. [Checkout Step File Renames](#3-checkout-step-file-renames)
4. [Vue Component & Directive Changes](#4-vue-component--directive-changes)
5. [JavaScript Store Changes](#5-javascript-store-changes)
6. [Vue Root Data Changes](#6-vue-root-data-changes)
7. [Callbacks & Utilities Changes](#7-callbacks--utilities-changes)
8. [Authentication Changes](#8-authentication-changes)
9. [Configuration File Changes](#9-configuration-file-changes)
10. [Language / Translation Changes](#10-language--translation-changes)
11. [Frontend Build Configuration](#11-frontend-build-configuration)

---

## 1. Search — ReactiveSearch → vue-instantsearch + Searchkit

The biggest breaking change in v4. The ReactiveSearch library (`@appbaseio/reactivesearch-vue`) has been replaced with [vue-instantsearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/vue/) backed by `@searchkit/instantsearch-client`.

### package.json

Remove `@appbaseio/reactivesearch-vue`. Add the new packages:

```json
{
    "dependencies": {
        "vue-instantsearch": "^4.19.13",
        "@searchkit/instantsearch-client": "^4.14.1",
        "instantsearch.js": "^4.75.7",
        "@vueuse/components": "^10.1.0"
    }
}
```

### New `resources/js/instantsearch.js` file

A new file `resources/js/instantsearch.js` is automatically imported by `package.js`. It globally registers all `ais-*` components. You do not need to create it yourself; it is provided by the core. If you were registering these components manually, you can remove those registrations.

The components registered include: `ais-instant-search`, `ais-hits`, `ais-infinite-hits`, `ais-configure`, `ais-autocomplete`, `ais-search-box`, `ais-state-results`, `ais-highlight`, `ais-index`, `ais-refinement-list`, `ais-hierarchical-menu`, `ais-range-input`, `ais-current-refinements`, `ais-clear-refinements`, `ais-hits-per-page`, `ais-sort-by`, `ais-pagination`, `ais-stats`, `ais-stats-analytics`.

### New `config/rapidez/searchkit.php` config file

A new required config file is published by the package. It controls all Searchkit search settings. Publish or create it:

```php
// config/rapidez/searchkit.php
return [
    'highlight_attributes' => ['name', 'query_text'],
    'search_attributes' => [
        // ['field' => 'attribute_code', 'weight' => 4.0],
    ],
    'result_attributes' => [
        'entity_id', 'name', 'sku', 'price', 'special_price', 'image',
        'images', 'url', 'thumbnail', 'in_stock', 'children', 'super_*',
        'reviews_count', 'reviews_score', 'parents',
    ],
    'range_attributes' => [
        // 'attribute_code'
    ],
    'facet_attributes' => [
        // ['attribute' => 'brand', 'field' => 'brand.keyword', 'type' => 'string'],
    ],
    'filter_attributes' => [
        ['attribute' => 'entity_id',   'field' => 'entity_id',       'type' => 'numeric'],
        ['attribute' => 'sku',         'field' => 'sku.keyword',      'type' => 'string'],
        ['attribute' => 'category_ids','field' => 'category_ids',     'type' => 'numeric'],
        ['attribute' => 'visibility',  'field' => 'visibility',       'type' => 'numeric'],
    ],
    'sorting' => [
        'created_at' => ['desc'],
    ],
];
```

### Blade view changes — listing

The `<x-rapidez::reactive-base>` component and file `resources/views/components/reactive-base.blade.php` have been **deleted**. Remove any usage from custom views.

The `<x-rapidez::listing>` component now wraps an `<ais-instant-search>` block instead of a `<reactive-base>`. If you were using the `query` prop to inject a custom DSL query, that prop no longer exists. Use `<ais-configure>` instead.

Before (v3):
```blade
<x-rapidez::listing :query="json_encode(['term' => ['category_ids' => $category->entity_id]])">
    {{-- custom slot content --}}
</x-rapidez::listing>
```

After (v4):
```blade
<x-rapidez::listing>
    <x-slot:before>
        <ais-configure :filters="'category_ids:{{ $category->entity_id }}'"/>
    </x-slot:before>
</x-rapidez::listing>
```

The `<x-rapidez::productlist>` component has been completely rewritten. The props `dslQuery` and `limit` are removed. The `value` prop now filters by `sku` (or another field via `field`). `field` defaults to `sku` (not `sku.keyword`).

Before (v3):
```blade
<x-rapidez::productlist :value="['MS04', 'MS05']" field="sku.keyword" />
<x-rapidez::productlist :dslQuery="json_encode(['term' => ['sku.keyword' => 'MS04']])" />
```

After (v4):
```blade
<x-rapidez::productlist :value="['MS04', 'MS05']" />
<x-rapidez::productlist :value="false" filter-query-string="sku:MS04" />
<x-rapidez::productlist :value="false" v-bind:base-filters="() => [{dslQuery}]" />
```

### Remaining ReactiveSearch references

If you have any custom blade partials or Vue components that use ReactiveSearch components (`<reactive-list>`, `<multi-list>`, `<reactive-component>`, `<data-search>`, `<multi-range>`, etc.), replace them with the equivalent `<ais-*>` components from vue-instantsearch.

The filter partials in `resources/views/listing/partials/filter/` have all been rewritten to use `<ais-refinement-list>`, `<ais-range-input>`, `<ais-hierarchical-menu>`, etc. Refer to the updated core views for reference.

The `filters` Vue data property available in the listing slot scope is replaced by `config.filterable_attributes`.

### Migrate to Laravel Scout

Rapidez moved from a custom indexing solution to Laravel Scout. 
See: https://laravel.com/docs/13.x/scout#main-content

Models that are indexed should use `\Laravel\Scout\Searchable` and have their `toSearchableArray`, `searchableAs`, and `makeAllSearchableUsing` functions set accordingly.
Custom models which must be searchable must exist in `config/rapidez/models.php` and extend \Rapidez\Core\Models\Model

If this is all correct, no custom commands will be necessary anymore, as the `rapidez:index` command will automatically discover them.

---

## 2. Blade Components — Renames, Removals & New Files

### Removed blade components

| Removed | Notes |
|---|---|
| `resources/views/components/reactive-base.blade.php` | Was a `<reactive-base>` wrapper; no replacement needed |

### New blade components

| New file | Description |
|---|---|
| `resources/views/components/slider.blade.php` | Reusable product slider (used by `productlist`) |
| `resources/views/components/summary.blade.php` | `<dl>`-based summary layout component |
| `resources/views/components/accordion/filter.blade.php` | Accordion used in listing filter sidebar |
| `resources/views/components/input/range-slider.blade.php` | Range slider input used in price filters |
| `resources/views/layouts/config.blade.php` | Used by the new preloaded config route |

### Listing item template

`resources/views/listing/partials/item.blade.php` has been rewritten. The outer `<template slot="renderItem" slot-scope="{ item, count }">` wrapper is gone; items are now rendered inside an `<ais-hits>` `v-slot`:

```blade
{{-- v3 — item was self-wrapping template --}}
<template slot="renderItem" slot-scope="{ item, count }">
    ...
</template>

{{-- v4 — ais-hits provides the loop context --}}
<ais-hits v-slot="{ items, sendEvent }">
    <template v-for="(item, count) in items">
        @include('rapidez::listing.partials.item')
    </template>
</ais-hits>
```

The `<x-rapidez::listing>` slot syntax changed from `$slot->isEmpty()` checks to `@slotdefault`:

```blade
{{-- v3 --}}
@if ($slot->isEmpty())
    @include('rapidez::listing.filters')
@else
    {{ $slot }}
@endif

{{-- v4 --}}
@slotdefault('slot')
    @include('rapidez::listing.filters')
@endslotdefault
```

### Cart coupon heading

`resources/views/cart/coupon.blade.php` changed from `<h3>` to `<strong>`. If you have overridden this file, update it.

### Autocomplete views

The autocomplete template structure has changed significantly to support vue-instantsearch. The relevant views are in `resources/views/layouts/partials/header/autocomplete/`. New sub-views `history.blade.php` and `search-suggestions.blade.php` have been added.

### layouts/app.blade.php

The `window.config` inline script has moved from before `@stack('head')` to after `@stack('foot')`, and is now merged instead of overwritten:

```blade
{{-- v3 (was before @stack('head')) --}}
<script>window.config = @json(config('frontend'));</script>

{{-- v4 (is after @stack('foot')) --}}
<script>window.config = { ...window.config ?? {}, ...@json(config('frontend')) }</script>
```

Additionally, the config is now preloaded as a separate cacheable script:

```blade
@php($configPath = route('config') . '?v=' . Cache::rememberForever('cachekey', fn () => md5(Str::random())) . '&s=' . config('rapidez.store'))
<link href="{{ $configPath }}" rel="preload" as="script">
<script defer src="{{ $configPath }}"></script>
```

A `<meta name="view-transition" content="same-origin" />` tag has been added to the `<head>`.

---

## 3. Checkout Step File Renames

All checkout step blade files using underscores have been renamed to use dashes. If you have published or extended these views, rename them accordingly:

| Old (v3) | New (v4) |
|---|---|
| `checkout/steps/billing_address.blade.php` | `checkout/steps/billing-address.blade.php` |
| `checkout/steps/payment_method.blade.php` | `checkout/steps/payment-method.blade.php` |
| `checkout/steps/place_order.blade.php` | `checkout/steps/place-order.blade.php` |
| `checkout/steps/shipping_address.blade.php` | `checkout/steps/shipping-address.blade.php` |
| `checkout/steps/shipping_method.blade.php` | `checkout/steps/shipping-method.blade.php` |

Similarly, several product and cart partial files have been renamed from underscores to dashes:

| Old (v3) | New (v4) |
|---|---|
| `product/partials/options/drop_down.blade.php` | `product/partials/options/drop-down.blade.php` |
| `product/partials/super_attributes.blade.php` | `product/partials/super-attributes.blade.php` |
| `listing/partials/item/super_attributes.blade.php` | `listing/partials/item/super-attributes.blade.php` |
| `cart/queries/partials/customizable_options.graphql` | `cart/queries/partials/customizable-options.graphql` |

### Checkout login step changes

`checkout/steps/login.blade.php` now passes two new props to `<checkout-login>`:

```blade
<checkout-login
    v-slot="checkoutLogin"
    v-bind:allow-passwordless="Boolean({{ (int)(config('rapidez.frontend.allow_guest_on_existing_account')) }})"
    v-bind:allow-guest="Boolean({{ (int)(Rapidez::config('checkout/options/guest_checkout')) }})"
>
```

The `required` attribute on the password field is now dynamic based on `checkoutLogin.allowPasswordless`.

---

## 4. Vue Component & Directive Changes

### New global directive

`v-intersection-observer` is now globally registered (powered by `@vueuse/components`). It wraps `vIntersectionObserver` from VueUse.

### New globally registered components

| Component name | Source file |
|---|---|
| `<recursion>` | `resources/js/components/Recursion.vue` |
| `<vue-turbo-frame>` | `resources/js/components/VueTurboFrame.vue` |
| `<search-suggestions>` | `resources/js/components/Listing/SearchSuggestions.vue` |
| `<range-slider>` | `resources/js/components/Elements/RangeSlider.vue` |
| `<recently-viewed>` | `resources/js/components/RecentlyViewed.vue` |

### Removed globally registered components

| Removed | Notes |
|---|---|
| `<selected-filters-values>` | Replaced by `<ais-current-refinements>` or `<range-slider>` |

### `<autocomplete>` is now lazy-loaded

The `autocomplete` component is loaded asynchronously triggered by a `loadAutoComplete` DOM event. A loading skeleton slot is available before the component loads. On iOS devices it is pre-loaded ~600ms after pageload automatically. To trigger loading manually:

```js
window.document.dispatchEvent(new window.Event('loadAutoComplete'))
```

To disable the iOS double-click workaround (enabled by default):

```
VITE_DISABLE_DOUBLE_CLICK_FIX=true
```

### Turbo elements ignored

`Vue.config.ignoredElements = [/^turbo-.+/]` has been added so Vue does not warn about unknown `<turbo-*>` elements.

---

## 5. JavaScript Store Changes

### Removed stores

| Removed file | Notes |
|---|---|
| `resources/js/stores/useSwatches.js` | Swatches are no longer cached in localStorage; swatch data comes inline |
| `resources/js/stores/useAttributes.js` | Attributes are no longer cached in a separate store |

If you were importing `swatches` or `clearSwatches` from `useSwatches`, or `attributes` / `clear` from `useAttributes`, remove those imports and usages.

### New store: `useInstantsearchMiddlewares`

```js
import { addInstantsearchMiddleware, removeInstantsearchMiddleware } from './stores/useInstantsearchMiddlewares'
```

Use these functions to register Algolia InstantSearch middleware globally. This is useful for analytics integrations.

### `useFetches` — new `allSettled` helper

```js
import { allSettled } from './stores/useFetches'

// Wait until all active fetches are complete:
await allSettled()
// With options (e.g. timeout):
await allSettled({ timeout: 5000 })
```

### `useUser` — storage change and new exports

- `user` is now stored in **localStorage** (was `sessionStorage`). Logged-in state persists across browser tabs.
- `useSessionStorage` import has been removed from `useUser.js`.
- `loggedIn` is now a named export; call it to emit `logged-in` and handle cart linking after external token authentication.
- `login()` now passes `{ notifyOnError: false }` so that login failures are handled by the caller.

---

## 6. Vue Root Data Changes

### Removed data properties

| Removed | Notes |
|---|---|
| `swatches` | Removed from root data; no longer uses `useSwatches` store |
| `loadAutocomplete` | Replaced with `autocompleteFacadeQuery` (string) |
| `queryParams` computed | Removed; use `new URLSearchParams(window.location.search)` directly |

### New method: `categoryPositions(categoryId)`

Returns a function_score DSL query fragment for scoring products by their category display position. Used internally by the listing component.

### New method: `resizedPath(imagePath, size, store, sku)`

A new `sku` boolean parameter has been added. When `true`, the URL is resolved from the `/sku/` storage path instead of the Magento media path:

```js
// v4
resizedPath(imageSku, 200, null, true)
// → /storage/{store}/resizes/200/sku/{imageSku}.webp
```

### init() is now async with config wait

The `init()` function now waits up to 1 second (in 50ms increments) for `window.config.store` to be available before mounting Vue. This is needed for the preloaded config script.

---

## 7. Callbacks & Utilities Changes

### `scrollToElement(el, offset = 0)`

The `offset` parameter has been restored. Use it to account for fixed headers:

```js
// v3 — no offset support
scrollToElement('#products')

// v4 — offset is optional, defaults to 0
scrollToElement('#products', 60)
```

---

## 8. Authentication Changes

### Guest checkout with existing account

A new `allow_guest_on_existing_account` option in `config/rapidez/frontend.php` (defaults to `false`) controls whether an email address that already has an account can proceed as a guest:

```php
// config/rapidez/frontend.php
'allow_guest_on_existing_account' => false,
```

When `false`, the user is required to log in if their email is associated with an existing account.

### `currencySymbol` and `currencySymbolLocation` restored

These two computed properties have been restored to the global mixin. They were removed in an earlier intermediate release:

```js
// Available globally in all Vue components
this.currencySymbol         // e.g. '$'
this.currencySymbolLocation // e.g. 'before'
```

---

## 9. Configuration File Changes

### `config/rapidez/frontend.php`

| Change | Details |
|---|---|
| `es_prefix` removed from `exposed` array | The `es_prefix` key is no longer exposed to the frontend config |
| `checkout_steps` format changed | Was a nested per-store array; is now a flat array |
| `allow_guest_on_existing_account` added | New boolean option (defaults to `false`) |
| `autocomplete.additionals` changed | `categories` entry no longer has a `fields` key; `history` and `search-suggestions` entries added |
| `autocomplete.debounce` removed | |
| `themes` renamed to `theme` | Changed from an array to a single path string |

```php
// v3
'checkout_steps' => [
    'default' => ['login', 'credentials', 'payment'],
],
'themes' => [
    'default' => resource_path('themes/default'),
],
'autocomplete' => [
    'additionals' => [
        'categories' => ['name^3', 'description'],
    ],
    'debounce' => 500,
    'size' => 3,
],

// v4
'checkout_steps' => ['login', 'credentials', 'payment'],
'theme' => resource_path('themes/default'),
'autocomplete' => [
    'additionals' => [
        'history'            => [],
        'search-suggestions' => [],
        'categories'         => [],
    ],
    'size' => 3,
],
'allow_guest_on_existing_account' => false,
```

### `config/rapidez/system.php`

The `es_prefix` setting (and its `ELASTICSEARCH_PREFIX` env variable) has been **removed**. The Elasticsearch index prefix is now handled by Searchkit automatically. Remove `ELASTICSEARCH_PREFIX` from your `.env` if set.

### `config/rapidez/indexer.php` — DELETED

This config file has been deleted. The indexer settings it contained are now managed elsewhere. If you had customised this file, refer to the new Searchkit config for `search_attributes` and `facet_attributes` equivalents.

### `config/rapidez/testing.php` — DELETED

The Dusk testing config has been removed. The `TEST_PRODUCT` env variable and its config key are no longer used by the core.

### `config/rapidez/models.php`

A new `product_video_value` model has been added:

```php
'product_video_value' => Rapidez\Core\Models\ProductVideoValue::class,
```

### `config/rapidez/magento-defaults.php`

New defaults added:

```php
'catalog/recently_products/viewed_count' => '5',
'checkout/options/guest_checkout'        => '1',
```

---

## 10. Language / Translation Changes

### `lang/en/frontend.php` and `lang/nl/frontend.php`

The `sorting` structure has changed. The old `price` sorting keys have been replaced by `created_at` and `name`, and the top-level `newest` key has been removed:

```php
// v3
'newest' => 'Newest',
'sorting' => [
    'price' => [
        'asc'  => 'Price asc',
        'desc' => 'Price desc',
    ],
],

// v4
'sorting' => [
    'created_at' => [
        'asc'  => 'Oldest',
        'desc' => 'Newest',
    ],
    'name' => [
        'asc'  => 'Name A-Z',
        'desc' => 'Name Z-A',
    ],
],
```

The `asc`/`desc` top-level labels have been updated to `'ascending'`/`'descending'` (English) and `'oplopend'`/`'aflopend'` (Dutch). A new top-level `price` key has been added for Dutch: `'price' => 'Prijs'`.

If you have sorting configured in `config/rapidez/searchkit.php`, add the corresponding translations:

```php
// config/rapidez/searchkit.php
'sorting' => [
    'created_at' => ['desc'],
    'name'       => ['asc', 'desc'],
],
```

### `lang/nl.json`

Many new translation strings have been added for InstantSearch UI elements. The most notable additions are:

```json
"Search within the results": "Zoeken binnen resultaten",
"Selected filters": "Geselecteerde filters",
"First Page": "Eerste pagina",
"Previous Page": "Vorige pagina",
"Page": "Pagina",
"Next Page": "Volgende pagina",
"Last Page": "Laatste pagina",
"Clear the search query": "De zoekopdracht wissen",
"Sort options": "Sorteer opties",
"Searching...": "Zoeken...",
"Previous Searches": "Vorige zoekopdrachten",
"Popular products": "Populaire producten",
"No products found.": "Geen producten gevonden.",
"There are currently no products in this category.": "Er zijn momenteel geen producten in deze categorie.",
"Here are some suggestions:": "Hier zijn enkele suggesties:",
"Suggestions": "Suggesties"
```

Add the English equivalents to any `lang/en/` files used by your project.

---

## 11. Frontend Build Configuration

### `tailwind.config.js`

Several changes are needed in `tailwind.config.js`:

**1. `conversion.DEFAULT` colour change** — the default conversion colour has changed from `green[500]` to `green[700]`:

```js
// v3
conversion: { DEFAULT: color('--conversion', colors.green[500]) },

// v4
conversion: { DEFAULT: color('--conversion', colors.green[700]) },
```

**2. New Tailwind tokens** — add `border.active` and `background.active` design tokens:

```js
borderColor: {
    // ...existing tokens...
    active: color('--border-active', colors.slate[800]),
},
backgroundColor: {
    // ...existing tokens...
    active: color('--background-active', colors.slate[800]),
},
```

**3. `animate-loading` restored** — `keyframes.loading` and `animation.loading` have been added back:

```js
keyframes: {
    loading: {
        '0%':   { opacity: '0.2' },
        '20%':  { opacity: '1' },
        '100%': { opacity: '0.2' },
    },
},
animation: {
    loading: 'loading 1.4s ease infinite',
},
```

**4. `textColor` / `backgroundColor` spread form** — if you are on a Tailwind config that defines these as a single value, revert to the spread form:

```js
textColor: ({ theme }) => ({
    default: theme('colors.foreground'),
    ...theme('colors.foreground'),
}),
backgroundColor: ({ theme }) => ({
    default: theme('colors.background'),
    ...theme('colors.background'),
}),
```

### `vite.config.js`

If present, remove the `build.commonjsOptions.requireReturnsDefault: 'preferred'` block. It was only needed for `vue-slider-component` compatibility with the previous ReactiveSearch build and is no longer required.

### `resources/css/app.css`

Remove the following CSS component imports that are no longer needed (styles are now handled inline or scoped within components):

```css
/* Remove these lines: */
@import 'components/vue-slider';
@import 'components/price-slider';
@import 'components/pagination';
@import 'components/autocomplete';
```

Add the following new styles for view transitions, mark highlighting, and the Turbo progress bar:

```css
@view-transition {
    navigation: auto;
}

mark {
    @apply bg-transparent font-bold;
}

input[type='search']::-webkit-search-decoration,
input[type='search']::-webkit-search-cancel-button {
    -webkit-appearance: none;
}

.custom-select {
    background-position: right center;
    field-sizing: content;
}

@supports (interpolate-size: allow-keywords) {
    :root {
        interpolate-size: allow-keywords;
    }
}

.turbo-progress-bar {
    @apply bg-primary;
}
```
````
