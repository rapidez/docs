# Indexer

---

The indexer adds the product information to an Elasticsearch index for InstantSearch. There are multiple ways to refresh the index:

[[toc]]

## Manually

Run `php artisan rapidez:index` from the terminal.

## Scheduler

If you'd like to run the indexer frequently, you can schedule the `rapidez:index` command in `routes/console.php`. For more information, see [Task Scheduling](https://laravel.com/docs/11.x/scheduling).

```php
Schedule::command('rapidez:index')->hourly();
```

## Webhook

Another option is to visit `/api/admin/index/products?token=` and append your `RAPIDEZ_TOKEN` from the `.env` file. You can automate this however you want by calling the URL. This can be useful when you want to trigger the indexer from an external system. Rapidez is using [`fastcgi_finish_request()`](https://www.php.net/fastcgi_finish_request) so you get a response really fast and the index process continues.

## Instant updates

Because you may want to have (near) instant updates to your Elasticsearch index we have the following options.

### Triggering a webhook with updated products (recommended)
(e.g. https://github.com/mageplaza/magento-2-webhook)

There are 2 webhooks to update the indexes
```
POST       api/admin/index/{model}
DELETE     api/admin/index/{model}
```

They require the `RAPIDEZ_TOKEN` to run.
`{model}` is the model name in https://github.com/rapidez/core/blob/master/config/rapidez/models.php

both accept the same parameters:
```json
{
    "ids": [1, 2, 3, 4],
    // "stores": [1,2,3], // List of stores to update the indexes on
    // "stores": "*", // Update the indexes on all stores
    // Stores is optional, if left empty only the current store is updated.
}
```

POST will create/update the specified id(s) on the index.

DELETE will remove the specified id(s) from the index.

### Scheduling index updates

```php
Schedule::command('rapidez:index')->hourly();
Schedule::command('rapidez:index:update')->everyMinute()->withoutOverlapping();
```

This will do a full reindex every hour, and check if it needs to update the index every minute
::: warning
the `rapidez:index:update` **will not** remove documents from the index, only `rapidez:index` will
:::
