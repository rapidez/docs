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

To overwrite a model just create one, for example: `app/Models/Product.php` and extend the Rapidez model:

```php
<?php

namespace App\Models;

use Rapidez\Core\Models\Product as BaseProduct;

class Product extends BaseProduct {
    //
}
```

Then change it in the configuration file:

```php
'models' => [
    ...
    'product'      => App\Models\Product::class,
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

Create your own, for example: `app/Controllers/Product.php`, make sure you implement the methods as defined in the controller in the core and define it in the configuration as with models.

## Widgets

Magento widgets can be defined in the [Rapidez config](configuration.md#rapidez): 

```php
'widgets' => [
    'Magento\Cms\Block\Widget\Block'                   => Rapidez\Core\Widgets\Block::class,
    'Magento\CatalogWidget\Block\Product\ProductsList' => Rapidez\Core\Widgets\ProductList::class,
],
```

They're rendered with the [widget directive](theming.md#widget). You can implement additional widgets by adding them to the configuration and creating a class. All parameters will be added to the constructor and a `render()` method should return the output. Have a look at the [existing widgets](https://github.com/rapidez/core/tree/master/src/Widgets).

If the widget doesn't need any extra logic and just needs a view with the available parameters you can just specify the view name. All parameters will be available within the `$options` variable.
```php
'widgets' => [
    ...
    'Your\Custom\Widget' => 'viewname',
],
```

::: tip Alternatives to Magento's CMS functionalities
Have a look at the [CMS packages](packages.md#cms)!
:::
