# Indexer

---

The indexer adds the product and category information with [Laravel Scout](https://laravel.com/docs/12.x/scout) to an Elasticsearch index for InstantSearch. There are multiple ways to refresh the index:

[[toc]]

## Manually

To do a full (re)index run this command from your terminal: 

```bash
php artisan rapidez:index
```

This will reindex everything for all stores. With the `--store` and `--types` options you can be more specific, see: `php artisan rapidez:index --help`. Alternatively there is also: 

```bash
php artisan rapidez:index:update
```

This will only update changed items since the last index based on the "updated at" column set on the model. This command will not remove anything from the index!

## Scheduler

Instead of manually triggering the index you can simply schedule these commands within the console routes file: `routes/console.php`. For more information, see [Task Scheduling](https://laravel.com/docs/12.x/scheduling)

```php
Schedule::command('rapidez:index')->hourly();
Schedule::command('rapidez:index:update')->everyMinute()->withoutOverlapping();
```

## Webhook

### Partial index

If you'd like to have even faster updates we provide an endpoint to trigger updates: 

```
/api/admin/index/MODEL?token=RAPIDEZ_TOKEN
```

Replace `MODEL` with the name from the [models config](https://github.com/rapidez/core/blob/master/config/rapidez/models.php), most likely `product`, `category` or maybe a custom model you've created like `blog`. The `RAPIDEZ_TOKEN` comes from your `.env`. If you do a `POST` request it will add / update an item and a `DELETE` request will remove an item from the index. The accepted parameters:

| Param    | Required | Data  |
| -------- | -------- | ----- |
| `ids`    | Yes      | Array of items ID's; `[1, 2, 3]` |
| `stores` | No       | - Default is the current store<br>- For all stores use `*`<br>- Specific stores: `['store_code1', 'store_code2']` |

::: tip Magento Webhooks
Magento doesn't provide any webhooks by default, but you could use something like [mageplaza/magento-2-webhook](https://github.com/mageplaza/magento-2-webhook) and configure it to reindex on product and category updates.
:::

### Full reindex

Additionally there is an endpoint that triggers a full reindex with just a `GET` request:

```
/api/admin/index/products?token=RAPIDEZ_TOKEN
```

This uses [`fastcgi_finish_request()`](https://www.php.net/fastcgi_finish_request), which means you get a response immediately while the index process continues in the background.

## Adding models

The Rapidez indexer listens to the [Searchable trait](https://github.com/rapidez/core/blob/master/src/Models/Traits/Searchable.php), so if you want your own models indexed you can simply implement the trait and add it to the [models config](extending.md#models). By default this will index everything arrayable in an index following:
```
SCOUT_PREFIX _ plural model name _ STORE_ID
```

::: tip Scout Docs
For more advanced usage take a look at the [Scout Docs](https://laravel.com/docs/12.x/scout)
:::
