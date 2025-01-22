# Extending

---

[[toc]]

## Models

All models are defined in the [Rapidez config](configuration.md#rapidez):

```php
'models' => [
    'page'         => Rapidez\Core\Models\Page::class,
    'attribute'    => Rapidez\Core\Models\Attribute::class,
    'product'      => Rapidez\Core\Models\Product::class,
    ...
]
```

To overwrite a model, you can simply extend it. For example, create a new `app/Models/Product.php` file and extend the Rapidez model:

```php
<?php

namespace App\Models;

use Rapidez\Core\Models\Product as BaseProduct;

class Product extends BaseProduct {
    //
}
```

And change it in the configuration file:

```php
'models' => [
    ...
    'product'      => Rapidez\Core\Models\Product::class,// [!code --]
    'product'      => App\Models\Product::class,// [!code ++]
    ...
]
```

## Controllers

All controllers are defined in the [Rapidez config](configuration.md#rapidez):

```php
'controllers' => [
    'page'     => Rapidez\Core\Http\Controllers\PageController::class,
    'product'  => Rapidez\Core\Http\Controllers\ProductController::class,
    'category' => Rapidez\Core\Http\Controllers\CategoryController::class,
],
```

For controllers, you can also extend them, for example: `app/Controllers/ProductController.php`. Make sure you implement the methods as defined in the core controller and define it in the configuration just like you would with models.

## Widgets

Magento widgets can be defined in the [Rapidez config](configuration.md#rapidez): 

```php
'widgets' => [
    'Magento\Cms\Block\Widget\Block'                   => Rapidez\Core\Widgets\Block::class,
    'Magento\CatalogWidget\Block\Product\ProductsList' => Rapidez\Core\Widgets\ProductList::class,
],
```

They are rendered with the [widget directive](theming.md#widget). You can implement additional widgets by adding them to the configuration and creating a class. All parameters will be added to the constructor, and a `render()` method should return the output. Take a look at the [existing widgets](https://github.com/rapidez/core/tree/master/src/Widgets).

If the widget doesn't need any extra logic and just needs a view with the available parameters, you can simply specify the view name. All parameters will be available within the `$options` variable.

```php
'widgets' => [
    ...
    'Your\Custom\Widget' => 'viewname',
],
```

::: tip Alternatives to Magento's CMS functionalities
Take a look at the [CMS packages](packages.md#cms)!
:::

## Routes

You can add any additional routes just "the Laravel way". Check out the [Laravel routing docs](https://laravel.com/docs/11.x/routing). Additionally, Rapidez adds a handy `store_code` route middleware, so you can create routes for specific stores:

```php
Route::middleware('store_code:YOUR_STORE_CODE')->get('customroute', function () {
    // 
});
```

Alternatively, you can create a custom routes file if you have multiple routes specific to a store within your `RouteServiceProvider`:

```php
Route::middleware(['web', 'store_code:YOUR_STORE_CODE'])
    ->group(base_path('routes/YOUR_STORE_CODE.php'));
```

## Autocomplete

The autocomplete can contain as many Elasticsearch indexes as you wish. You can add these in the `frontend.php` config file. For example:

```php
'autocomplete' => [
    'additionals' => [
        'categories' => ['name^3', 'description'],
        'blogs' => [
            'fields' => ['title', 'tags'],
            'size' => 3,
            'stores' => ['my_second_store'],
            'sort' => ['date' => 'desc'],
        ],
    ],

    'debounce' => 500,
    'size' => 10,
],
```

### Configuration

There are two ways to define a new additional index. The shorthand way is by only giving the index name and searchable fields, like so:

```php
'categories' => ['name^3', 'description'],
```

Alternatively, you can have more control by expanding the configuration like below:

```php
'blogs' => [
    'fields' => ['title', 'tags'],
    'fuzziness' => 'AUTO:5,10',
    'size' => 3,
    'stores' => ['my_second_store'],
    'sort' => ['date' => 'desc'],
],
```

| Option | Required | Description |
|---|---|---|
| `fields` | Yes | The searched fields |
| `fuzziness` | No | The ElasticSearch fuzziness parameter. See [the ES documentation](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/common-options.html#fuzziness). |
| `size` | No | Overrides the default `size` parameter for this index, letting you define a different page size for this specific index. In the above example, we only get a maximum of 3 blogs to be shown in the autocomplete instead of the default 10. |
| `stores` | No | Limits your index to specific stores. In the above example, the `blogs` index will only be queried on the store with the code `my_second_store`. This allows you to have store-specific indexes. The index will be used on all stores if this parameter is not defined. |
| `sort` | No | Lets you define an alternative sorting in case the default ES sorting doesn't suffice. See [the ES documentation](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/sort-search-results.html) for how to use this parameter correctly. |

### Displaying new indexes

When you add a new index to this configuration, Rapidez will attempt to include `rapidez::layouts.partials.header.autocomplete.index_name_here` in the autocomplete. This means that any additional indexes should have their own view defined under
```
/resources/views/vendor/rapidez/layouts/partials/header/autocomplete/index_name_here.blade.php
```

A basic example of such a view can be found below:

```blade
<div class="border-b pb-2">
    <x-rapidez::autocomplete.title>@lang('My index')</x-rapidez::autocomplete.title>
    <ul class="flex flex-col">
        <li v-for="hit in resultsData.hits" :key="hit._source.id">
            <a v-bind:href="hit._source.url">
                <span v-html="autocompleteScope.highlight(hit, 'field_name_here')"></span>
            </a>
        </li>
    </ul>
</div>
```

Variables you can use in this view:


| Variable | Description |
|---|---|
| `resultsData` | The data that's been returned by ElasticSearch. You can loop over `resultsData.hits` to get all of the relevant hits. |
| `autocompleteScope` | The data of the `autocomplete` component. This is mostly useful to be able to use `autocompleteScope.highlight(hit, 'field_name_here')` as done in the example above. |
