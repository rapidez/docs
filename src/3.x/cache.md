# Cache

Rapidez caches certain things to improve speed. This means that after you have made changes to some Magento configuration, you need to clear the cache. This can be easily done by running the command `php artisan cache:clear` from the terminal. However, you can also automate this process by using the [indexer](indexer.md#webhook) with `/api/admin/cache/clear?token=` and appending your token.

::: tip
To disable the cache while developing, change the `CACHE_DRIVER` in the `.env` file to `null`.
:::