# Packages

---

This works just like any Laravel package, [read their documentation to get started](https://laravel.com/docs/11.x/packages) and have a look at the [existing packages](packages.md) to see how things are handled. You could use our [Package Template](https://github.com/rapidez/package-template) as a starting point.

[[toc]]

## Eventy Filters

[Eventy](https://github.com/tormjens/eventy) is used to have WordPress style filters which can be used within packages. Have a look at [their docs](https://github.com/tormjens/eventy#filters) to see how these filters can be used. Examples can also be found within existing Rapidez packages, for example within the [`AmastyLabelServiceProvider.php`](https://github.com/rapidez/amasty-label/blob/master/src/AmastyLabelServiceProvider.php) from the [Rapidez Amasty Label](https://github.com/rapidez/amasty-label) package.

Filter | Explanation
:--- | :---
`*.scopes` | Add additional global scopes to every model available e.g. `product.scopes` or `category.scopes`
`product.casts` | Add additional global product casts
`product.children.select` | Manipulate the children select query
`product.grouped.select` | Manipulate the grouped products select query
`productpage.scopes` | Add product scopes only for the product page
`productpage.frontend.attributes` | Add product attributes to the frontend
`quote.items.select` | Manipulate the quote items select query
`index.product.scopes` | Add product scopes to the product query when indexing
`index.product.data` | Manipulate the product data before it's getting indexed 
`index.product.attributes` | Index additional product attributes
`index.product.mapping` | Manipulate the index mapping
`routes` | ([deprecated](#addfallbackroute)) Register additional routes ([example](https://github.com/rapidez/amasty-shop-by-brand/blob/master/src/AmastyShopByBrandServiceProvider.php))

Every model extends the [base model](https://github.com/rapidez/core/blob/master/src/Models/Model.php) which uses the [`HasEventyGlobalScopeFilter` trait](https://github.com/rapidez/core/blob/master/src/Models/Traits/HasEventyGlobalScopeFilter.php) so it's possible to add scopes to every model, for example: `category.scopes`

## Vue Events

Rapidez emits some custom Vue events you can hook into with [`$on`](https://vuejs.org/v2/api/#vm-on). This is used for example within the [Rapidez Mollie](https://github.com/rapidez/mollie) package, have a look at the [`mollie.js`](https://github.com/rapidez/mollie/blob/master/resources/js/mollie.js) file.

Event | Explanation
:--- | :---
`logged-in` | After the user has logged in
`logout` | After the user attempts to log out, listen to this to clear any sensitive information about the user
`cart-refreshed` | After the cart is refreshed
`checkout-credentials-saved` | After the checkout credentials are saved
`checkout-payment-selected` | After the payment method has been selected
`before-checkout-payment-saved` | Before the payment method is saved (setting `checkout.preventOrder` to true prevents saving and creating the order altogether)
`checkout-payment-saved` | After the payment method is saved
`product-super-attribute-change` | After a swatch change, when calling this the product image updates based on the choice

There is also a `doNotGoToTheNextStep` variable on the root Vue instance which can be used to prevent the checkout from going to the next step. That's also used within the [Rapidez Mollie](https://github.com/rapidez/mollie) package to prevent the checkout from going to the success page because you have to pay first and we'd like to redirect the user to the payment page.

## Fallback routing

If your package cannot define its own predefined routes you will want to start using fallback routes to check if it matches a route in e.g. your database.

### `Rapidez::addFallbackRoute()`

::: info Why?
If you use the `Route::fallback()` you'll prevent other packages from implementing fallback routes, this is what we've created `Rapidez::addFallbackRoute()` for.
:::

You can pass controllers, functions, etc. in the same way like you would with `Route::fallback()` however it will check each fallback route until it finds one that does not return void or a 404. You can use this function anywhere so long as it's before the fallback route is triggered, we suggest in your ServiceProvider or Routes file ([example](https://github.com/rapidez/core/blob/aa1dbb54faed244b982f5b6198749ccf493c210a/src/RapidezServiceProvider.php#L87)).

The first argument to this function will be your Callable or action, the second argument will be the position or priority it has. Lower means higher priority, but it is optional.

::: tip
If your check to see if it matches has a high performance impact (for example when it's an API request), consider putting the position higher than `9999` and caching the results.
:::

Examples:
```php
use Rapidez\Core\Facades\Rapidez;

Rapidez::addFallbackRoute(UrlRewriteController::class);
Rapidez::addFallbackRoute('UrlRewriteController@index');
Rapidez::addFallbackRoute([UrlRewriteController::class, 'index'], 5);
Rapidez::addFallbackRoute(function (Request $request) {return redirect('/');}, 5);
```

## Hooking into commands

You can hook into commands by using the events that Rapidez fires. See [all available events](https://github.com/rapidez/core/tree/master/src/Events). For example, if you want to fire a command that runs before the indexer, you can put the following into your `AppServiceProvider.php`:

```php
Event::listen(IndexBeforeEvent::class, fn($event) => $event->context->call('another:command'));
```

## Extending Models

All Rapidez models extend the [base model](https://github.com/rapidez/core/blob/master/src/Models/Model.php). This means it implements [Macroable](https://laravel.com/api/master/Illuminate/Support/Traits/Macroable.html), making it possible to add your own functions without overwriting the model itself!

### Adding a single function

Say you want to add a single function to the Product model, then you can add the following in your ServiceProvider boot method:

```php
Product::macro('myTestFunction', function () {
    return 'completed!';
});
```

### Adding multiple functions

If you want to add multiple functions, this might get cluttered. In that case, you can use a mixin. All functions defined in there will be made available from your model:

```php
Product::mixin(ProductMixin::class);
```

### Adding Relationships

Your package might add a new model that should be accessible from a Rapidez model. Relationships can be added with:

```php
Product::resolveRelationUsing(
    'testRelation',
    fn (Product $product) => $product->hasMany(MyTestModel::class, 'product_id');
);
```

## Notifications

If you'd like to show a notification after a redirect from a custom controller you can use:

```php
return redirect('/')->with(['notification' => [
    'message' => 'Lorem ipsum dolor sit amet',
    'type' => 'success',
]]);
```

By default, there are 4 types: `info`, `success`, `warning`, and `error`. The style differences are defined in the [frontend config](https://github.com/rapidez/core/blob/master/config/rapidez/frontend.php), everything else is in the [Blade template](https://github.com/rapidez/core/blob/master/resources/views/components/notifications.blade.php).

## Frontend translations
Rapidez adds some [frontend translations](theming.md#translations) by default. Your package might need to have some translations within Javascript. If you register a frontend.php translations file within a rapidez directory, it wil automaticly be included in the frontend translations. You can use them by referencing it by package name. For example within the [Rapidez Statamic](https://github.com/rapidez/statamic) package:

```js
window.config.translations.packages.statamic
```