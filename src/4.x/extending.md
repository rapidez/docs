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
    'Magento\Catalog\Block\Category\Widget\Link'       => Rapidez\Core\Widgets\ProductAndCategoryLink::class,
    'Magento\Catalog\Block\Product\Widget\Link'        => Rapidez\Core\Widgets\ProductAndCategoryLink::class,
    'Magento\Cms\Block\Widget\Page\Link'               => Rapidez\Core\Widgets\PageLink::class,
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

You can add any additional routes just "the Laravel way". Check out the [Laravel routing docs](https://laravel.com/docs/12.x/routing). Additionally, Rapidez adds a handy `store_code` route middleware, so you can create routes for specific stores:

```php
Route::middleware('store_code:YOUR_STORE_CODE')->get('customroute', function () {
    // 
});
```

Alternatively, you can create a custom routes file if you have multiple routes specific to a store within `bootstrap/app.php`:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
    then: function () { // [!code focus]
        Route::middleware(['web', 'store_code:YOUR_STORE_CODE']) // [!code focus]
            ->group(base_path('routes/YOUR_STORE_CODE.php')); // [!code focus]
    }, // [!code focus]
)
```

## Autocomplete

The autocomplete can contain as many Elasticsearch/OpenSearch indexes as you wish. You can add these in the `frontend.php` config file. For example:

```php
'autocomplete' => [
    'additionals' => [
        'history'    => [],
        'categories' => [],

        'blogs' => [ // [!code focus]
            'size' => 10, // [!code focus]
        ], // [!code focus]
    ],

    'size' => 3,
],
```

### Configuration

There are two ways to define a new additional index. The shorthand way is by only giving the index name, like so:

```php
'categories' => [],
```

Alternatively, you can have more control by expanding the configuration like below:

```php
'blogs' => [
    'size' => 10,
],
```

| Option | Required | Description |
|---|---|---|
| `size` | No | Overrides the default `size` parameter for this index, letting you define a different page size for this specific index. In the above example, we only get a maximum of 10 blogs to be shown in the autocomplete instead of the default 3. |

### Displaying new indexes

When you add a new index to this configuration, Rapidez will attempt to include `rapidez::layouts.partials.header.autocomplete.index_name_here` in the autocomplete. This means that any additional indexes should have their own view defined under
```
/resources/views/vendor/rapidez/layouts/partials/header/autocomplete/index_name_here.blade.php
```

You could use the [categories view](https://github.com/rapidez/core/blob/master/resources/views/layouts/partials/header/autocomplete/categories.blade.php) as an example.
