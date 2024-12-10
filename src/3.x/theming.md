# Theming

---

The base theming is located within `rapidez/core` which you can publish to your project and change it. Alternatively, you can [create your own package](package-development.md) with views, CSS, and Javascript like a theme.

::: tip
Read the [Laravel Blade Templates docs](https://laravel.com/docs/11.x/blade) before you begin.
:::

[[toc]]

## Views

To change the views, you can publish them with:

```bash
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=views
```

After that, you'll find all the Rapidez Core views in `resources/views/vendor/rapidez`. For more information, see [Overriding Package Views](https://laravel.com/docs/11.x/packages#overriding-package-views) in the Laravel docs.

::: tip
It's recommended to only add the views you've changed into your source control for upgradability. To keep track of what you've changed in a view, it's a good idea to add the unchanged version to version control before you make any changes.
:::

## CSS

We're using [Tailwind CSS](https://tailwindcss.com) with [Vite](https://laravel.com/docs/11.x/vite), so probably you don't need to touch the CSS, but if you need to add a simple class, the "starting point" is `resources/css/app.css`. From there, we include the core styling and that's where the color variables can be defined. For any Tailwind changes, you'll need to be within the `tailwind.config.js`.

::: details But... I don't like Tailwind CSS
If you don't like Tailwind CSS you *can* use anything else. But it's widely used in Rapidez packages, so we don't recommend it. Just clear out the `resources/css/app.css` and write your own.
:::

## Javascript

We automatically import everything in `resources/js/app.js`, and you can extend from there. If you need additional Vue components, read the [readme within the components folder](https://github.com/rapidez/rapidez/blob/master/resources/js/components/README.md).

## Blade Directives

Rapidez provides some Blade Directives to easily get information from Magento.

::: warning Caching
Keep in mind the output of these directives is cached! So after changing a configuration, block, or widget, the cache needs to be cleared. See the [caching docs](cache.md).
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

Optionally, you can specify a second argument with an array, which will be passed through to the [`strtr`](https://php.net/strtr) function to replace data within the block, for example:
```blade
@block('footer_links_block', [
    '<a' => '<a class="text-red-600"'
])
```

### `@content`

Processes content containing variables from Magento so that variables, blocks, and widgets are working.
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

Rapidez comes with some useful [Blade Components](https://github.com/rapidez/core/tree/master/resources/views/components) for commonly used elements like form elements to reduce repetition. For example, the input component:
```blade
<x-rapidez::input name="username"/>
```

Which outputs a styled input with an id, name, type, placeholder, and label (with a corresponding `for` attribute) on top.

::: tip
Try to use these elements as much as possible, so that if you'd like to change the appearance you can do so in only one place.
:::

Another example is the "productlist" component, which outputs a nice product list:
```blade
<x-rapidez::productlist :value="['MS04', 'MS05', 'MS09']"/>
```

Rapidez is using this component to render the related products, up-sells, and cross-sells, but it can be used anywhere.

## Blade Icons

Rapidez comes preinstalled with [Blade Icons](https://blade-ui-kit.com/blade-icons?set=1), providing a massive library of icons you can use in your project! With many [icon packages available](https://github.com/blade-ui-kit/blade-icons#icon-packages) to get even more icons.

### Icon Deferring

We've added [Icon deferring](https://github.com/blade-ui-kit/blade-icons#deferring-icons) support to Blade Icons in order to reduce HTML element count when icons are used often. In Rapidez, this is enabled by default. If you would rather turn it off, you can change it globally in the options by publishing the config with:
```bash
php artisan vendor:publish --tag=blade-icons
```

And adding `'defer' => false` to the `'attributes'` section within the config file:
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

## Vue Directives

On top of Vue, we've added some extra directives.

### `v-blur`

Just like [v-cloak](https://v2.vuejs.org/v2/api/#v-cloak), but instead of hiding, the element will be blurred. Useful if you don't like to have any layout shifts.

### `v-on-click-away`

Rapidez uses [vue-clickaway](https://github.com/simplesmiler/vue-clickaway), enabling you to close something if you click away from the element. [An example can be found within the core](https://github.com/search?q=repo%3Arapidez%2Fcore%20v-on-click-away&type=code).

## Multistore

Rapidez also has support for multiple themes! This is based on the `MAGE_RUN_CODE`.

### Blade

In `config/rapidez.php`, you can define the themes you'd like to be used per store code:
```php
'themes' => [
    'default' => resource_path('themes/default'),
    'extra_store' => resource_path('themes/extra_store'),
    'extra_store_nl' => resource_path('themes/extra_store'),
],
```

In this example, we have the default store using a "default" theme. The extra store in both languages is using the same "extra_store" theme since its changes are only translations.

The structure of your theme folder will be the same as your views folder, so overriding the views folder is as simple as copying and pasting the file with the correct folder structure.

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

Of course, you can do this any way you want if you want to load the same CSS for specific stores. Map the store code to a theme name and use that as your CSS file.

## Translations

You can create a JSON file for your language within the `lang` directory, for example: `/lang/de.json`. As an example, have a look at the [existing translations in the core](https://github.com/rapidez/core/tree/master/lang). For more information, read the [Laravel Localization docs](https://laravel.com/docs/11.x/localization).

In the core, we also have a `frontend.php` translation file per language. These translations will be available from Javascript with: `config.translations.key`. To publish them to your project, use:

```bash
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=rapidez-translations
```