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

To overwrite a model, simply create one. For example, `app/Models/Product.php` and extend the Rapidez model:

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

Create your own controller. For example, `app/Controllers/Product.php`. Make sure you implement the methods as defined in the core controller and define it in the configuration as with models.

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
            'sort' => ['date' => 'desc'] // See: https://www.elastic.co/guide/en/elasticsearch/reference/7.17/sort-search-results.html
        ],
    ],

    'debounce' => 500,
    'size' => 10,
],
```

You can use `categories.blade.php` as an example for how to properly display new indexes in the autocomplete.