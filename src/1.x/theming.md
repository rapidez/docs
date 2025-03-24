# Theming

---

The base theming is located within `rapidez/core` which you can publish to your project and change it. Alternatively you can [create your own package](package-development.md) with views, css and js like a theme.

::: tip
Read the [Laravel Blade Templates docs](https://laravel.com/docs/10.x/blade) before you begin.
:::

[[toc]]

## Views

To change the views you can publish them with:

```
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=views
```

After that you'll find all the Rapidez Core views in `resources/views/vendor/rapidez`. For more information see [Overriding Package Views](https://laravel.com/docs/10.x/packages#overriding-package-views) in the Laravel docs.

::: tip
It's recommended to only add the views you've changed into your source control for upgradability. To keep track of what you've changed in a view it's a good idea to add the unchanged version to version control before you make any changes.
:::

## Blade Directives

Rapidez provides some Blade Directives to easily get information from Magento.

::: warning Caching
Keep in mind the output of these directives are cached! So after changing a configuration, block or widget the cache needs te be cleared. See the [caching docs](cache.md).
:::

### `@config`

Get a config value for the current store scope with optionally a fallback, example:
```php
@config('general/locale/timezone', 'Europe/Amsterdam')
```
A third parameter can be set to `true` when it's a sensitive/encrypted config.

### `@block`

Get the block contents for the current store scope:
```php
@block('your_block_identifier')
```
Optionally you can specify a second argument with an array which will be passed through to the [`strtr`](https://php.net/strtr) function to replace data within the block, for example:
```php
@block('footer_links_block', [
    '<a' => '<a class="text-red-600"'
])
```

### `@content`

Processes content containing variables from Magento so variables, block and widgets are working.
```php
@content($page->content)
```
Created your own variables? Have a look at the `content-variables` [configuration](configuration.md).

### `@widget`

Used to specify a widget location where widgets can be rendered.
```php
@widget('location', 'type', 'handle', $entityId)
```
Have a look at the [current widget locations](https://github.com/rapidez/core/search?l=Blade&q=widget) we've added by default and the widget tables in the database to see how the parameters work. Custom widgets can be defined with the `widgets` [configuration](configuration.md).

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

Use [TailwindCSS](https://tailwindcss.com) as we've done with the base styling or change the `vite.config.js` file and use whatever you want. Have a look at the [Laravel Vite docs](https://laravel.com/docs/9.x/vite) for all the available options.

::: tip TailwindCSS JIT
By default Rapidez is using the [TailwindCSS Just-in-Time Mode](https://tailwindcss.com/docs/just-in-time-mode)
:::

## Javascript

In `resources/js/app.js` there is just an `import` so you can extend easily. If you'd like to change or overwrite something you can copy the content of the required file and change the parts you'd like.

## Multistore

Rapidez also has support for multiple themes!
This is done based on the `MAGE_RUN_CODE` you pass it and configuration.

### Blade

In `config/rapidez.php` you can define the themes you'd like to be used per store code.

An example of this configuration is:
```php
'themes' => [
  'default' => resource_path('themes/default'),
  'extra_store' => resource_path('themes/extra_store'),
  'extra_store_nl' => resource_path('themes/extra_store'),
],
```

In this example we have the default store using a "default" theme.

And the extra store in both languages using the same "extra_store" theme since it's changes are only translations.


The structure of your theme folder will be the same as your views folder, so overriding the views folder is as simple as copy and pasting the file with the correct folder structure.

If a template does not exist in your theme it'll try your (views)[https://github.com/laravel/laravel/blob/9.x/config/view.php#L17] folder and if it does not exist in there and it is from a package it'll lasty try to load the template from the package.

By default it will load your theme from `resources/themes/<theme name>` (because of the resource_path()), but this is fully customisable since it is expecting a full path to the theme folder.

### Tailwind & CSS

If you only want to change some tailwind colors and styling in your multistore and do not need to overwrite any templates it may be a good idea to only use a different tailwind config for this.

This can be done by editing your `vite.config.js` to generate different css files with different tailwind configs
```diff
export default defineConfig({
    plugins: [
        laravel({
            input: [
-               'resources/css/app.css',
+               'resources/css/app.<store_code>.css',
+               'resources/css/app.<another_store_code>.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
        createVuePlugin(),
        visualizer(),
    ],
    resolve: {
        preserveSymlinks: true,
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            'Vendor': path.resolve(__dirname, './vendor'),
            'vue': path.resolve(__dirname, './node_modules/vue/dist/vue.js')
        }
    }
});
```

then create your `resources/css/app.<store_code>.css` and import a config css file you will create for it at the top.
```diff
+@import "./<store_code>/config.css";
@import "./app.css";
```

and your `resources/css/<store_code>/config.css` and use tailwinds config directive which will compile this theme using that config.
```diff
+@config "../../../tailwind.<store_code>.js";
```

Then you can create your different tailwind configs, e.g. updating some colors for a specific theme.
```js
module.exports = {
    presets: [
        require('./tailwind.config.js')
    ],
    theme: {
        colors: {
            blue: {
                100: '#EAF1F4',
                110: '#CCDFE8',
                200: '#D0D9DC',
                300: '#A0B1B9',
                400: '#6A8693',
                900: '#143F51',
            }
        },
    }
}
```

This will compile any css within `resources/css/app.<store code>.css` and tailwind into your `public/css/app.<store code>.css` folder.

after which you will be able to update your `app.blade.php` with the new path to your css.

```diff
@vite([
- 'resources/css/app.css', 
+ 'resources/css/app.' . config('rapidez.store_code') . '.css', 
  'resources/js/app.js'
])
```

Of course you can do this any way you want, if you want to load the same css for specific stores. Map the store code to a theme name and use that as your css file.
