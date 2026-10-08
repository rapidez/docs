---
description: Render listings like categories and productlists server side by serving snapshots captured with a headless browser.
---

# SSR

---

Listings in Rapidez, like the category pages and productlists, are rendered in the browser by Vue with the results from Elasticsearch / OpenSearch. Real server side rendering with Vue isn't possible as the templates are Blade components, not Vue files. To still show the listing directly on page load, Rapidez can serve a snapshot of the listing HTML which is replaced by the real listing as soon as Vue is ready. This prevents the page from jumping around while the listing loads and crawlers get the products and links directly within the HTML.

[[toc]]

## How it works

1. The first visit of a page with a listing renders the listing client side, as usual, and queues a job
2. The job opens the same page with a headless Chrome browser using [spatie/browsershot](https://github.com/spatie/browsershot) and [Puppeteer](https://pptr.dev/), waits until the listing is loaded and saves the listing HTML in the cache
3. The next visit renders the HTML from the cache directly in the response
4. Once Vue is ready and the listing has loaded its results, the snapshot is replaced by the real listing

Before the HTML is saved some changes are made, so the snapshot works without Vue:

- Forms are replaced with a `div` and add to cart buttons with a link to the product page
- Scripts are removed, as they would run again and are already in the real listing
- The `id`, `for`, `name` and `data-testid` attributes are removed, so IDs and radio groups stay unique while the real listing is rendered next to it
- The current state of inputs and selects is saved as attributes, so for example the selected sorting is visible

::: warning Selectors
As the `id`, `for`, `name` and `data-testid` attributes are removed, CSS or JavaScript using those as selector won't match within the snapshot. For example styling that hides the products after the 4th with `[data-testid=listing-item]:nth-child(n+5)` shows all products in the snapshot and collapses them once the real listing is rendered. Use another attribute or class instead, like `[data-item-id]` on the product tile.
:::

::: tip
The snapshot is captured with a desktop window size (1440x900), but as it's the same HTML with the same classes, your responsive styling still applies.
:::

## Installation

SSR is disabled by default and requires [spatie/browsershot](https://github.com/spatie/browsershot) with Puppeteer:

```bash
composer require spatie/browsershot
```

```bash
npm install puppeteer
```

::: tip pnpm
Since pnpm 10 dependencies aren't allowed to run their install scripts by default, so Puppeteer can't download Chrome. Allow it with `pnpm approve-builds` (`allowBuilds` in your `pnpm-workspace.yaml`), install Chrome yourself with `npx puppeteer browsers install chrome` or use an existing Chrome with `BROWSERSHOT_CHROME_PATH`.
:::

Make sure the server is able to run Chrome, see the [Browsershot requirements](https://spatie.be/docs/browsershot/v5/requirements). After that you can enable it in your `.env`:

```dotenv
RAPIDEZ_SSR=true
```

::: warning Server
Puppeteer has to be installed on the server where the queue worker runs, not only where the frontend is built. So keep this in mind when you're building the frontend somewhere else or installing with `--omit=dev`. Puppeteer downloads Chrome into the cache directory of the user running the install (`~/.cache/puppeteer`). When the queue worker runs as another user, specify the path with `BROWSERSHOT_CHROME_PATH`, see [Browsershot](#browsershot).
:::

::: warning Queue
Snapshots are generated with a queued job. Without a queue worker (`QUEUE_CONNECTION=sync`) the job runs after the response is sent, which still works but keeps that PHP process busy while Chrome is rendering the page. We recommend running a [queue worker](https://laravel.com/docs/master/queues#running-the-queue-worker), optionally with a dedicated queue using `RAPIDEZ_SSR_QUEUE`.
:::

## Configuration

All options can be found in `config/rapidez/ssr.php`:

| Option | `.env` | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `RAPIDEZ_SSR` | `false` | Enable the SSR snapshots |
| `productlists` | `RAPIDEZ_SSR_PRODUCTLISTS` | `false` | Also use snapshots for [productlists](#productlist) by default |
| `ttl` | `RAPIDEZ_SSR_TTL` | `60` | Minutes a snapshot is considered fresh |
| `stale_ttl` | `RAPIDEZ_SSR_STALE_TTL` | `1440` | Minutes a snapshot is still served after the `ttl`, while a new one is generated |
| `filters` | `RAPIDEZ_SSR_FILTERS` | `false` | Also save snapshots for URLs with filters, sorting, pagination, etc. |
| `queue` | `RAPIDEZ_SSR_QUEUE` | `null` | Queue to generate the snapshots on, as it uses a headless browser you may want a dedicated worker for it |

### Lifetime

A snapshot is served as-is within the `ttl`. After that it's still served for the `stale_ttl` while a new snapshot is generated in the background, comparable to [stale-while-revalidate](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control#stale-while-revalidate). After both have passed, the listing is rendered client side again until a new snapshot is available.

All snapshots of a store are invalidated when the full index runs with `php artisan rapidez:index`. The `rapidez:index:update` command doesn't flush them as that runs every minute. Clearing the cache with `php artisan cache:clear` removes them as well.

::: tip
When the listing has no results, or the snapshot is too big (over 2MB), an empty snapshot is stored; so it's not trying to generate a snapshot on every page view. When the listing isn't on the page at all for the headless browser, for example because it depends on the visitor, nothing is stored and it's tried again later.
:::

::: tip Redis
A category snapshot can be around 100KB, or a few hundred KB with a lot of filter options. When you're using Redis as cache with a lot of snapshots, you can let [PhpRedis](https://github.com/phpredis/phpredis) compress them with the `compression` option of the Redis connection in `config/database.php`, for example `'compression' => Redis::COMPRESSION_LZ4`.
:::

### Filters

By default only listings without any listing parameters in the URL get a snapshot. With `RAPIDEZ_SSR_FILTERS=true` every combination of filters, sorting, pagination, etc. gets its own snapshot. Keep in mind this can result in a lot of snapshots and jobs! Query parameters that don't affect the listing, like `utm_source`, are ignored.

### Browsershot

When Node, NPM, the node modules or Chrome aren't found automatically, you can specify the paths:

```dotenv
BROWSERSHOT_NODE_BINARY=
BROWSERSHOT_NPM_BINARY=
BROWSERSHOT_NODE_MODULE_PATH=
BROWSERSHOT_CHROME_PATH=
```

The PHP process running the job, PHP-FPM with the `sync` queue or the queue worker, doesn't have the `PATH` of your shell. So when Node is installed with a version manager like nvm or fnm, specify the binaries and the node modules of your project:

```dotenv
BROWSERSHOT_NODE_BINARY=/home/forge/.nvm/versions/node/v24.11.0/bin/node
BROWSERSHOT_NPM_BINARY=/home/forge/.nvm/versions/node/v24.11.0/bin/npm
BROWSERSHOT_NODE_MODULE_PATH=/home/forge/example.com/node_modules
```

With fnm, `which node` points to a temporary path per shell session; use the path within `~/.local/share/fnm/node-versions` instead.

When running Chrome as root, for example within Docker, you may need to disable the sandbox with `BROWSERSHOT_NO_SANDBOX=true`.

## Usage

Out of the box the category listing uses SSR snapshots once it's enabled. Productlists are opt-in, see [productlist](#productlist).

### Listing

The `x-rapidez::listing` component accepts a `snapshot` attribute with a unique ID. The category page uses the category ID:

```blade
<x-rapidez::listing
    :root-path="$category->parentcategories->pluck('name')"
    snapshot="category-{{ $category->entity_id }}"
    v-bind:category-id="{{ $category->entity_id }}"
/>
```

When you use the listing component somewhere else, for example on a brand page, you can do the same:

```blade
<x-rapidez::listing
    snapshot="brand-{{ $brand->id }}"
    ...
/>
```

The listing template of [rapidez/statamic-query-builder](https://github.com/rapidez/statamic-query-builder) does this as well, the slider template uses the [productlist](#productlist).

### Productlist

Snapshots for the `x-rapidez::productlist` component are disabled by default. You can enable them for all productlists with `RAPIDEZ_SSR_PRODUCTLISTS=true`, or per productlist with the `snapshot` attribute:

```blade
<x-rapidez::productlist :value="['MS04', 'MS05']" :snapshot="true"/>
```

The ID is based on the definition, so the same productlist on different pages shares the snapshot. Unique values per request, like a generated UUID or `uniqid()`, are ignored. When the `value` is a Vue expression, the snapshot is also per page as the result probably depends on the page, like the related products.

When a productlist depends on the visitor you should disable the snapshot, which is already done for the cart crosssells and the recently viewed products:

```blade
<x-rapidez::productlist value="cart.items" :snapshot="false"/>
```

::: warning Amount of snapshots
Every snapshot is generated with a headless browser, which takes a few seconds. Keep in mind that productlists on the product page, like the related products and upsells, result in a snapshot per product. You may want to disable the snapshot for those, or use a dedicated queue with `RAPIDEZ_SSR_QUEUE` and enough workers.
:::

### Custom listing slot

When you override the default slot of the listing, the snapshot doesn't know what to capture. Mark the element with `snapshotAttributes()` and hide it until the listing is rendered:

```blade
<x-rapidez::listing snapshot="category-{{ $category->entity_id }}" ...>
    <div
        v-show="listingSlotProps.rendered"
        v-bind="listingSlotProps.snapshotAttributes()"
        class="flex gap-x-20 gap-y-5 max-lg:flex-col min-h-screen"
    >
        ...
    </div>
</x-rapidez::listing>
```

::: warning
Only the content of the marked element is captured. The listing component renders the snapshot within an element with the classes `flex gap-x-20 gap-y-5 max-lg:flex-col min-h-screen`, so use the same classes on your element. Otherwise the layout of the snapshot is different and the page jumps when it's replaced. When you need other classes, [override the listing component](#listing-component) and pass them to the `x-rapidez::listing-snapshot` component.
:::

## Overriding the components

When you've [overridden](/5.x/theming#views) the listing or productlist component, these need some changes to support SSR. Without them nothing happens, so it's safe to enable SSR first and update them later. Compare your override with the one from the core, see [updating vendor hashes](/5.x/theming#update-vendor-hashes).

### Listing component

When overriding `components/listing.blade.php`:

1. Accept the `snapshot` prop and get the snapshot parts:
    ```blade
    @props(['rootPath' => null, 'snapshot' => null])

    @php($snapshotParts = $snapshot ? app(\Rapidez\Core\Search\ListingSnapshotStore::class)->get($snapshot, routed: true) : [])
    ```
2. Pass the snapshot ID to the listing and whether there is a snapshot:
    ```blade
    <listing
        ...
        @if ($snapshot && config('rapidez.ssr.enabled')) snapshot-id="{{ $snapshot }}" @endif
        @if ($snapshotParts) v-bind:has-snapshot="true" @endif
    >
    ```
3. Mark the element to capture, see [custom listing slot](#custom-listing-slot)
4. Render the snapshot outside of the `<listing>` element, for example right before it. Within the `<listing>` element it's hidden with `v-cloak` until Vue is loaded, the same goes for the `before` and `after` slots:
    ```blade
    <x-rapidez::listing-snapshot class="flex gap-x-20 gap-y-5 max-lg:flex-col min-h-screen"/>
    ```

Within the listing component the ID of the `x-rapidez::listing-snapshot` component defaults to the `snapshot` of the listing, taking the filters, sorting, etc. in the URL into account. Outside of it you have to pass the ID yourself. As the category listing gets a snapshot per filter combination (see [filters](#filters)), also pass `routed`; otherwise the unfiltered snapshot is served on a filtered URL:

```blade
<x-rapidez::listing-snapshot id="category-{{ $category->entity_id }}" :routed="true"/>
```

#### Parts

It's also possible to capture multiple parts separately, for example when the filters and products are in different places or moved with a [teleport](https://vuejs.org/guide/built-ins/teleport). Pass a part name to `snapshotAttributes()`:

```blade
<teleport to="#products">
    <div v-show="listingSlotProps.rendered" v-bind="listingSlotProps.snapshotAttributes('products')">
        ...
    </div>
</teleport>
```

And render that part where it should appear, again outside of the `<listing>` element:

```blade
<div id="products">
    <x-rapidez::listing-snapshot part="products"/>
</div>
```

The snapshot is hidden as soon as the `listing:rendered` event is emitted with the snapshot ID.

::: tip Order in the HTML
The browser renders the HTML while it's coming in. When the parts are in another order in the HTML than on the screen, for example the products before the filters while the filters are on the left with `flex-row-reverse` or `order-*`, the products jump once the filters come in. Use a grid with fixed columns and rows instead, so the position of a part doesn't depend on the other parts:

```blade
<div class="grid grid-cols-1 gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <div id="products" class="row-start-2 lg:col-start-2 lg:row-start-1">
        <x-rapidez::listing-snapshot part="products"/>
    </div>
    <div id="filters" class="row-start-1 lg:col-start-1">
        <x-rapidez::listing-snapshot part="filters"/>
    </div>
</div>
```
:::

### Productlist component

When overriding `components/productlist.blade.php`, compare it with the one from the core. In short:

1. Accept the `snapshot` prop and generate the ID based on the definition with `ListingSnapshotStore::id()`, which ignores unique values per request. When you've added props that change the HTML, like a tile variant, add those to the ID as well. Otherwise productlists with the same products but different HTML share the snapshot:
    ```blade
    app(\Rapidez\Core\Search\ListingSnapshotStore::class)->id('productlist', $value, $field, ..., $productTileVariant)
    ```
2. Get the snapshot parts and pass `snapshot-id` and `has-snapshot` to the `<listing>`, like the [listing component](#listing-component)
3. Mark `<ais-hits>` with `v-show="listingSlotProps.rendered"` and `v-bind="listingSlotProps.snapshotAttributes()"`
4. Render the snapshot with `x-rapidez::listing-snapshot` and the `id` **after** the `<lazy>` component and wrap both in a `div`. Before it, the lazy component would move when the snapshot is replaced

## Limitations

- The snapshot is captured as a guest, so prices of customer groups, the wishlist state, etc. are the guest version until the real listing replaces it
- The first visitor, and the first one after the `ttl` and `stale_ttl` have passed, doesn't get a snapshot yet
- The snapshot isn't interactive until it's replaced; links work, add to cart buttons link to the product page, the rest does nothing
- When the same productlist is used twice on a page, both snapshots are hidden as soon as the first one has loaded
- The snapshot makes the listing visible much earlier, but it's part of the HTML Vue compiles as template when it starts. So big snapshots, like a listing with a lot of filter options, delay the moment Vue is ready on slow devices. Measure it with a throttled CPU
- When the real listing fails to load, for example because Elasticsearch / OpenSearch isn't reachable, the snapshot is replaced with the "no results" message, just like without a snapshot

## Testing

The snapshot is wrapped in an element with `data-testid="listing-ssr"` and the `data-testid` attributes within the snapshot are removed. So existing tests on, for example, `[data-testid="listing-item"]` keep working as those will wait for the real listing.

## Troubleshooting

Errors while generating a snapshot are reported, so check your logs first. Some things to check:

- **No snapshots are generated:** make sure the queue worker is running and Chrome can be started. Try generating a PDF or screenshot with [Browsershot](https://spatie.be/docs/browsershot/v5/introduction) from Tinker
- **The snapshot belongs to another store:** the job opens the page with the `web/secure/base_url` from the Magento configuration of the store, falling back to the `APP_URL`. Make sure this is the URL of the store and resolves to the right store from the server itself. When it doesn't, generating snapshots is paused for that store for the `ttl`, so you're not ending up with snapshots on the wrong store
- **Listing not found:** when the page returns an error status, for example a 404, a warning is logged with the URL
- **Basic auth or IP whitelist:** the headless browser opens the page from the server itself, so make sure the server is able to reach the URL; for example on a staging environment behind basic auth or an IP whitelist
- **Analytics or firewall:** the headless browser uses a user agent containing `RapidezSsr`, you may want to exclude this from your analytics or allow it in your firewall. Snapshots are never served to this user agent
