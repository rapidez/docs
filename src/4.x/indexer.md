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

## Extending

### Adding models

The Rapidez indexer listens to the [Searchable trait](https://github.com/rapidez/core/blob/master/src/Models/Traits/Searchable.php), so if you want your own models indexed you can simply implement the trait and add it to the [models config](extending.md#models). By default this will index everything arrayable in an index following:
```
SCOUT_PREFIX _ plural model name _ STORE_ID
```

Make sure any custom eloquent models extend Rapidez's [base model](https://github.com/rapidez/core/blob/master/src/Models/Model.php).

::: tip Scout Docs
For more advanced usage take a look at the [Scout Docs](https://laravel.com/docs/12.x/scout)
:::

### Mapping & settings

You can define custom index mapping and settings for each searchable model. You can do this in a few different ways:

#### Model

On the searchable model itself, you can define the following functions:

```php
protected static function indexMapping(): array
{
    // return [
    //     'properties' => [
    //         'children' => [
    //             'type' => 'flattened',
    //         ],
    //     ],
    // ];
}

protected static function indexSettings(): array
{
    // return your settings here
}
```
#### Eventy

See the [package development docs](package-development.md#eventy-filters) for more information on Eventy.

##### Array

You can also hook into the Eventy filters to directly alter the mapping before it gets sent to ElasticSearch. This is useful for when you want to alter your mapping or settings within a serviceprovider. The filter names for this are `index.*.mapping` and `index.*.settings` where the `*` represents the model name (or its custom `$modelName`). For example:

```php
Eventy::addFilter('index.category.mapping', fn ($mapping) => array_merge_recursive($mapping, [
    'properties' => [
        'children' => [
            'type' => 'flattened',
        ],
    ],
]));
```

##### Class

You can also use classes instead of directly altering the arrays within your filter. For an example of this, have a look at [the `withSynonyms` class](https://github.com/rapidez/core/blob/master/src/Index/WithSynonyms.php). Example:

```php
// Simple without parameters
Eventy::addFilter('index.product.settings', fn($filters) => array_merge($filters ?: [], [WithSynonyms::class]));

// With parameters
Eventy::addFilter('index.product.mapping', fn($filters) => array_merge($filters ?: [], [
    [WithSynonyms::class, 'fields' => $productSynonymFields]
]));
```
