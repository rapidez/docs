# Theming

---

The base theming is located within `rapidez/core` but you can create your own package with all the views, css and js.

[[toc]]

## Views

To change the views you can publish them with:
```bash
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=views
```
::: tip
It's recommended to only add the views you've changed into your source control for upgradability. To keep track of what you've changed in a view it's a good idea to add the unchanged version to version control before you make any changes.
:::

## Blade Directives

Rapidez provides some Blade Directives to easily get information from Magento.

::: tip Caching
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

## CSS

Use TailwindCSS as we've done with the base styling or change the `webpack.mix.js` file and use whatever you want. Have a look at the [Laravel Mix docs](https://laravel.com/docs/8.x/mix) for all the available options.

## Javascript

In `resources/js/app.js` there is just a `require` so you can extend easily. If you'd like to change or overwrite something you can copy the content of the required file and change the parts you'd like.
