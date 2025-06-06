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

## Composer dependencies

First, follow the [Laravel 11 upgrade guide](https://laravel.com/docs/11.x/upgrade) and check all your dependencies one by one to see if they're compatible and what has changed in changelogs / release notes.
```bash
composer outdated
```

### Laravel 11

With Laravel 11, a new application structure was introduced. Laravel doesn't recommend upgrading to the new structure, but since we are using the `redirectUsing()` within our new `MagentoCartTokenGuard`, you have to make 1 change; remove the `redirectTo()` method from `app/Http/Middleware/Authenticate.php`:
```code
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

The colors got new names, see the [color docs](theming.md#colors). You could upgrade to those new classes by replacing them in overwritten and custom Blade templates; have a look at the [color names refactor PR](https://github.com/rapidez/core/pull/622) for examples. An easier approach is to merge those new colors with your existing colors in the `tailwind.config.js`. That way you're existing and new colors work.

### Z-indexes

The `rapidez.frontend.z-indexes` config has been removed with the [named z-indexes refactor](https://github.com/rapidez/core/pull/625). The z-index names are not defined within the [`tailwind.config.js`](https://github.com/rapidez/core/blob/master/tailwind.config.js). Most likely you've published the `config/rapidez/frontend.php` file so nothing will break there. You only have to add the new `zIndex` options from the [`tailwind.config.js`](https://github.com/rapidez/core/blob/master/tailwind.config.js) into your project Tailwind config. We recommend replacing all the `rapidez.frontend.z-indexes` usage with the Tailwind z-index names.

### Components

Within Rapidez we'd multiple components for inputs, buttons, etc within the core. Most of them are extracted to a separated package: [rapidez/blade-components](https://github.com/rapidez/blade-components). The migration to those new components within the core can be found [here](https://github.com/rapidez/core/pull/667). We recommend to migrate everything to those new components. Check out the [readme](https://github.com/rapidez/blade-components) and [demo](https://rapidez.github.io/blade-components/demo/components.html).

## Checkout changes

Everything has been migrated to use the GraphQL components for queries and mutations. On those components, callbacks are used to process the data. So any changes made in an overwritten `checkout.vue` file and any checkout views should be reviewed. Have a look at the [GraphQL checkout PR](https://github.com/rapidez/core/pull/503) for all changes.

The opinionated checkout options ([checkout-theme](https://github.com/rapidez/checkout-theme) and [confira](https://github.com/rapidez/confira)) are already made compatible with Rapidez v3. No [onestep](#onestep-checkout) there as they're multi step checkouts.

::: tip
The fastest option is to remove all checkout customizations and reimplement them within the new checkout as a lot has been changed! 
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
