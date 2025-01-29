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
