# Indexer

---

The indexer adds the product information to an Elasticsearch index for Reactive Search. There are multiple ways to refresh the index:

[[toc]]

## Manually

Run `php artisan rapidez:index` from the terminal.

## Scheduler

If you'd like to run the indexer frequently you can schedule the `rapidez:index` command in `routes/console.php`, for more information see [Task Scheduling](https://laravel.com/docs/11.x/scheduling)

```php
Schedule::command('rapidez:index')->hourly();
```

## Webhook

Another option is to visit `/api/admin/index/products?token=` and append your `RAPIDEZ_TOKEN` from the `.env`. You can automate this however you want by calling the url. This can be useful when you want to trigger the indexer from an external system. Rapidez is using [`fastcgi_finish_request()`](https://www.php.net/fastcgi_finish_request) so you get a response really fast and the index process continues.
