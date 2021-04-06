# Theming

---

The base theming is located within `rapidez/core` which you can publish to your project and change it. Alternatively you can [create your own package](package-development.md) with views, css and js like a theme.

::: tip
Read the [Laravel Blade Templates docs](https://laravel.com/docs/master/blade) before you begin.
:::

[[toc]]

## Views

To change the views you can publish them with:

```bash
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=views
```

After that you'll find all the Rapidez Core views in `resources/views/vendor/rapidez`. For more information see [Overriding Package Views](https://laravel.com/docs/master/packages#overriding-package-views) in the Laravel docs.

::: tip
It's recommended to only add the views you've changed into your source control for upgradability. To keep track of what you've changed in a view it's a good idea to add the unchanged version to version control before you make any changes.
:::

## Blade Directives

Rapidez provides some Blade Directives to easily get information from Magento.

::: warning Caching
Keep in mind the output of these directives are cached! So after changing a configuration, block or widget the cache needs te be cleared. See the [caching docs](caching.md).
:::

### `@config`

Get a config value for the current store scope with optionally a fallback, example:
```php
@config('general/locale/timezone', 'Europe/Amsterdam')
```

### `@block`

Get the block contents for the current store scope:
```php
@block('your_block_identifier')
```

### `@widget`

Get the widget contents for the current store scope:
```php
@widget('location', 'type', 'handle', $entityId)
```
Have a look at the [current widget locations](https://github.com/rapidez/core/search?l=Blade&q=widget) we've added by default and the widget tables in the database to see how the parameters work.

::: warning
Widgets are currently not fully supported. Just simple ones with blocks work fine.
:::

## Blade Components

Rapidez comes with some useful [Blade Components](https://github.com/rapidez/core/tree/master/resources/views/components) for commonly used elements like form elements to reduce repetition. For example the input component:
```
<x-rapidez::input name="username"/>
```
Which outputs a styled input with an id, name, type, placeholder and label (with a corresponding `for` attribute) on top.

::: tip
Try to use these elements as much as possible so if you'd like to change the appearance you can do so at one place.
:::

Another example; the "productlist" component which outputs a nice product list:
```
<x-rapidez::productlist :value="['MS04', 'MS05', 'MS09']"/>
```
Rapidez is using this component to render the related products, up-sells and cross-sells but it can be used anywhere.

## CSS

Use [TailwindCSS](https://tailwindcss.com) as we've done with the base styling or change the `webpack.mix.js` file and use whatever you want. Have a look at the [Laravel Mix docs](https://laravel.com/docs/8.x/mix) for all the available options.

::: tip TailwindCSS JIT
By default Rapidez is using the [TailwindCSS Just-in-Time Mode](https://tailwindcss.com/docs/just-in-time-mode)
:::

## Javascript

In `resources/js/app.js` there is just a `require` so you can extend easily. If you'd like to change or overwrite something you can copy the content of the required file and change the parts you'd like.
