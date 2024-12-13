# Upgrading

---

[[toc]]

## Rapidez v3

In this release, we **refactored the checkout** from the Magento API **to GraphQL**! 🚨 And with that 🥁, we added a **one-step checkout** option! 🚀 Furthermore:

- Dropped support for Magento 2.4.6, Laravel 10, and PHP 8.1
- [Improved the install command](https://github.com/rapidez/core/pull/586)
- [Active filters will be visible](https://github.com/rapidez/core/pull/587)
- [HTTP/3 Early Hints support](https://github.com/rapidez/core/pull/644)

And a lot of frontend changes:

- [Product gallery](https://github.com/rapidez/core/pull/624)
- [Autocomplete](https://github.com/rapidez/core/pull/670)
- [Quantity input](https://github.com/rapidez/core/pull/645)
- [Color names](https://github.com/rapidez/core/pull/622)
- [Named z-indexes](https://github.com/rapidez/core/pull/625)
- You should review all template changes!

## Composer dependencies

First, follow the [Laravel 11 upgrade guide](https://laravel.com/docs/11.x/upgrade) and check all your dependencies one by one to see if they're compatible and what has changed in changelogs / release notes.

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
```
yarn add -D graphql graphql-tag universal-cookie "graphql-combine-query@indykoning/graphql-combine-query#feature/add-allowed-duplicates"
```
2. **Build**
```
yarn build
```

### Event changes

If you need to interact with the current Vue instance, do not use `turbo:load`. Instead, use `vue:loaded` to ensure Vue has actually been booted.

### Graphql component

The `check` property on the graphql component has been changed from a string that gets evaluated to a function. This means that you will have to update each (normal) usage of `check="[...]"` to `check="(data) => data.[...]"`.

## Checkout changes

Everything has been migrated to use the GraphQL components for queries and mutations. On those components, callbacks are used to process the data. So any changes made in an overwritten `checkout.vue` file and any checkout views should be reviewed.

The fastest option is to remove all checkout customizations and reimplement them within the new checkout as a lot has been changed!

### Routing

We moved everything to Laravel routes where previously this was handled with custom JavaScript. The benefit of this is that every checkout step will go through PHP where we can add/check any data, just like everything else within Rapidez. So `/checkout#credentials` becomes `/checkout/credentials`. With that, we introduced authentication providers which can be used as middleware on routes:

- `auth:magento-customer`
- `auth:magento-cart`

With these routes, you can "secure" them where previously this was checked on the frontend. When unauthorized, you were redirected away after the page load. This is now handled server-side. All checkout steps are secured with the `auth:magento-cart` middleware by default to validate the cart mask. To make this possible, the mask and customer token are moved from LocalStorage to Cookies.

## Magento configuration

- [Enable Guest Checkout Login](configuration.md#enable-guest-checkout-login)
