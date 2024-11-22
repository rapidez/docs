# Upgrading

---

[[toc]]

## Rapidez v3

In this release we refactored the checkout from the Magento API to GraphQL! 🚨 You should review all changes! And with that 🥁 we added a onestep checkout option! 🚀

- Dropped support for Magento 2.4.6, Laravel 10 and PHP 8.1
- You should review all template changes!

## Composer dependencies

First follow the [Laravel 11 upgrade guide](https://laravel.com/docs/11.x/upgrade#main-content) and check all your dependencies one by one if they're compatible and what's changed in changelogs / release notes.

### Laravel 11

With Laravel 11 a new application structure was introduced, Laravel doens't recommend to upgrade to the new structure, but as within our new `MagentoCartTokenGuard` we're using the `redirectUsing()` you've to make 1 change; remove the `redirectTo()` method from `app/Http/Middleware/Authenticate.php`:
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

## Frontend dependencies

1. **Install**
```
yarn add -D graphql graphql-tag universal-cookie "graphql-combine-query@indykoning/graphql-combine-query#feature/add-allowed-duplicates"
```
2. **Build**
```
yarn build
```

## Checkout changes

Everything has been migrated to use the GraphQL components for queries and mutations. On those components callbacks are used to process the data. So any changes made in an overwritten `checkout.vue` file and any checkout views should be reviewed.

The fastest option is to remove all checkout customizations and reïmplemenent them within the new checkout as a lot has been changed!

### Routing

We moved everything to Laravel routes where previously this was handled with custom Javascript. The benefit of this is that every checkout step will go through PHP where we can add/check any data, just like everything else within Rapidez. So `/checkout#credentials` becomes `/checkout/credentials`. With that we introduced authentication providers which can be used as a middleware on routes:

- `auth:magento-customer`
- `auth:magento-cart`

With this routes can be "secured" where previously this was checked on the frontend, when unauthorized you where redirected away after the page load. This is now handled serverside. All checkout steps are secured with the `auth:magento-cart` middleware by default to validate the cart mask. To make this possible the mask and customer token are moved from LocalStorage to Cookies.

## Magento configuration

- [Enable Guest Checkout Login](configuration.md#enable-guest-checkout-login)
