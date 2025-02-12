# Cache

---

Rapidez caches certain things to improve speed. It also provides some options to improve the speed even more! 🚀

[[toc]]

## Invalidation

After you have made changes to some Magento configuration, you need to clear the cache. This can be easily done by running the command `php artisan cache:clear` from the terminal. However, you can also automate this process just like with the [indexer](indexer.md#webhook) by using the cache clear URL `/api/admin/cache/clear?token=` and appending your token.

::: tip
To disable the cache while developing, change the `CACHE_DRIVER` in the `.env` file to `null`.
:::

## Partial caching

When you have a template consuming too much time or resources and it doesn't have to do that every time, you could use [`@includeCached()`](https://github.com/rapidez/blade-directives#includecached) to cache the partial.

## Full page caching

Rapidez performs well out-of-the-box, but if you'd like to reduce the first load even more, you could add full page caching.

If you're using the [Statamic integration](packages/statamic.md), we recommend using their [static caching](packages/statamic.md#static-caching) as it supports [multiple caching strategies](https://statamic.dev/static-caching#caching-strategies), and invalidation comes with the package.

Alternatively, you could implement one of these packages with different strategies:

- [spatie/laravel-responsecache](https://github.com/spatie/laravel-responsecache)
- [JosephSilber/page-cache](https://github.com/JosephSilber/page-cache)
- [spatie/laravel-varnish](https://github.com/spatie/laravel-varnish)

### Cloudflare

Using Cloudflare's CDN edge you can speed page caching up even more by bringing the files closer to your customer. (we've seen response times of ~30ms)
By default Cloudflare will not cache any pages, but you can ask it to. By [creating a cache rule in Cloudflare](https://developers.cloudflare.com/cache/how-to/cache-rules/create-dashboard/) you can ask Cloudflare to start caching pages.
We suggest the following settings:
- [Cache eligibility](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/#cache-eligibility)
  - [Eligible for cache](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/#eligible-for-cache-settings)
- [Edge TTL](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/#edge-ttl)
  -  `Use cache-control header if present, bypass cache if not`. This ensures Cloudflare will not cache pages that don't explicitly state they can be cached.
- [Browser TTL](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/#browser-ttl)
  - `Respect origin TTL`

You do not need to change any other settings.

Cloudflare will now listen to the cache-control headers sent by your server.
By default Laravel and Rapidez will make each page response private, so no caching will be done. 
If you're sure your pages contain no private data (which is the case by default in Rapidez) you can add the [Cache Control Middleware](https://laravel.com/docs/master/responses#cache-control-middleware).
Alternatively [spatie/laravel-varnish](https://github.com/spatie/laravel-varnish) and [Statamic](packages/statamic.md) does this for you (note: you may need to [add some config](packages/statamic.md#cloudflare)).
