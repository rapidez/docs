# Extending

---

[[toc]]

## Overwriting Models

Sometimes projects need some custom logic added in a model. All models are defined in the standard Rapidez config:
```php
'models' => [
    'page'         => Rapidez\Core\Models\Page::class,
    'attribute'    => Rapidez\Core\Models\Attribute::class,
    'product'      => Rapidez\Core\Models\Product::class,
]
```
To overwrite a model just create one in your project in the models directory and extend the Rapidez model:
```php
namespace App\Models;

use Rapidez\Core\Models\Product as BaseProduct;

class Product extends BaseProduct {}
```

Then just overwrite it in the config:
```php
'models' => [
    'page'         => Rapidez\Core\Models\Page::class,
    'attribute'    => Rapidez\Core\Models\Attribute::class,
    'product'      => App\Models\Product::class,
]
```

## Overwriting Controllers

Sometimes projects need some custom logic added in a controller. All controllers are defined in the standard Rapidez config:
```php
'controllers' => [
    'page'     => Rapidez\Core\Http\Controllers\PageController::class,
    'product'  => Rapidez\Core\Http\Controllers\ProductController::class,
    'category' => Rapidez\Core\Http\Controllers\CategoryController::class,
],
```

Overwriting them works the same as overwriting models, with the exception of not having to extend the Rapidez controller.
::: tip Check before you overwrite
When overwriting a controller and not extending the Rapidez controller, make sure you overwrite all methods.
:::


## Implementing Magento widgets

Magento has widgets to place content on your webshop. These can be rendered with the [Widget directive](/0.x/theming.html#blade-directives). Widgets in Rapidez are somewhat like Blade Components. In the Rapidez config you can set your respective class in your Rapidez project that will handle your widget like so:
```php
'widgets' => [
    'Magento\Cms\Block\Widget\Block'                   => Rapidez\Core\Widgets\Block::class,
    'Magento\CatalogWidget\Block\Product\ProductsList' => Rapidez\Core\Widgets\ProductList::class,
],
```

Rapidez will automaticly grab the handler from the right hand statement of the array, and pass all widget parameters to it:
```php
<?php

namespace Rapidez\Core\Widgets;

use Rapidez\Core\RapidezFacade as Rapidez;

class Block
{
    public String $blockId;

    public function __construct($vars)
    {
        $this->blockId = is_object($vars) ? $vars->block_id : json_decode($vars)->block_id;
    }

    public function render()
    {
        $blockModel = config('rapidez.models.block');

        return Rapidez::content($blockModel::find($this->blockId)->content);
    }
}
```

Here you can manipulate the data as you wish and return either content strings or return a view.

::: tip Not a fan of Magento widgets?
Because with Rapidez you have a headless frontend, we like to use external content management systems like [Strapi](https://github.com/rapidez/strapi).
:::
