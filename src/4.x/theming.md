<script setup>
import ColorTile from '../.vitepress/theme/ColorTile.vue'
</script>

# Theming

---

The base theming is located within `rapidez/core` which you can publish to your project and change it. Alternatively, you can [create your own package](package-development.md) with views, CSS, and Javascript like a theme.

::: tip
Read the [Laravel Blade Templates docs](https://laravel.com/docs/12.x/blade) before you begin.
:::

[[toc]]

## Views

To change the views, you can publish them with:

```bash
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=views
```

After that, you'll find all the Rapidez Core views in `resources/views/vendor/rapidez`. For more information, see [Overriding Package Views](https://laravel.com/docs/12.x/packages#overriding-package-views) in the Laravel docs.

::: tip
It's recommended to only add the views you've changed into your source control for upgradability. To keep track of what you've changed in a view, it's a good idea to add the unchanged version to version control before you make any changes.
:::

## CSS

We're using [Tailwind CSS](https://tailwindcss.com) with [Vite](https://laravel.com/docs/12.x/vite), so probably you don't need to touch the CSS, but if you need to add a simple class, the "starting point" is [`resources/css/app.css`](https://github.com/rapidez/rapidez/blob/master/resources/css/app.css). From there, we include the core styling and that's where the color variables can be defined. For any Tailwind changes, you'll need to be within the [`tailwind.config.js`](https://github.com/rapidez/core/blob/master/tailwind.config.js).

::: details But... I don't like Tailwind CSS
If you don't like Tailwind CSS you *can* use anything else. But it's widely used in Rapidez packages, so we don't recommend it. Just clear out the [`resources/css/app.css`](https://github.com/rapidez/rapidez/blob/master/resources/css/app.css) and write your own.
:::

### Colors

Colors can be configured from [`resources/css/app.css`](https://github.com/rapidez/rapidez/blob/master/resources/css/app.css) and all colors used by Rapidez can be found within the [`tailwind.config.js`](https://github.com/rapidez/core/blob/master/tailwind.config.js). This is just a starting point to easily change the whole look and feel with some variables. We advice you to use those variables / classes as much as possible but you're free to use anything else.

The colors variables are inspired by [GitHub Primer](https://primer.style/) where Tailwind CSS provides the "base color tokens", see: [design token categories](https://primer.style/foundations/color/overview#design-token-categories) and within the [`tailwind.config.js`](https://github.com/rapidez/core/blob/master/tailwind.config.js) we're just "aliasing" those to "functional color tokens". More information with examples on color naming can be found in the [color names refactor pull request](https://github.com/rapidez/core/pull/622).

#### Semantic colors

These colors can be used to apply your branding. There is one "modifier" by default provided: `text`. That color modifier is used for the text on top of the color, for example with buttons. The `conversion` color is used for anything "conversion" related.

Color name | CSS variable | Default color | |
:--- | :--- | :--- | :---
`primary` | `--primary` | `#2FBC85` | <colorTile color="#2FBC85"/>{.np}
`primary-text` | `--primary-text` | `white` | <colorTile color="white"/>{.np}
`secondary` | `--secondary` | `#202F60` | <colorTile color="#202F60"/>{.np}
`secondary-text` | `--secondary-text` | `white` | <colorTile color="white"/>{.np}
`conversion` | `--conversion` | `green-500` | <colorTile color="#22c55e"/>{.np}
`conversion-text` | `--conversion-text` | `white` | <colorTile color="white"/>{.np}

These color names work the same as Tailwind colors. You can use them for anything, for exmaple: `bg-primary`, `border-primary`, `text-primary`, etc.

#### Neutral colors

Used for the text color, borders, backgrounds, rings and outlines to give some design system to work with. Visual examples can be found with in the [Primer neutral colors docs](https://primer.style/foundations/color/overview#neutral-colors). These colors should not be used directly: ~~`text-foreground`~~ as those colors are "linked and scoped" to the text, border, background, ring and outline colors. Just use the provided classes to keep a consistent style.

##### Text / Foreground

Class | CSS variable | Default color | |
:--- | :--- | :--- | :---
`text-emphasis` | `--foreground-emphasis` | `slate-900` | <colorTile color="#0f172a"/>{.np}
`text` / `text-default` | `--foreground` | `slate-800` | <colorTile color="#1e293b"/>{.np}
`text-muted` | `--foreground-muted` | `slate-600` | <colorTile color="#475569"/>{.np}

##### Border, ring and outline

Class | CSS variable | Default color | |
:--- | :--- | :--- | :---
`border-emphasis` | `--border-emphasis` | `slate-400` | <colorTile color="#94a3b8"/>{.np}
`border` / `border-default` | `--border` | `slate-300` | <colorTile color="#cbd5e1"/>{.np}
`border-muted` | `--border-muted` | `slate-100` | <colorTile color="#f1f5f9"/>{.np}

> Ring and outline colors are the same as the border colors, you can use them like: `outline-emphasis` and `ring-emphasis`.

##### Background

Class | CSS variable | Default color | |
:--- | :--- | :--- | :---
`bg-emphasis` | `--background-emphasis` | `slate-200` | <colorTile color="#e2e8f0"/>{.np}
`bg` / `bg-default` | `--background` | `slate-100` | <colorTile color="#f1f5f9"/>{.np}
`bg-muted` | `--background-muted` | `slate-50` | <colorTile color="#f8fafc"/>{.np}

##### Backdrop

A slightly transparant background visible when a slideover or the autocomplete is open.

Class | CSS variable | Default color | |
:--- | :--- | :--- | :---
`backdrop` | `--backdrop` | `rgba(0, 0, 0, 0.4)` | <colorTile color="#00000066"/>{.np}

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

Rapidez uses a separated package with Blade Components for inputs, checkboxes, buttons, etc. See: [rapidez/blade-components](https://github.com/rapidez/blade-components). An example of the input component:

```blade
<label>
    <x-rapidez::label>Something</x-rapidez::label>
    <x-rapidez::input name="something" class="extra-styling" />
</label>
```

Additionally, there are some Rapidez specific components within the core. See the [resources/views/components/](https://github.com/rapidez/core/tree/master/resources/views/components) directory.

::: tip
Try to use these elements as much as possible, so that if you'd like to change the appearance you can do so in only one place.
:::

### Listing component

The [`productlist`](https://github.com/rapidez/core/blob/master/resources/views/components/productlist.blade.php) component can be used to output a nice product list by SKU:
```blade
<x-rapidez::productlist :value="['MS04', 'MS05', 'MS09']"/>
```
Or with the product info from Javascript:
```blade
<x-rapidez::productlist
    value="config.productIds"
    field="entity_id"
    title="Products you need!"
/>
```
Rapidez is using this component to render the related products, up-sells, and cross-sells. 

This [`productlist`](https://github.com/rapidez/core/blob/master/resources/views/components/productlist.blade.php) Blade component and the [`listing`](https://github.com/rapidez/core/blob/master/resources/views/components/listing.blade.php) Blade component (used for category pages and the search results page) are using the renderless [`Listing.vue`](https://github.com/rapidez/core/blob/master/resources/js/components/Listing/Listing.vue) component that does have some useful props:

Prop | Type | Explanation
:--- | :--- | :---
`index` | String | The ElasticSearch index name
`query` | Function | To give you full control with [Query DSL](https://www.elastic.co/docs/explore-analyze/query-filter/languages/querydsl)
`categoryId` | Number | Filter the items by category ID
`baseFilters` | Function | Additional base filters; just like the `categoryID`. The base to start with.
`filterQueryString` | String | The easiest way to filter, see [query string query](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query)
`configCallback` | Function | Can be used to change the config per listing

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

As mentioned the the [multistore configuration docs](configuration.md#multistore) it's possible to have different config files per store. To have a different theme per store simply create it within `/config/rapidez/stores/{store_code}/frontend.php` and define a custom path:
```php
<?php

return [
    'theme' => resource_path('themes/custom_theme'),
];
```

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

You can create a JSON file for your language within the `lang` directory, for example: `/lang/de.json`. As an example, have a look at the [existing translations in the core](https://github.com/rapidez/core/tree/master/lang). For more information, read the [Laravel Localization docs](https://laravel.com/docs/12.x/localization).

In the core, we also have a `frontend.php` translation file per language. These translations will be available from Javascript with: `config.translations.key`. To publish them to your project, use:

```bash
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag=rapidez-translations
```
