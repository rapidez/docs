# Upgrading

---

[[toc]]

## Rapidez v5

In this release, we removed the flat tables dependency! 🚀 And we also updated to Vue 3 and Tailwind 4 🤘🏻 We also added support for:
- [Customer group pricing](https://github.com/rapidez/core/pull/1074)
- [Product media videos](https://github.com/rapidez/core/pull/1128)

Other changes included in this release:
- [Drop support for Laravel 11](https://github.com/rapidez/core/pull/1096)

Some of these are quite substantially breaking changes. On this page we'll mention the most important things that you will need to do to upgrade.

You should review [all template/config changes](https://github.com/rapidez/core/compare/4.x..master)

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

3. **Upgrade the other dependencies**

```bash
yarn add -D @vueuse/core @vueuse/integrations cross-env instantsearch.js laravel-vite-plugin vite vue
```

4. **Upgrade your scripts and templates**

This will require some work but we've got a list of things to check. Please read the [Vue 3 migration guide](https://v3-migration.vuejs.org/). Some recurring themes we've run into:

- [Dropped support for global $emit and $on](https://v3-migration.vuejs.org/breaking-changes/events-api#event-bus), For this we've [built a system on regular events](https://github.com/rapidez/core/blob/cecc136e5ef76dc4925186a332f875d3ffe658fe/resources/js/polyfills/emit.js#L18). You should replace `$root.$on`/`window.app.$on` with `window.$on`.
- Check for any `v-if`s in combination with `v-for`, see: [If used on the same element, v-if will have higher precedence than v-for](https://v3-migration.vuejs.org/breaking-changes/v-if-v-for.html)
- Rename all `slot-scope` to `v-slot` and move them to the component in your template
- The `price`, `truncate` and `url` filters no longer work, replace <span v-pre>`@{{ final_price | price }}` with `@{{ price(final_price) }}`</span>
- Any custom async components must be wrapped by `defineAsyncComponent`: `() => import('...')` to `defineAsyncComponent(() => import('...'))`
- `window.app` no longer contains the custom variables. Replace `window.app.<...>` e.g. `cart`  with `window.app.config.globalProperties.<...>` or if you’re within vue templates directly do `<...>`
- When inside js functions all computed (refs) must be retrieved with `.value`. Examples are: `cart.value`, `user.value`, `token.value`
- All calls to `Vue.set` calls should be removed, and replaced by setting the variable directly.

::: details Using AI? This prompt will give you a head start! Do still check everything manually.
`````markdown
# Vue 2 to Vue 3 Upgrade Prompt for Rapidez Projects

You are an expert Vue.js developer tasked with upgrading a Vue 2 project that uses the Rapidez core package to Vue 3. The Rapidez core package has already been updated to Vue 3, so you can leverage its existing infrastructure.

## Prerequisites

Ensure the Rapidez core package is updated to the Vue 3 compatible version before proceeding.

## 1. Template Syntax Updates

### Update Slot Syntax:
```vue
<!-- Vue 2 -->
<component>
    <div slot-scope="{ data, loading }">
        <!-- content -->
    </div>
</component>
<!-- Vue 3 -->
<component v-slot="{ data, loading }">
    <div>
        <!-- content -->
    </div>
</component>
```

### Update Scoped Slots:
```vue
<!-- Vue 2 -->
<my-component>
    <div slot-scope="scopeProps">
        {{ scopeProps.value }}
    </div>
</my-component>
<!-- Vue 3 -->
<my-component v-slot="scopeProps">
    <div>
        {{ scopeProps.value }}
    </div>
</my-component>
```

Do not forget to move the v-slot onto the vue component, do not leave them on the slots (divs)

But be careful with <template> tags, because the v-slot will have to stay in the same location:

```vue
<!-- Vue 2 -->
<component>
    <template slot-scope="{ data, loading }">
        <!-- content -->
    </template>
</component>
<!-- Vue 3 -->
<component>
    <template v-slot="{ data, loading }">
        <!-- content -->
    </template>
</component>
````

### Update render functions:
```vue
<!-- Vue 2 -->
render() {
    return this.$scopedSlots.default(this)
},
<!-- Vue 3 -->
render() {
    return this?.$slots?.default(this)
},
```

### Update v-text and v-html directive calls
v-text and v-html no longer support values inside of the element having v-text or v-html as props.
When an element with v-text or v-html has values inside of the element they should be replaced by v-txt and v-htm
```vue
<!-- Vue 2 -->
<my-component v-slot="scopeProps">
    <div v-text="scopeProps.value">
        Default value
    </div>
</my-component>
<!-- Vue 3 -->
<my-component v-slot="scopeProps">
    <div v-txt="scopeProps.value">
        Default value
    </div>
</my-component>
```

```vue
<!-- Vue 2 -->
<my-component v-slot="scopeProps">
    <div v-html="scopeProps.value">
        Default value
    </div>
</my-component>
<!-- Vue 3 -->
<my-component v-slot="scopeProps">
    <div v-htm="scopeProps.value">
        Default value
    </div>
</my-component>
```

## 2. Event System Migration

The Rapidez core provides `window.$emit` and `window.$on` functions. Replace Vue instance event calls:

```javascript
// Vue 2
this.$root.$emit('event-name', data)
this.$root.$on('event-name', handler)
// Vue 3 (using Rapidez core event system)
window.$emit('rapidez:event-name', data)
window.$on('rapidez:event-name', handler)
```

### Event Naming Convention:
- Prefix custom events with `rapidez:` for consistency
- Example: `rapidez:cart-updated`, `rapidez:user-login`, `rapidez:notification-message`

## 3. Component Property Access Updates

### Global Properties:
```javascript
// Vue 2
this.$root.property
this.loggedIn
// Vue 3
window.app.config.globalProperties.property
window.app.config.globalProperties.loggedIn.value
```

### Reactive References:
```javascript
// Vue 2
this.cart
this.user
// Vue 3 (accessing reactive refs)
this.cart.value
this.user.value
```

## 4. Component Instance and Element Access

### Element References:
```vue
<!-- Add ref attribute to root elements -->
<template>
    <div ref="root">
        <!-- content -->
    </div>
</template>
```

```javascript
// Vue 2
this.$el.querySelector(...)
// Vue 3
this.$refs.root.querySelector(...)
// or
this.$el.nextSibling.querySelector(...) // for render functions
```

### Component Instance Access:
```javascript
// Vue 2
element.__vue__
// Vue 3
element.__vnode.props
element.__vnode.ctx
```

## 5. Props and Emits Updates

### v-model Updates:
```javascript
// Vue 2
props: {
    value: {
        default: 1,
    },
},
// Vue 3
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
        }
    }
}
```

### Add emits option to components:
```javascript
// Vue 3 - Required for components that emit events
export default {
    emits: ['change', 'input', 'click', 'custom-event'],
    // ... rest of component
}
```

## 6. Form Handling Updates

### Partial Submit Pattern:
```vue
<!-- Vue 2 -->
<fieldset partial-submit="methodName">
<!-- Vue 3 -->
<fieldset partial-submit v-on:partial-submit="(ev) => methodName().then(ev.detail.resolve).catch(ev.detail.reject)">
```

## 7. Reactive Data Updates

### Direct Property Assignment:
```javascript
// Vue 2
Vue.set(this.object, key, value)
// Vue 3 (direct assignment works)
this.object[key] = value
```

## 8. Filter Usage Migration

Filters are removed in Vue 3. Replace with method calls or computed properties:

```vue
<!-- Vue 2 -->
{{ value | price }}
{{ url | url }}
<!-- Vue 3 -->
{{ window.price(value) }}
{{ window.url(url) }}
```

## 9. Component Registration

Use the Vue 3 event system for component registration:

```javascript
// Listen for vue:loaded event
document.addEventListener('vue:loaded', function (event) {
    const vue = event.detail.vue
    vue.component('my-component', MyComponent)
})
```

## 10. Lifecycle and Watchers

### Event Listeners with VueUse:
```javascript
// Import useEventListener from @vueuse/core
import { useEventListener } from '@vueuse/core'
// In mounted/setup
useEventListener(this.$refs.element, 'event', handler)
```

## 11. Common Patterns to Update

### GraphQL Components:
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

Do not forget to move the v-slot onto the vue component, do not leave them on the slots (divs)

### Conditional Rendering:
```vue
<!-- Ensure v-if, v-else work with proper template structure -->
<template v-if="condition">
    <!-- content -->
</template>
```

## 12. Testing and Validation

After making changes:

1. **Test Event Communication**: Verify all custom events work with the new `window.$emit`/`window.$on` system
2. **Check Reactive Data**: Ensure `.value` is used where needed for reactive references
3. **Validate Form Submissions**: Test partial-submit patterns work correctly
4. **Verify Component Communication**: Check parent-child component data flow
5. **Test Third-party Integrations**: Ensure external libraries still work correctly

## 13. Common Gotchas for Rapidez Projects

1. **Cart and User Data**: These are reactive refs, access with `.value`
2. **Global Properties**: Access through `window.app.config.globalProperties`
3. **Slot Props**: May need destructuring in v-slot
4. **Element Queries**: Use `nextSibling` in render functions or add `ref` attributes

## 14. Rapidez-Specific Patterns

### Checkout Steps:
```vue
<!-- Update form submissions -->
<form v-on:submit.prevent="(e) => {
    window.app.config.globalProperties.submitPartials(e.target?.form ?? e.target)
        .then(() => window.$emit('checkout-step-completed'))
}">
```

### Cart Operations:
```javascript
// Access cart data
this.cart.value.items
this.hasCart.value
// Emit cart events
window.$emit('cart-updated', { cart: this.cart })
```

This focused approach leverages the Rapidez core infrastructure while updating your project-specific components to be Vue 3 compatible.
`````
:::

5. **Build**
```bash
yarn build
```

:::tip
We recommend to double check all frontend dependencies with `yarn outdated`.
:::

## Flat tables

This update gets rid of the dependency on the Magento flat tables. This means that they can be disabled entirely (both the product and category tables) in your magento configuration, which should speed up the indexing process in magento substantially.

However, this also means that any and all custom queries, scopes, relationships, custom attributes, and model overwrites may need to be upgraded.

### Scopes

Any custom scopes added to product or category models that affect the SQL query directly (e.g. with a join) will need to be checked. In some cases they will need to be completely refactored (For example: see [this package update](https://github.com/rapidez/amasty-automatic-related-products/compare/4.0.0...5.0.0)).

### Relationships

Relationships that relate to `entity_id` (or also `sku` on the Product model) will be unaffected.

### Attribute changes

The base Product and Category models now query the `catalog_product_entity` and `catalog_category_entity` tables. All of the attributes get added by using relations, which means you won't have direct access to attribute data in queries anymore. We have created a `whereAttribute` helper for this. For example:

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

If you've overwritten any model classes that relate to products/categories or the ProductController class: these files have changed significantly. You should migrate these carefully by looking at the full diff of these models.

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
