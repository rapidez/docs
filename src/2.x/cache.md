# Cache

---

Rapidez caches a lot to speed things up. This means that after you've changed some Magento configuration you've to clear the cache. This can be done by easily running the command from the terminal `php artisan cache:clear` but you can automate this just like the [indexer](indexer.md#webhook) with `/api/admin/cache/clear?token=` and also append your token.

::: tip
Change the `CACHE_DRIVER` in the `.env` to `null` to disable the cache while developing.
:::

## Query caching

In order to reduce some often made query calls (like those for configuration) and speed these up we've added the ability to call `->getCachedForever()` on queries.
