# Upgrading

---

[[toc]]

## Rapidez v3

In this release, we [refactored the checkout](#checkout-changes) from the Magento API to **GraphQL**! 🚨 And with that 🥁, we added a [one-step checkout](#onestep-checkout) option! 🚀 Furthermore:

- Dropped support for Magento 2.4.6, Laravel 10, and PHP 8.1
- [Improved the install command](https://github.com/rapidez/core/pull/586)
- [Active filters will be visible](https://github.com/rapidez/core/pull/587)
- [HTTP/3 Early Hints support](https://github.com/rapidez/core/pull/644)

And a lot of frontend changes:

- [Extracted and refactored components](#components)
- [Product gallery](https://github.com/rapidez/core/pull/624)
- [Autocomplete](https://github.com/rapidez/core/pull/670)
- [Quantity input](https://github.com/rapidez/core/pull/645)
- [Color names](#colors)
- [Named z-indexes](#z-indexes)

You should review [all template/config changes](https://github.com/rapidez/core/compare/2.x..master)

> [!NOTE]
> If you use Statamic and haven't already updated to Statamic 5.x and `rapidez/statamic` 5.x with hybrid Runway, this upgrade now requires it. See [this upgrade guide](packages/statamic.md#from-4-x-to-5-x).

## Composer dependencies

First, follow the [Laravel 11 upgrade guide](https://laravel.com/docs/11.x/upgrade) and check all your dependencies one by one to see if they're compatible and what has changed in changelogs / release notes.
```bash
composer outdated
```

### Laravel 11

With Laravel 11, a new application structure was introduced. Laravel doesn't recommend upgrading to the new structure, but since we are using the `redirectUsing()` within our new `MagentoCartTokenGuard`, you have to make 1 change; remove the `redirectTo()` method from `app/Http/Middleware/Authenticate.php`:
```php
<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /** // [!code --]
     * Get the path the user should be redirected to when they are not authenticated. // [!code --]
     */ // [!code --]
    protected function redirectTo(Request $request): ?string // [!code --]
    { // [!code --]
        return $request->expectsJson() ? null : route('login'); // [!code --]
    } // [!code --]
    //// [!code ++]
}
```

## Frontend changes

### Dependencies

1. **Install**
```bash
yarn add -D @vueuse/integrations graphql graphql-tag universal-cookie "graphql-combine-query@indykoning/graphql-combine-query#feature/add-allowed-duplicates"
```
2. **Build**
```bash
yarn build
```

:::tip
We recommend to double check all frontend dependencies with `yarn outdated`. But keep in mind that Rapidez doesn't support Vue 3 yet.
:::


### Event changes

If you need to interact with the current Vue instance, do not use `turbo:load`. Instead, use `vue:loaded` to ensure Vue has actually been booted.

### GraphQL component

The `check` property on the GraphQL component has been changed from a string that gets evaluated to a function. This means that you will have to update each (normal) usage:

```blade
<graphql ... check="[...]"> // [!code --]
<graphql ... check="(data) => data.[...]"> // [!code ++]
```

### Colors

The colors got new names, see the [color docs](theming.md#colors). You could upgrade to those new classes by replacing them in overwritten and custom Blade templates; have a look at the [color names refactor PR](https://github.com/rapidez/core/pull/622) for examples. An easier approach is to merge those new colors with your existing colors in the `tailwind.config.js`. That way your existing and new colors work.

### Z-indexes

The `rapidez.frontend.z-indexes` config has been removed with the [named z-indexes refactor](https://github.com/rapidez/core/pull/625). The z-index names are not defined within the [`tailwind.config.js`](https://github.com/rapidez/core/blob/master/tailwind.config.js). Most likely you've published the `config/rapidez/frontend.php` file so nothing will break there. You only have to add the new `zIndex` options from the [`tailwind.config.js`](https://github.com/rapidez/core/blob/master/tailwind.config.js) into your project Tailwind config. We recommend replacing all the `rapidez.frontend.z-indexes` usage with the Tailwind z-index names.

### Components

Within Rapidez we used to have multiple components for inputs, buttons, etc within the core. Most of them have been extracted to a separated package: [rapidez/blade-components](https://github.com/rapidez/blade-components). The migration to those new components within the core can be found [here](https://github.com/rapidez/core/pull/667). We recommend migrating everything to those new components. Check out the [readme](https://github.com/rapidez/blade-components) and [demo](https://rapidez.github.io/blade-components/demo/components.html).

## Checkout changes

Everything has been migrated to use the GraphQL components for queries and mutations. On those components, callbacks are used to process the data. So any changes made in an overwritten `checkout.vue` file and any checkout views should be reviewed. Have a look at the [GraphQL checkout PR](https://github.com/rapidez/core/pull/503) for all changes.

The opinionated checkout options ([checkout-theme](https://github.com/rapidez/checkout-theme) and [confira](https://github.com/rapidez/confira)) have already been made compatible with Rapidez v3. No [onestep](#onestep-checkout) there, because they are multi step checkouts by design.

::: tip
The fastest option is to remove all checkout customizations and reimplement them within the new checkout, as a lot has been changed! 
:::

### Routing

We moved everything to Laravel routes where previously this was handled with custom JavaScript. The benefit of this is that every checkout step will go through PHP where we can add/check any data, just like everything else within Rapidez. So `/checkout#credentials` becomes `/checkout/credentials`. With that, we introduced authentication providers which can be used as middleware on routes:

- `auth:magento-customer`
- `auth:magento-cart`

With these routes, you can "secure" them where previously this was checked on the frontend. When unauthorized, you were redirected away after the page load. This is now handled server-side. All checkout steps are secured with the `auth:magento-cart` middleware by default to validate the cart mask. To make this possible, the mask and customer token are moved from LocalStorage to Cookies.

### Onestep checkout

In the `config/rapidez/frontend.php` config there is a `checkout_steps` option. Those steps link to Blade views within the `resources/views/checkout/pages` directory. To use the one step checkout just swap the default with the [`onestep`](https://github.com/rapidez/core/blob/master/resources/views/checkout/pages/onestep.blade.php) view:

```php
'checkout_steps' => [
    'default' => ['login', 'credentials', 'payment'], // [!code --]
    'default' => ['onestep'], // [!code ++]
],
```

## Magento configuration

- [Enable Guest Checkout Login](configuration.md#enable-guest-checkout-login)

## Using AI?

::: details Using AI? This prompt will give you a head start! Do still check everything manually.
`````markdown
# Rapidez v3 Upgrade Guide

You are a Laravel and Vue expert, use these instructions to upgrade a Rapidez project from V2 to V3

---

## Table of Contents

1. [Checkout — Complete Rewrite](#1-checkout--complete-rewrite)
2. [GraphQL Cart Query → Fragment](#2-graphql-cart-query--fragment)
3. [Vue Component Renames & Removals](#3-vue-component-renames--removals)
4. [Blade Component Renames & Removals](#4-blade-component-renames--removals)
5. [Events Reference](#5-events-reference)
6. [Vue Root Data Changes](#6-vue-root-data-changes)
7. [Store & Authentication Changes](#7-store--authentication-changes)
8. [InteractWithUser Mixin Removed](#8-interactwithuser-mixin-removed)
9. [Product Images — `media` Removed](#9-product-images--media-removed)
10. [JavaScript API Changes](#10-javascript-api-changes)
11. [Address Defaults — field rename](#11-address-defaults--field-rename)
12. [Global Utility Functions](#12-global-utility-functions)
13. [Frontend Build Configuration](#13-frontend-build-configuration)

---

## 1. Checkout — Complete Rewrite

The biggest breaking change. The entire checkout has been redesigned from a single-page step-based view into separate URL-based pages.

### Removed files
| Removed | Replacement |
|---|---|
| `resources/views/checkout/overview.blade.php` | Multiple page views (see below) |
| `resources/views/checkout/steps/credentials.blade.php` | `resources/views/checkout/pages/credentials.blade.php` |
| `resources/views/checkout/steps/payment.blade.php` | `resources/views/checkout/pages/payment.blade.php` |
| `resources/js/components/Checkout/Checkout.vue` | No Vue component — logic is in blade/GraphQL mutations |
| `resources/js/components/Checkout/Login.vue` | `resources/js/components/Checkout/CheckoutLogin.vue` |

### New checkout page views
```
resources/views/checkout/pages/login.blade.php
resources/views/checkout/pages/credentials.blade.php
resources/views/checkout/pages/payment.blade.php
resources/views/checkout/pages/success.blade.php
resources/views/checkout/pages/onestep.blade.php   ← for one-step checkouts
```

### New checkout step partials
```
resources/views/checkout/steps/shipping_address.blade.php
resources/views/checkout/steps/billing_address.blade.php
resources/views/checkout/steps/shipping_method.blade.php
resources/views/checkout/steps/payment_method.blade.php
resources/views/checkout/steps/place_order.blade.php
resources/views/checkout/steps/agreements.blade.php
```

### Route change

The routes are no longer in this format `/checkout#credentials`
But are in the format of `/checkout/credentials` instead

### Checkout steps are now URL-driven
Steps navigate via `window.Turbo.visit(window.url('/checkout/' + 'payment'))`.

Progress is tracked via `$currentStepKey` and `$currentStep` PHP variables available in all checkout page views.

### `$root.checkout` object removed
The entire `checkout` object (`step`, `totals`, `shipping_address`, `billing_address`, `hide_billing`, `shipping_method`, `payment_method`, `agreement_ids`, `create_account`, `doNotGoToTheNextStep`) has been removed from the Vue root.

Address data is now sourced directly from the cart GraphQL response:
```js
// v2
this.$root.checkout.shipping_address.firstname
this.$root.checkout.hide_billing

// v3
cart.value.shipping_addresses[0].firstname
cart.value.billing_address.same_as_shipping   // boolean, set automatically
```

### Form submission via `submitPartials`
Checkout forms use `partial-submit="mutate"` attributes on GraphQL mutation wrappers, and submit via a new helper:
```html
<form v-on:submit.prevent="(e) => {
    submitPartials(e.target)
        .then(() => window.Turbo.visit(...))
        .catch()
}">
```
`submitPartials(form, sequential = false)` finds all `[partial-submit]` elements and calls their named method. It throws if any returns `false`.

### `<checkout-login>` replaces `<login>` in checkout
```html
<!-- v2 -->
<login v-slot="{ email, password, go, loginInputChange, emailAvailable }">

<!-- v3 -->
<checkout-login v-slot="checkoutLogin">
    <!-- checkoutLogin.email, checkoutLogin.password, checkoutLogin.go(),
         checkoutLogin.isEmailAvailable, checkoutLogin.createAccount,
         checkoutLogin.firstname, checkoutLogin.lastname -->
```

The `<login>` component now maps to `User/Login.vue` (standalone login page), not checkout login.

### `<checkout-success>` changes
The component no longer accepts `token` or `mask` props. It reads order data from the new `useOrder` store:
```html
<!-- v3 slot scope -->
<checkout-success>
    <template slot-scope="{ order, refreshOrder, hideBilling }">
```
Order structure changed (GraphQL `CustomerOrder` / `orderV2`):
```js
// v2
order.customer_email
order.sales_order_addresses     // array with address_type
order.sales_order_items         // array
order.sales_order_payments      // array
order.shipping_description

// v3
order.email
order.billing_address           // direct object
order.shipping_address          // direct object
order.items                     // array with product, quantity_ordered, etc.
order.payment_methods           // array with name, type, additional_data
order.shipping_method
order.status
order.number
order.token
```

### Payment provider integration changed
Old `checkout-payment-saved` / `before-checkout-payment-saved` events are replaced with a handler pattern:

```js
// v3 — register a before-place-order handler
import { addBeforePlaceOrderHandler } from '../../stores/usePaymentHandlers'
import { addBeforePaymentMethodHandler } from '../../stores/usePaymentHandlers'
import { addAfterPlaceOrderHandler } from '../../stores/usePaymentHandlers'

// Each handler receives (query, variables, options) and must return [query, variables, options]
addBeforePlaceOrderHandler(async (query, variables, options) => {
    // modify or inspect before placing order
    return [query, variables, options]
})

// After place order — receives the full GraphQL response and the mutation component instance
addAfterPlaceOrderHandler(async (response, mutationComponent) => {
    // redirect is available as mutationComponent.redirect
    mutationComponent.redirect = '/custom-success'
})
```

---

## 2. GraphQL Cart Query → Fragment

**All** cart GraphQL queries now use a named fragment instead of inline fields.

```js
// v2
'query getCart($cart_id: String!) { cart (cart_id: $cart_id) { ' + config.queries.cart + ' } }'

// v3
'query getCart($cart_id: String!) { cart (cart_id: $cart_id) { ...cart } } ' + config.fragments.cart
```

| v2 | v3 |
|---|---|
| `config.queries.cart` | `config.fragments.cart` (GraphQL fragment string) |
| — | `config.fragments.order` |
| — | `config.fragments.orderV2` |

The old `resources/views/cart/queries/cart.graphql` is replaced by `resources/views/cart/queries/fragments/cart.graphql`.

The cart fragment now includes:
- `is_virtual` field (useful to skip shipping steps)
- `email` field
- Full `shipping_addresses` (including `available_shipping_methods`, `uid`, all address fields)
- Full `billing_address`
- `selected_payment_method`
- `available_payment_methods`

**Pre-built checkout queries** are now in `config.queries`:
```js
config.queries.setGuestEmailOnCart
config.queries.setNewShippingAddressesOnCart
config.queries.setExistingShippingAddressesOnCart
config.queries.setNewBillingAddressOnCart
config.queries.setExistingBillingAddressOnCart
config.queries.setShippingMethodsOnCart
config.queries.setPaymentMethodOnCart
config.queries.placeOrder
config.queries.customer
```

---

## 3. Vue Component Renames & Removals

| v2 Component | v3 Component | Notes |
|---|---|---|
| `<login>` (checkout) | `<checkout-login>` | Checkout context only |
| `<login>` (account) | `<login>` → `User/Login.vue` | For account pages |
| `<checkout>` | *(removed)* | Logic moved to blade pages |
| — | `<quantity-select>` | New — wraps quantity input with +/- |
| — | `<selected-filters-values>` | New — renders active filter labels |
| — | `<teleport>` | New — `vue2-teleport` dependency |

### New `<graphql>` slot scope
```html
<!-- v2: slot-scope only had { data } -->
<!-- v3: variables are also exposed -->
<graphql :query="..." v-slot="{ data, variables }">
```

### `<graphql>` `check` prop: string → function
```html
<!-- v2 — eval string -->
:check="'products'"

<!-- v3 — function -->
:check="(data) => data?.products"
```

### `<graphql-mutation>` changes
- `mutating` slot prop **still works** (now a computed alias for `running`)
- New `running` slot prop (same value as `mutating`)
- New `group` prop — combine with other mutations in the same tick
- Now **throws** on error (so Promise chains can `.catch()`)

### `GlobalSlideover` / `GlobalSlideoverInstance` changes
- `content` prop **removed** from `GlobalSlideover`
- Content is now `<teleport>`'d into `#global-slideover-content`
- `isCurrentSlideover` boolean added to the slot scope

```html
<!-- v2 -->
<global-slideover content="<p>Hello</p>" title="My slideover" v-slot="slideover">

<!-- v3 -->
<global-slideover title="My slideover" v-slot="slideover">
    <div class="hidden">
        <teleport to="#global-slideover-content" :disabled="!slideover.isCurrentSlideover">
            <p>Hello</p>
        </teleport>
    </div>
    <!-- trigger button -->
</global-slideover>
```

The Blade wrapper `<x-rapidez::slideover.global>` handles this automatically.

### `<images>` slot scope — `media` removed
```html
<!-- v2 -->
<images v-slot="{ media, active, zoomed, toggleZoom, change }">

<!-- v3 -->
<images v-slot="{ images, active, zoomed, toggleZoom, change }">
```
`media` (array of `{ media_type, image, video_url }`) no longer exists. Only `images` (array of path strings).

---

## 4. Blade Component Renames & Removals

### Removed components

| Removed | Use instead |
|---|---|
| `<x-rapidez::button>` (index) | `<x-rapidez::button.outline>` or `<x-rapidez::button.conversion>` |
| `<x-rapidez::button.primary>` | `<x-rapidez::button.conversion>` |
| `<x-rapidez::button.outline>` | `<x-rapidez::button.outline>` *(new file, different styles)* |
| `<x-rapidez::button.slider>` | `<x-rapidez::button.slider>` *(new file, different styles)* |
| `<x-rapidez::checkbox>` | `<x-rapidez::input.checkbox>` |
| `<x-rapidez::radio>` | `<x-rapidez::input.radio>` |
| `<x-rapidez::select>` | `<x-rapidez::input.select>` |
| `<x-rapidez::input>` (with label) | `<label>` + `<x-rapidez::label>` + `<x-rapidez::input>` separately |
| `<x-rapidez::textarea>` | `<x-rapidez::input.textarea>` |
| `<x-rapidez::label>` | `<x-rapidez::label>` *(still exists, no change)* |
| `<x-rapidez::country-select>` | `<x-rapidez::input.select.country>` |
| `<x-rapidez::slideover>` (index) | *(removed — use `<x-rapidez::slideover.global>`)* |
| `<x-rapidez::slideover.mobile>` | *(removed)* |
| `<x-rapidez-ct::input>` | `<x-rapidez::input>` |
| `<x-rapidez-ct::input.country-select>` | `<x-rapidez::input.select.country>` |
| `<x-rapidez-ct::input.region-select>` | `<x-rapidez::input.select.region>` |

### `<x-rapidez::input>` label handling changed
In v2, `<x-rapidez::input name="foo" label="Bar">` rendered a `<label>` automatically.
In v3, the `label` prop is gone — wrap the input in a `<label>` manually:

```html
<!-- v2 -->
<x-rapidez::input name="email" label="Email" v-model="..." required />

<!-- v3 -->
<label>
    <x-rapidez::label>@lang('Email')</x-rapidez::label>
    <x-rapidez::input name="email" v-model="..." required />
</label>
```

Same applies to `<x-rapidez::select>` (now `<x-rapidez::input.select>`), `<x-rapidez::textarea>` etc.

### New components

| Component | Description |
|---|---|
| `<x-rapidez::quantity>` | +/- quantity input, replaces product quantity select |
| `<x-rapidez::input.password>` | Password with show/hide toggle |
| `<x-rapidez::input.select.country>` | Country dropdown (was `country-select`) |
| `<x-rapidez::input.select.region>` | New — region/state dropdown |
| `<x-rapidez::button.conversion>` | CTA style button (add to cart, checkout, place order) |
| `<x-rapidez::autocomplete.title>` | Title above autocomplete results |
| `<x-rapidez::autocomplete.magnifying-glass>` | Search icon in autocomplete |

### `<x-rapidez::slideover.global>` — usage change
The `content` attribute is gone. Use the `$slot` directly:

```html
<!-- v2 -->
<x-rapidez::slideover.global :title="__('Filter')" content="<div>...</div>">
    <x-slot:label>Click me</x-slot:label>
</x-rapidez::slideover.global>

<!-- v3 -->
<x-rapidez::slideover.global title="Filter">
    <x-slot:label>Click me</x-slot:label>
    <div>...</div>
</x-rapidez::slideover.global>
```

### `<x-rapidez::button.cart>` change
Now uses `<x-rapidez::button.conversion>` internally instead of `<x-rapidez::button>`.

---

## 5. Events Reference

### Custom DOM Events (dispatched on `document`)

| Event | When | Detail |
|---|---|---|
| `cart-updated` | After any cart mutation updates `cart.value` | `{ cart }` |
| `vue:loaded` | Vue app boot complete | `{ vue: window.app }` (now includes vue instance) |
| `turbo:before-cache-timeout` | Before Turbo caches the page (replaces `turbo:before-cache` for view transitions) | — |

### Vue `$root` Events (via `window.app.$emit` / `this.$root.$emit`)

#### Still dispatched (check your listeners)

| Event | Notes |
|---|---|
| `checkout-credentials-saved` | Now dispatched from blade template after `submitPartials` resolves |
| `checkout-payment-saved` | Now dispatched from blade template |
| `checkout-success` | Emitted by `CheckoutSuccess.vue` with the `order` object |
| `postcode-change` | Now passes GraphQL mutation `variables` object, not `checkout.X_address` |
| `vat-change` | Unchanged |
| `logout` | Handled in `useUser.js`, triggers full logout flow |
| `placeOrder` | **New** — triggers the place-order GraphQL mutation |
| `setShippingAddressesOnCart` | **New** — triggers shipping address mutation |
| `setBillingAddressOnCart` | **New** — triggers billing address mutation |
| `setShippingMethodsOnCart` | **New** — triggers shipping method mutation |
| `setPaymentMethodOnCart` | **New** — triggers payment method mutation |
| `cart-remove` | **New** — dispatched when a cart item is removed |
| `logged-out` | **New** — dispatched after successful logout |
| `registered` | **New** — dispatched after customer registration |

#### Removed events

| Removed Event | Replacement |
|---|---|
| `checkout-step` | URL-based navigation |
| `before-checkout-payment-saved` | `addBeforePlaceOrderHandler` / `addBeforePaymentMethodHandler` |
| `checkout-payment-selected` | `setPaymentMethodOnCart` event + handler |
| `logged-in` | Check `user.is_logged_in` directly |

---

## 6. Vue Root Data Changes

### `$root.checkout` removed entirely
See [Section 1](#1-checkout--complete-rewrite).

### `$root.user` changes
```js
// v2
$root.user?.id          // check logged in
$root.user.addresses    // customer addresses

// v3
$root.user?.is_logged_in    // boolean, always available
$root.user.addresses        // unchanged, but user data from GraphQL not REST API
$root.user.email            // now the primary identifier
```

User data structure changed — it now comes from GraphQL (`customer { ... }`) instead of the REST API. Fields like `id` are still present, but check for `email` or `is_logged_in` for logged-in status.

Custom attributes are now flattened directly onto the user object:
```js
// v3 — custom_attributes are merged into user directly
user.my_custom_attribute  // instead of user.custom_attributes.find(...)
```

### `$root.order` added
```js
$root.order  // ref to useOrder store, populated after successful order placement
```

### `$root.cart` computed values changed
`cart.fixedProductTaxes` and `cart.taxTotal` are now plain values (not Vue computed objects):
```html
<!-- v2 -->
@{{ cart.taxTotal.value | price }}

<!-- v3 -->
@{{ cart.taxTotal | price }}
```

New cart fields from the fragment:
```js
cart.is_virtual          // boolean
cart.email               // guest email on cart
cart.billing_address     // full address object with same_as_shipping
cart.billing_address.same_as_shipping  // boolean
cart.shipping_addresses[0].uid         // needed to check if address is set
cart.shipping_addresses[0].available_shipping_methods
cart.selected_payment_method
cart.available_payment_methods
```

Address field name change in cart response:
```js
// v2
cart.shipping_addresses[0].country_id   // was string code like 'NL'

// v3
cart.shipping_addresses[0].country.code // nested object
cart.billing_address.country.code
```

---

## 7. Store & Authentication Changes

### Token and Mask: localStorage → Cookie
Both `token` (customer JWT) and `mask` (cart ID) are now stored in cookies instead of localStorage.

- localStorage values are still synced for backwards compatibility but are **deprecated**
- If you access `localStorage.getItem('token')` or `localStorage.getItem('mask')` directly, migrate to the store imports

```js
// v2
import { token } from './stores/useUser'
import { mask } from './stores/useMask'
// token.value / mask.value read from localStorage

// v3 — same import, but backed by cookies
import { token } from './stores/useUser'
import { mask } from './stores/useMask'
```

### User storage: localStorage → sessionStorage
`userStorage` changed from `useLocalStorage` to `useSessionStorage`. User data is now cleared when the browser session ends (tab close).

### New `useOrder` store
```js
import { order, refresh as refreshOrder, clear as clearOrder,
         loadCustomerByNumber, loadGuestByToken, loadGuestByCredentials,
         fillFromGraphqlResponse } from './stores/useOrder'
```

### New `usePaymentHandlers` store
```js
import {
    addBeforePaymentMethodHandler,
    addBeforePlaceOrderHandler,
    addAfterPlaceOrderHandler
} from './stores/usePaymentHandlers'
```

### `useCart` — exported function changes

| v2 | v3 |
|---|---|
| `virtualItems` (computed) | Removed |
| `hasOnlyVirtualItems` (computed) | Removed — use `cart.is_virtual` |
| `fixedProductTaxes` (computed) | Now a plain function `fixedProductTaxes(cart)` |
| `taxTotal` (computed) | Now a plain function `taxTotal(cart)` |
| `getAttributeValues` | Still exported |
| — | `setGuestEmailOnCart(email)` — new |
| — | `fetchGuestCart()` — new |
| — | `fetchCart()` — new (fetches customer or guest cart) |

### `useUser` — new exports

| New export | Description |
|---|---|
| `isEmailAvailable(email)` | Check if email is available |
| `register(email, firstname, lastname, password, input?)` | Register new customer |

### New `auth:magento-cart` guard
The checkout route requires a valid cart cookie (`mask`) via this new guard. Failed auth redirects to `/cart`.

---

## 8. InteractWithUser Mixin Removed

`resources/js/components/User/mixins/InteractWithUser.js` has been deleted.

If your custom components use this mixin, migrate to direct store imports:

```js
// v2
import InteractWithUser from './../User/mixins/InteractWithUser'
export default {
    mixins: [InteractWithUser],
    methods: {
        async doSomething() {
            await this.refreshUser()
            await this.login(email, password)
            this.logout()
        }
    }
}

// v3
import { user, refresh as refreshUser, login, logout } from '../../stores/useUser'
export default {
    methods: {
        async doSomething() {
            await refreshUser()
            await login(email, password)
            this.$root.$emit('logout')
        }
    }
}
```

Methods removed from mixin (and their replacements):

| Mixin method | v3 replacement |
|---|---|
| `this.refreshUser(redirect)` | `await refresh()` from `useUser` |
| `this.login(email, pw, callback)` | `await login(email, pw)` from `useUser` |
| `this.logout(redirect)` | `this.$root.$emit('logout', { redirect })` |
| `this.onLogout(data)` | Handled automatically in `useUser.js` |
| `this.createCustomer(customer)` | `await register(...)` from `useUser` |
| `this.setCheckoutCredentialsFromDefaultUserAddresses()` | No longer needed — cart handles address |
| `this.setCustomerAddressByAddressId(type, id)` | No longer needed |
| `this.getUser()` | `user` reactive ref from `useUser` |

The components that previously mixed in `InteractWithUser` (`Graphql.vue`, `GraphqlMutation.vue`, `AddToCart.vue`, `User.vue`) no longer depend on it.

---

## 9. Product Images — `media` Removed

The `media` attribute on the product model (array of `{ media_type, image, video_url }`) has been removed.

```js
// v2
config.product.media   // [{ media_type: 'image', image: '/path.jpg', video_url: null }, ...]
// Images.vue: slot had `media`

// v3
config.product.images  // ['/path.jpg', '/path2.jpg', ...]
// Images.vue: slot has `images`
```

If you override `resources/views/product/partials/images.blade.php`, update to use the new gallery partials structure:
```blade
<images>
    <div slot-scope="{ images, active, zoomed, toggleZoom, change }">
        @include('rapidez::product.partials.gallery.slider')
        @include('rapidez::product.partials.gallery.thumbnails')
        @include('rapidez::product.partials.gallery.popup')
    </div>
</images>
```

---

## 10. JavaScript API Changes

### `Vue.prototype` methods

| v2 | v3 | Notes |
|---|---|---|
| `this.updateCart(variables, response)` | `this.updateCart(data, response)` | Now dispatches `cart-updated` DOM event |
| — | `this.updateOrder(data, response)` | New — updates the order store |
| — | `this.submitPartials(form, sequential?)` | New — checkout form submission helper |
| — | `this.handleBeforePaymentMethodHandlers` | New — alias for `runBeforePaymentMethodHandlers` |
| — | `this.handleBeforePlaceOrderHandlers` | New — alias for `runBeforePlaceOrderHandlers` |
| — | `this.handlePlaceOrder(data, response)` | New — callback for place order mutation |

### `checkResponseForExpiredCart` — detection changed
The cart expiry detection now uses a broader check:
```js
// v2 — specific mutation names
['cart', 'customerCart', 'assignCustomerToGuestCart', ...].includes(path)

// v3 — any path containing 'cart'
error.path.some((path) => path.toLowerCase().includes('cart'))
```

### `combiningGraphQL` — new global
```js
// Combines multiple GraphQL queries into one network request
import { combiningGraphQL } from './fetch'
// or window.combiningGraphQL(query, variables, options, groupName)
```

Use the `group` prop on `<graphql-mutation>` / `<graphql>` to combine requests automatically.

### `magentoGraphQL` — error handling change
Previously both `graphql-authorization` and `graphql-authentication` categories triggered a token refresh. Now only `graphql-authorization` does.

### `vue:loaded` event — now includes vue instance
```js
// v2
document.addEventListener('vue:loaded', () => { /* window.app is ready */ })

// v3
document.addEventListener('vue:loaded', (event) => {
    const vue = event.detail.vue  // now passed in detail
})
```

### `filters.js` — `price` and `truncate` now global
Both Vue filters now also register as global window functions:
```js
window.price(value)           // formats as currency
window.truncate(value, limit) // truncates string
```

---

## 11. Address Defaults — field rename

```js
// v2
window.address_defaults.country_id = 'NL'

// v3
window.address_defaults.country_code = 'NL'
window.address_defaults.same_as_shipping = true  // new field
```

Any Blade or JS code that reads `address_defaults.country_id` must be updated to `address_defaults.country_code`.

The checkout address form variables also changed to match the GraphQL input fields:
```html
<!-- v2 in checkout partials address -->
v-model="checkout.shipping_address.country_id"

<!-- v3 in checkout partials address -->
v-model="variables.country_code"
```

---

## 12. Global Utility Functions

### New global window functions
```js
window.price(value)            // equivalent to Vue filter 'price'
window.truncate(value, limit)  // equivalent to Vue filter 'truncate'
window.combineGraphqlQueries(queries, name?)
window.combiningGraphQL(query, variables, options, groupName)
```

### `Rapidez::config()` default changed
In PHP, `Rapidez::config($path)` now defaults to `false` (falsy) instead of `null` when the config key doesn't exist. Null is still returned when the value is explicitly null in the database.

This affects any comparison like:
```php
// v2 — checking for null could catch missing values
if (Rapidez::config('some/path') === null) { ... }

// v3 — missing values return false
if (!Rapidez::config('some/path')) { ... }
```

A new `config/rapidez/magento-defaults.php` file allows setting default values for Magento config paths.

---

## 13. Frontend Build Configuration

### package.json — New dependencies

The following packages were added in v3 and must be present in the host project's `package.json`:

| Package | Version | Purpose |
|---|---|---|
| `graphql` | `^16.8.1` | Required for all GraphQL operations |
| `graphql-tag` | `^2.12.6` | Parses GraphQL query strings into AST |
| `graphql-combine-query` | `indykoning/graphql-combine-query#feature/add-allowed-duplicates` | Merges multiple GraphQL documents |
| `@vueuse/integrations` | `^10.11.0` | VueUse integrations (e.g. cookie handling) |
| `universal-cookie` | `^7.1.4` | Peer dependency for `@vueuse/integrations` cookie utilities |
| `vue2-teleport` | `^1.1.4` | `<Teleport>` support in Vue 2 |
| `tailwindcss` | `^3.4` | Minimum version bump from `^3.3.3` |

Install them:
```bash
npm install graphql graphql-tag graphql-combine-query @vueuse/integrations universal-cookie vue2-teleport
npm install --save-dev tailwindcss@^3.4
```

### tailwind.config.js — Design token overhaul

The color system has been completely reworked. The old approach used raw CSS variable RGB channels (`rgb(var(--primary) / <alpha-value>)`). v3 introduces a `color()` helper using `color-mix()` that accepts any valid CSS color as a fallback.

**The old single-word color tokens are removed.** Update any references in your Tailwind classes or CSS:

| v2 token | v3 replacement | Notes |
|---|---|---|
| `text-neutral` / `bg-neutral` | `text-foreground` / `bg-foreground` | Default text |
| `text-inactive` / `bg-inactive` | `text-foreground-muted` / `bg-foreground-muted` | Muted/inactive text |
| `bg-highlight` | `bg-background-emphasis` | Background highlight |
| `border-border` / `border` | `border-border` (unchanged key, now an object) | Default border |
| `bg-secondary` (conversion use) | `bg-conversion` | Separate conversion color token |

**New color tokens added:**

```js
colors: {
    // Foreground (text) scale
    foreground: {
        emphasis: color('--foreground-emphasis', colors.slate[900]),
        DEFAULT:  color('--foreground',          colors.slate[800]),
        muted:    color('--foreground-muted',    colors.slate[600]),
    },
    // Border scale
    border: {
        emphasis: color('--border-emphasis', colors.slate[400]),
        DEFAULT:  color('--border',          colors.slate[300]),
        muted:    color('--border-muted',    colors.slate[100]),
    },
    // Background scale
    background: {
        emphasis: color('--background-emphasis', colors.slate[200]),
        DEFAULT:  color('--background',          colors.slate[100]),
        muted:    color('--background-muted',    colors.slate[50]),
    },
    // Dedicated conversion color (call-to-action buttons etc.)
    conversion: {
        DEFAULT: color('--conversion',      colors.green[500]),
        text:    color('--conversion-text', colors.white),
    },
    backdrop: color('--backdrop', 'rgba(0, 0, 0, 0.4)'),
}
```

**Semantic default overrides** — v3 wires the new tokens to Tailwind's default utilities so that bare `text-`, `bg-`, `border-`, `ring-`, and `outline-` utilities pick up the theme values automatically:

```js
textColor:       (theme) => theme('colors.foreground'),
borderColor:     (theme) => ({ default: theme('colors.border'), ...theme('colors.border') }),
backgroundColor: (theme) => theme('colors.background'),
ringColor:       (theme) => ({ default: theme('colors.border'), ...theme('colors.border') }),
outlineColor:    (theme) => ({ default: theme('colors.border'), ...theme('colors.border') }),
```

**Named z-index tokens** — Custom `zIndex` keys are now part of the theme so you can use them in Tailwind classes:

```
z-header, z-header-autocomplete-overlay, z-header-autocomplete, z-header-dropdown,
z-header-minicart, z-header-autocomplete-button,
z-notifications,
z-slideover, z-slideover-overlay, z-slideover-sidebar,
z-popup, z-popup-actions,
z-cookie
```

If your project overrides `tailwind.config.js` (common when publishing vendor assets), merge these additions into your copy or re-publish and re-apply your customisations.

**CSS variable migration** — If you define theme colors via CSS custom properties, update them from RGB channels to full CSS colors:

```css
/* v2 — RGB channels only */
:root {
    --primary: 47 188 133;
    --primary-text: 255 255 255;
}

/* v3 — any valid CSS color */
:root {
    --primary: #2FBC85;
    --primary-text: #ffffff;
}
```

---

## Quick Search: What to look for in overridden files

When scanning overridden views and JS files, search for these patterns that need updating:

| Search for | Replace with |
|---|---|
| `config.queries.cart` | `config.fragments.cart` (with `...cart` in query) |
| `checkout.shipping_address` | `cart.shipping_addresses[0]` |
| `checkout.billing_address` | `cart.billing_address` |
| `checkout.hide_billing` | `cart.billing_address.same_as_shipping` |
| `checkout.payment_method` | `cart.selected_payment_method.code` |
| `checkout.step` | URL-based routing |
| `checkout.totals` | Cart prices from GraphQL (`cart.prices.*`) |
| `checkout.shipping_methods` | `cart.shipping_addresses[0].available_shipping_methods` |
| `InteractWithUser` | Direct store imports |
| `x-rapidez::checkbox` | `x-rapidez::input.checkbox` |
| `x-rapidez::radio` | `x-rapidez::input.radio` |
| `x-rapidez::select` | `x-rapidez::input.select` |
| `x-rapidez::textarea` | `x-rapidez::input.textarea` |
| `x-rapidez::country-select` | `x-rapidez::input.select.country` |
| `x-rapidez::slideover ` (not `.global`) | `x-rapidez::slideover.global` |
| `x-rapidez::button ` (not subcomponent) | `x-rapidez::button.outline` or `.conversion` |
| `address_defaults.country_id` | `address_defaults.country_code` |
| `user?.id` | `user?.is_logged_in` or `user?.email` |
| `loggedIn` | `loggedIn()` (method, not property) |
| `cart.taxTotal.value` | `cart.taxTotal` |
| `cart.virtualItems` | `cart.is_virtual` |
| `cart.hasOnlyVirtualItems` | `cart.is_virtual` |
| `media` in Images slot scope | `images` |
| `config.product.media` | `config.product.images` |
| `before-checkout-payment-saved` event | `addBeforePlaceOrderHandler` |
| `checkout-payment-selected` event | `setPaymentMethodOnCart` event |
| `checkout-step` event | Removed |
| `Turbo.setProgressBarDelay` | `Turbo.config.drive.progressBarDelay` |
| `slot-scope="{ data }"` on `<graphql>` | `slot-scope="{ data, variables }"` (variables now available) |
| `:check="'some.path'"` on `<graphql>` | `:check="(data) => data?.some?.path"` |
| `text-neutral` | `text-foreground` |
| `text-inactive` | `text-foreground-muted` |
| `bg-highlight` | `bg-background-emphasis` |
| `bg-secondary` (conversion) | `bg-conversion` |
| CSS `--primary: 47 188 133` (RGB channels) | `--primary: #2FBC85` (full CSS color) |
`````
