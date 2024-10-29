# Theming

---

The base theming is located within `rapidez/core` which you can publish to your project and change it. Alternatively you can [create your own package](package-development.md) with views, css and js like a theme.

::: tip
Read the [Laravel Blade Templates docs](https://laravel.com/docs/master/blade#main-content) before you begin.
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
Keep in mind the output of these directives are cached! So after changing a configuration, block or widget the cache needs te be cleared. See the [caching docs](cache.md).
:::

### `@config`

Get a config value for the current store scope with optionally a fallback, example:
```blade
@config('general/locale/timezone', 'Europe/Amsterdam')
```
A third parameter can be set to `true` when it's a sensitive/encrypted config.

### `@block`

Get the block contents for the current store scope:
```blade
@block('your_block_identifier')
```
Optionally you can specify a second argument with an array which will be passed through to the [`strtr`](https://php.net/strtr) function to replace data within the block, for example:
```blade
@block('footer_links_block', [
    '<a' => '<a class="text-red-600"'
])
```

### `@content`

Processes content containing variables from Magento so variables, block and widgets are working.
```blade
@content($page->content)
```
Created your own variables? Have a look at the `content-variables` [configuration](configuration.md).

### `@widget`

Used to specify a widget location where widgets can be rendered.
```blade
@widget('location', 'type', 'handle', $entityId)
```
Have a look at the [current widget locations](https://github.com/rapidez/core/search?l=Blade&q=widget) we've added by default and the widget tables in the database to see how the parameters work. Custom widgets can be defined with the `widgets` [configuration](configuration.md).

## Blade Components

Rapidez comes with some useful [Blade Components](https://github.com/rapidez/core/tree/master/resources/views/components) for commonly used elements like form elements to reduce repetition. For example the input component:
```blade
<x-rapidez::input name="username"/>
```
Which outputs a styled input with an id, name, type, placeholder and label (with a corresponding `for` attribute) on top.

::: tip
Try to use these elements as much as possible so if you'd like to change the appearance you can do so at one place.
:::

Another example; the "productlist" component which outputs a nice product list:
```blade
<x-rapidez::productlist :value="['MS04', 'MS05', 'MS09']"/>
```
Rapidez is using this component to render the related products, up-sells and cross-sells but it can be used anywhere.

## Blade Icons

Rapidez comes preinstalled with [Blade Icons](https://blade-ui-kit.com/blade-icons?set=1) providing a massive library of icons you can use in your project! With many [icon packages available](https://github.com/blade-ui-kit/blade-icons#icon-packages) to get even more icons.

### Icon Deferring

We've added [Icon deferring](https://github.com/blade-ui-kit/blade-icons#deferring-icons) support to Blade Icons in order to reduce HTML element count when icons are used often. In Rapidez this is enabled by default. If you would rather turn it off you can change it globally in the options by publishing the config with:
```bash
php artisan vendor:publish --tag=blade-icons
```
And adding `'defer' => false` to the `'attributes'` section within the config file
```php
...
'attributes' => [
    // 'width' => 50,
    // 'height' => 50,
    'defer' => false// [!code ++]
],
...
```

Or per icon:

```blade
<x-heroicon-s-heart class="h-6 w-6 text-red-600" :defer="false" />
```

## CSS

Use [Tailwind CSS](https://tailwindcss.com) as we've done with the base styling or change the `vite.config.js` file and use whatever you want. Have a look at the [Laravel Vite docs](https://laravel.com/docs/master/vite#main-content) for all the available options.

## Javascript

In `resources/js/app.js` there is just an `import` so you can extend easily. If you'd like to change or overwrite something you can copy the content of the required file and change the parts you'd like.

## Multistore

Rapidez also has support for multiple themes! This is based on the `MAGE_RUN_CODE`.

### Blade

In `config/rapidez.php` you can define the themes you'd like to be used per store code:
```php
'themes' => [
    'default' => resource_path('themes/default'),
    'extra_store' => resource_path('themes/extra_store'),
    'extra_store_nl' => resource_path('themes/extra_store'),
],
```

In this example we have the default store using a "default" theme. The extra store in both languages using the same "extra_store" theme since its changes are only translations.


The structure of your theme folder will be the same as your views folder, so overriding the views folder is as simple as copy and pasting the file with the correct folder structure.

### Tailwind & CSS

If you only want to change some Tailwind colors and styling in your multistore and do not need to overwrite any templates, it may be a good idea to only use a different Tailwind config. This can be done by editing your Vite config to generate different CSS files with different Tailwind configs.

1. **`vite.config.js`**
```js
export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',// [!code --]
                'resources/css/app.<store_code>.css',// [!code ++]
                'resources/css/app.<another_store_code>.css',// [!code ++]
                'resources/js/app.js',
            ],
```


2. **`resources/css/app.<store_code>.css`**
```css
@import "./<store_code>/config.css";
@import "./app.css";
```

3. **`resources/css/<store_code>/config.css`**
```css
@config "../../../tailwind.<store_code>.js";
```

4. **`tailwind.<store_code>.js`**
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

5. **`resources/views/layouts/app.blade.php`**
```blade
@vite([
    'resources/css/app.css',// [!code --]
    'resources/css/app.' . config('rapidez.store_code') . '.css',// [!code ++]
    'resources/js/app.js'
])
```

Of course you can do this any way you want, if you want to load the same CSS for specific stores. Map the store code to a theme name and use that as your CSS file.

## Translations

Just create a json file for your language within the `lang` directory, for example: `/lang/de.json`. As an example have a look at the [existing translations in the core](https://github.com/rapidez/core/tree/master/lang). For more information read the [Laravel Localization docs](https://laravel.com/docs/master/localization).

In the core we also have a `frontend.php` translation file per language, these translations will be available from Javascript with: `config.translations.key`. To publish them to your project use:

```bash
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=rapidez-translations
```
