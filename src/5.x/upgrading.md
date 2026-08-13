---
description: Upgrade info from Rapidez v4 to Rapidez v5 including all changes like the removal of the Magento flat tables dependency, the Vue 3 and Tailwind 4 upgrade, new features like customer group pricing, tier pricing, product media videos and cache tags with step-by-step info on how to upgrade. There is also a prompt to automate the upgrade.
---

# Upgrading

---

[[toc]]

## Rapidez v5

In this release, we removed the [flat tables dependency](https://github.com/rapidez/core/pull/943)! 🚀 And we also updated to [Vue 3](https://github.com/rapidez/core/pull/951) and [Tailwind 4](https://github.com/rapidez/core/pull/1211) 🤘🏻 We also added support for:

- [Customer group pricing](https://github.com/rapidez/core/pull/1074)
- [Tier pricing](https://github.com/rapidez/core/pull/1205)
- [Product media videos](https://github.com/rapidez/core/pull/1128)
- [Cache tags](https://github.com/rapidez/core/pull/1103)

Other changes included in this release:
- [Drop support for Laravel 11](https://github.com/rapidez/core/pull/1096)

Some of these are quite substantially breaking changes. On this page we'll mention the most important things that you will need to do to upgrade.

You should review [all template/config changes](https://github.com/rapidez/core/compare/4.x..master) and check the [full changelog](https://github.com/rapidez/core/releases).

:::tip
For any major update, you should be aware that all overwritten Blade, Vue, and PHP files will need to be checked. Checking the above diff is the quickest way to tell where you need to make changes.
:::

## Composer dependencies

Check all your dependencies one by one to see if they're compatible and what has changed in changelogs / release notes. To get a nice overview, run the following command:
```bash
composer outdated
```

## Vue 3

### Dependencies

1. **Remove**
```bash
yarn remove @vitejs/plugin-vue2 vue-clickaway vue2-teleport vue-template-compiler
```

2. **Install**
```bash
yarn add -D @vitejs/plugin-vue vue3-click-away
```

And update your `vite.config.js`

```diff
  import path from 'path'
  import { defineConfig } from 'vite'
  import laravel from 'laravel-vite-plugin'
- import vue from '@vitejs/plugin-vue2'
+ import vue from '@vitejs/plugin-vue'
  import { visualizer } from 'rollup-plugin-visualizer'

  export default defineConfig({
...
          alias: {
              '@': path.resolve(__dirname, './resources/js'),
              Vendor: path.resolve(__dirname, './vendor'),
-             vue: path.resolve(__dirname, './node_modules/vue/dist/vue.esm.js'),
+             vue: 'vue/dist/vue.esm-bundler.js',
          },
      },
  })
```

3. **Upgrade the other dependencies**

```bash
yarn add -D @vueuse/core @vueuse/integrations cross-env instantsearch.js laravel-vite-plugin vite vue
```

4. **Upgrade your scripts and templates**

This will require some work but we've got a list of things to check. Please read the [Vue 3 migration guide](https://v3-migration.vuejs.org/). Some recurring themes we've run into:

- [Dropped support for global $emit and $on](https://v3-migration.vuejs.org/breaking-changes/events-api#event-bus), For this we've [built a system on regular events](https://github.com/rapidez/core/blob/cecc136e5ef76dc4925186a332f875d3ffe658fe/resources/js/polyfills/emit.js#L18). You should replace `$root.$on`/`window.app.$on` with `window.$on`.
- Check for any `v-if`s in combination with `v-for`, see: [If used on the same element, v-if will have higher precedence than v-for](https://v3-migration.vuejs.org/breaking-changes/v-if-v-for.html)
- Rename all `slot-scope` to `v-slot` and move them to the component in your template
- The `price`, `truncate` and `url` filters no longer work, replace <span v-pre>`@{{ final_price | price }}` with `@{{ price(final_price) }}`</span> as well as `$options.filters.price(final_price)` with `price(final_price)`
- Any custom async components must be wrapped by `defineAsyncComponent`: `() => import('...')` to `defineAsyncComponent(() => import('...'))`
- `window.app` no longer contains the custom variables. Replace `window.app.<...>` e.g. `cart`  with `window.app.config.globalProperties.<...>` or if you’re within vue templates directly do `<...>`
- When inside js functions all computed (refs) must be retrieved with `.value`. Examples are: `cart.value`, `user.value`, `token.value`, `mask.value`, `loading.value`
- All calls to `Vue.set` calls should be removed, and replaced by setting the variable directly.

5. **Build**
```bash
yarn build
```

:::tip
We recommend to double check all frontend dependencies with `yarn outdated`.
:::

## Tailwind v4


1. **Migrate to Vite**

If you are using Vite, we recommend migrating from the PostCSS plugin. Add this to your `vite.config.js`:
```diff
+ import tailwindcss from "@tailwindcss/vite";
  export default defineConfig({
...
    plugins: [
+       tailwindcss(),
    ]
  })
```
Then you need to install `@tailwindcss/vite`:
```bash
yarn add -D @tailwindcss/vite
```

2. **Update to Tailwind CSS 4**

Tailwind CSS has a built-in upgrade tool that can be found in the [Tailwind CSS docs](https://tailwindcss.com/docs/upgrade-guide#using-the-upgrade-tool).
```bash
npx @tailwindcss/upgrade
```
It is still necessary to review the changes that are made when the upgrade is done. Check if all [deprecated utilities](https://tailwindcss.com/docs/upgrade-guide#removed-deprecated-utilities) are changed.
```diff
- class="bg-black bg-opacity-50 flex-shrink-0"
+ class="bg-black/50 shrink-0"
```

Also check the [renamed utilities](https://tailwindcss.com/docs/upgrade-guide#renamed-utilities)
```diff
- class="ring outline-none"
+ class="ring-3 outline-hidden"
```

3. **Custom classes**

Since Rapidez v3, we have made changes to use [default colors](https://docs.rapidez.io/3.x/theming.html#colors), so we can use classes like `bg`, `text`, or `border`. In Rapidez v5, we removed the colors from the `rapidez/core` and added them inside the [blade components](https://github.com/rapidez/blade-components/blob/master/resources/css/components/rapidez.css).

4. **Build**
```bash
yarn build
```

:::tip
We recommend to double check all changes that are made after the update.
:::

## Flat tables

This update gets rid of the dependency on the Magento flat tables. This means that they can be disabled entirely (both the product and category tables) in your magento configuration, which should speed up the indexing process in Magento substantially.

However, this also means that any and all custom queries, scopes, relationships, custom attributes, and model overwrites may need to be upgraded.

### Scopes

Any custom scopes added to product or category models that affect the SQL query directly (e.g. with a join) will need to be checked. In some cases they will need to be completely refactored (For example: see [this package update](https://github.com/rapidez/amasty-automatic-related-products/compare/4.0.0...5.0.0)).

### Relationships

Relationships that relate to `entity_id` (or also `sku` on the product model) will be unaffected.

### Attribute changes

The base product and category models now query the `catalog_product_entity` and `catalog_category_entity` tables. All of the attributes get added by using relations, which means you won't have direct access to attribute data in queries anymore. We have created a `whereAttribute` helper for this. For example:

```diff
-Product::where('color', 'red')->get();
+Product::whereAttribute('color', 'red')->get();
```

The way you retrieve attribute values from a product or category model has also changed somewhat. Where previously you would retrieve values directly from the object, you should now use one of the `->label()`, `->value()`, and `->raw()` functions. For product specifications, updating this may look something like:

```diff
-<dd>{{ $product->climate }}</dd>
+<dd>{{ $product->label('climate') }}</dd>
```

Note that the `->value()` function will be used by default, which will return the actual value as given in the database. This means that text attributes and numeric attributes will usually not need to be updated. For example, `$product->name` doesn't need to be changed. This change should only be relevant for attributes where the displayed value comes from the `eav_attribute_option_value` table.

### Overwrites

If you've overwritten any model classes that relate to products/categories or the `ProductController` class: these files have changed significantly. You should migrate these carefully by looking at the full diff of these models.

Frontend overwrites will also need to be checked individually. You should look at the diff linked at the start of this page.

## Other changes

### Variables on the product model

These specific variables have been removed and should be replaced like so:

| Variable | Replacement | Extra info |
|---|---|---|
| `->min_sale_qty` | `->stock->min_sale_qty` | |
| `->max_sale_qty` | `->stock->max_sale_qty` | |
| `->qty_increments` | `->stock->qty_increments` | |
| `->in_stock` | `->stock->is_in_stock` | |
| `->upsell_ids` | `->upsells()->pluck('linked_product_id')` | Depending on the situation, using `->upsells->pluck('linked_product_id')` may be more fitting. |
| `->relation_ids` | `->relationProducts()->pluck('linked_product_id')` | Same as above |
| `->grouped` | `->children` | These returned the same list already, this is just for simplicity. |
| `->images` | `->media` | This is no longer an array of image urls, but with an 'image' key. | 
| `->reviews_count` | `->reviewSummary->reviews_count` | |
| `->reviews_score` | `->reviewSummary->reviews_score` | |

Also check these values in javascript syntax (instead of `->` checking `.`).

### Translation strings

A few translations strings have been changed and added:

| Old | New |
|---|---|
| Firstname | First name |
| Middlename | Middle name |
| Lastname | Last name |
| Housenumber | House number |

| Added |
|---|
| Show more |

Translation files, as well as usage of these translations, should be changed accordingly.

## Using AI?

::: details Using AI? This prompt will give you a head start! Do still check everything manually.
This is a large prompt, we suggest using tools like [Chief](https://chiefloop.com/) to turn it into separate tasks so AI has a smaller chance of making mistakes.
`````markdown
# Rapidez v5 Upgrade Prompt

You are an expert Laravel, Magento, Vue, and Tailwind developer tasked with upgrading a Rapidez project to v5.

Use this as a strict migration checklist and implementation guide. Favor concrete code changes over high-level advice.

## Goal

Upgrade a Rapidez project to v5, including:

- Vue 2 to Vue 3 migration
- Tailwind CSS v4 migration
- Flat table removal compatibility updates
- Product model API changes
- Translation string updates

## Important Context

- Rapidez v5 removes dependency on Magento flat tables
- Rapidez v5 uses Vue 3
- Rapidez v5 uses Tailwind CSS 4
- All overwritten Blade, Vue, and PHP files must be reviewed
- Review template/config diff: https://github.com/rapidez/core/compare/4.x..master
- Review full releases/changelog (for 5.x versions): https://github.com/rapidez/core/releases

## 1. Dependency Upgrade Sequence

### 1.1 Composer dependencies

Run and evaluate all incompatible packages:

```bash
composer outdated
```

### 1.2 Frontend dependencies for Vue 3

Remove Vue 2 packages:

```bash
yarn remove @vitejs/plugin-vue2 vue-clickaway vue2-teleport vue-template-compiler
```

Install Vue 3 packages:

```bash
yarn add -D @vitejs/plugin-vue vue3-click-away
```

Upgrade related frontend dependencies:

```bash
yarn add -D @vueuse/core @vueuse/integrations cross-env instantsearch.js laravel-vite-plugin vite vue
```

## 2. Vite Configuration Changes

Update `vite.config.js` for Vue 3 and Tailwind v4.

```diff
  import path from 'path'
  import { defineConfig } from 'vite'
  import laravel from 'laravel-vite-plugin'
- import vue from '@vitejs/plugin-vue2'
+ import vue from '@vitejs/plugin-vue'
+ import tailwindcss from '@tailwindcss/vite'
  import { visualizer } from 'rollup-plugin-visualizer'

  export default defineConfig({
      plugins: [
+         tailwindcss(),
          laravel({
              input: [...],
              refresh: true,
          }),
          vue(),
      ],
      resolve: {
          alias: {
              '@': path.resolve(__dirname, './resources/js'),
              Vendor: path.resolve(__dirname, './vendor'),
-             vue: path.resolve(__dirname, './node_modules/vue/dist/vue.esm.js'),
+             vue: 'vue/dist/vue.esm-bundler.js',
          },
      },
  })
```

Install Tailwind Vite plugin:

```bash
yarn add -D @tailwindcss/vite
```

## 3. Vue 2 to Vue 3 Migration Rules

Apply these across all Blade and Vue customizations.

### 3.1 Slots: `slot-scope` to `v-slot`

```vue
<!-- Vue 2 -->
<graphql query="...">
    <div slot-scope="{ data, loading }">
        <!-- content -->
    </div>
</graphql>

<!-- Vue 3 -->
<graphql query="..." v-slot="{ data, loading }">
    <div>
        <!-- content -->
    </div>
</graphql>
```

If a `<template>` tag is used, keep `v-slot` on that template:

```vue
<!-- Vue 2 -->
<component>
    <template slot-scope="{ data }">
        <!-- content -->
    </template>
</component>

<!-- Vue 3 -->
<component>
    <template v-slot="{ data }">
        <!-- content -->
    </template>
</component>
```

### 3.2 Filters are removed

```blade
{{-- Vue 2 (invalid in Vue 3) --}}
@{{ final_price | price }}
@{{ product.url | url }}

{{-- Vue 3 --}}
@{{ price(final_price) }}
@{{ url(product.url) }}
```

Also replace `truncate` filter usage with a helper/function call.

### 3.3 Event bus migration

Global Vue instance events are removed.

```javascript
// Vue 2
this.$root.$on('event-name', handler)
window.app.$on('event-name', handler)

// Vue 3 in Rapidez
window.$on('event-name', handler)
window.$emit('event-name', payload)
```

Recommended convention for custom events:

- Prefix custom events with `rapidez:`
- Example: `rapidez:cart-updated`

### 3.4 Global properties and refs

```javascript
// Vue 2
window.app.cart
this.cart

// Vue 3
window.app.config.globalProperties.cart
this.cart.value
```

In JS functions, refs must use `.value` (for example `cart.value`, `user.value`, `token.value`, `mask.value`, `loading.value`).

### 3.5 Async components

```javascript
// Vue 2
() => import('./MyComponent.vue')

// Vue 3
import { defineAsyncComponent } from 'vue'
defineAsyncComponent(() => import('./MyComponent.vue'))
```

### 3.6 Remove `Vue.set`

```javascript
// Vue 2
Vue.set(this.object, key, value)

// Vue 3
this.object[key] = value
```

### 3.7 `v-if` and `v-for` precedence changed

`v-if` now has higher precedence than `v-for`.

```vue
<!-- risky pattern -->
<div v-for="item in items" v-if="item.active">

<!-- safer Vue 3 pattern -->
<template v-for="item in items" :key="item.id">
    <div v-if="item.active">
        ...
    </div>
</template>
```

### 3.8 Render functions and slots

```javascript
// Vue 2
render() {
    return this.$scopedSlots.default(this)
}

// Vue 3
render() {
    return this?.$slots?.default(this)
}
```

### 3.9 `v-text` and `v-html` with fallback content

If elements with `v-text` or `v-html` contain inner fallback content, replace with `v-txt` and `v-htm` patterns used by Rapidez migration tooling.

```vue
<!-- before -->
<div v-text="scopeProps.value">Default value</div>

<!-- after -->
<div v-txt="scopeProps.value">Default value</div>
```

```vue
<!-- before -->
<div v-html="scopeProps.value">Default value</div>

<!-- after -->
<div v-htm="scopeProps.value">Default value</div>
```

### 3.10 Component emits and v-model

For components that emit events, add explicit `emits` declarations and migrate `value` props to `modelValue` where applicable.

```javascript
export default {
    props: {
        modelValue: {
            default: 1,
        },
    },
    emits: ['update:modelValue', 'input', 'change'],
    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value)
            },
        },
    },
}
```

# 3.11 Check blade components

On any blade component (`<x-*>`) it is no longer possible to add `v-*` attributes without value and must be replaced with empty values `v-*=""`.
For example attributes like `<x-heroicon-o-chevron-down v-else />` must be changed to `<x-heroicon-o-chevron-down v-else="" />`.

# 3.12 Check the migration docs

When in doubt view the [Vue 3 migration guide](https://v3-migration.vuejs.org/)

## 4. Tailwind CSS v4 Migration

Run official upgrade tool:

```bash
npx @tailwindcss/upgrade
```

Then manually review deprecated and renamed utility classes.

Examples:

```diff
- class="bg-black bg-opacity-50 flex-shrink-0"
+ class="bg-black/50 shrink-0"
```

```diff
- class="ring outline-none"
+ class="ring-3 outline-hidden"
```

Also verify custom color classes. Rapidez v5 moved colors out of core and into blade components CSS.

Verify all steps from https://tailwindcss.com/docs/upgrade-guide have been executed and run any other checks that need to be done.

## 5. Flat Table Removal Migration

Rapidez v5 queries `catalog_product_entity` and `catalog_category_entity` directly through attribute relations.
Compare the `./config/rapidez/*.php` with `./vendor/rapidez/*/config/rapidez/*.php` and add any missing entries in the overwritten config files.

### 5.1 Query constraints on attributes

Direct `where` on EAV attributes may no longer work in custom scopes.

```php
// before
Product::where('color', 'red')->get();

// after
Product::whereAttribute('color', 'red')->get();
```

### 5.2 Attribute value access

Use `label()`, `value()`, and `raw()` when needed.

```php
// before
$product->climate

// after (for option labels)
$product->label('climate')
```

Keep simple text/number attributes as-is if they map correctly via default `value()` behavior.

### 5.3 Scopes and relationships

- Revisit custom scopes that used joins against flat tables
- Relationships on `entity_id` (and `sku` on products) are generally unaffected
- Carefully review all product/category model overrides and any `ProductController` overrides

## 6. Product Model API Replacements

Replace removed product properties with new equivalents:

| Removed | Replacement |
|---|---|
| `->min_sale_qty` | `->stock->min_sale_qty` |
| `->max_sale_qty` | `->stock->max_sale_qty` |
| `->qty_increments` | `->stock->qty_increments` |
| `->in_stock` | `->stock->is_in_stock` |
| `->upsell_ids` | `->upsells()->pluck('linked_product_id')` |
| `->relation_ids` | `->relationProducts()->pluck('linked_product_id')` |
| `->grouped` | `->children` |
| `->images` | `->media` |
| `->reviews_count` | `->reviewSummary->reviews_count` |
| `->reviews_score` | `->reviewSummary->reviews_score` |

Note: `->media` is not the old plain URL array shape and now includes richer media data (including video support).

## 7. Translation String Updates

Update both translation files and template usage:

| Old | New |
|---|---|
| Firstname | First name |
| Middlename | Middle name |
| Lastname | Last name |
| Housenumber | House number |

Also add:

- `Show more`

## 8. Validation and Build Checklist

Run and fix issues iteratively:

```bash
yarn outdated
yarn build
```

Manual validation checklist:

1. Verify all overridden Blade/Vue/PHP files against v5 core diff
2. Test custom events migrated to `window.$on`/`window.$emit`
3. Verify all ref access in JS uses `.value`
4. Check all migrated slots render correctly
5. Verify Tailwind class updates and custom theme behavior
6. Test product/category custom queries and scopes
7. Verify media rendering (images and videos)
8. Validate pricing (including customer group and tier pricing)
9. Run checkout and cart interaction smoke tests

## 9. Execution Rules for the AI

When performing the migration:

1. Make minimal, targeted changes
2. Preserve project-specific conventions
3. Prefer mechanical, auditable diffs
4. Flag uncertainty explicitly (do not silently guess)
5. Always provide a final list of changed files and why each was changed
6. After code edits, provide a focused manual QA checklist based on touched areas

## 10. Refinement

### Blade overrides

Compare the resources/views/vendor folder with their vendor/rapidez/*/resources/views counterparts.
And place a comment at the top of the blade files we have overwritten describing what has been overwritten.
`````
:::
