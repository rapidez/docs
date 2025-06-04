# Packages

---

This works just like any Laravel package, [read their documentation to get started](https://laravel.com/docs/12.x/packages) and have a look at the [existing packages](packages.md) to see how things are handled. You could use our [Package Template](https://github.com/rapidez/package-template) as a starting point.

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
`index.product.attributes` | Index additional product attributes
`index.*.data` | Manipulate the models data before it's getting indexed, e.g. `index.products.data`
`index.*.mapping` | Manipulate the index mapping for a given model, e.g. `index.products.mapping`
`index.*.settings` | Manipulate the index settings for a given model, e.g. `index.products.settings`
`routes` | ([deprecated](#addfallbackroute)) Register additional routes ([example](https://github.com/rapidez/amasty-shop-by-brand/blob/master/src/AmastyShopByBrandServiceProvider.php))

Every model extends the [base model](https://github.com/rapidez/core/blob/master/src/Models/Model.php) which uses the [`HasEventyGlobalScopeFilter` trait](https://github.com/rapidez/core/blob/master/src/Models/Traits/HasEventyGlobalScopeFilter.php) so it's possible to add scopes to every model, for example: `category.scopes`

## Vue Events

Rapidez emits some custom Vue events you can hook into with [`$on`](https://vuejs.org/v2/api/#vm-on). This is used for example within the [Rapidez GTM](https://github.com/rapidez/gtm) package, have a look at the [`gtm.js`](https://github.com/rapidez/gtm/blob/master/resources/js/gtm.js) file.

Event | Explanation
:--- | :---
`registered` | After registering the user, contains any information passed except for the password
`logged-in` | After the user has logged in
`logout` | After the user attempts to log out, listen to this to clear any sensitive information about the user
`logged-out` | After the user has been logged out
`cart-add` | After a product has been added to the cart
`cart-refreshed` | After the cart is refreshed
`cart-remove` | When the remove from cart button has been used
`checkout-credentials-saved` | After the checkout credentials are saved
`checkout-payment-selected` | After the payment method has been selected
`checkout-success` | When the user is on the success page
`checkout-payment-saved` | After the payment method is saved
`product-super-attribute-change` | After a swatch change, when calling this the product image updates based on the choice
`postcode-change` | Events for postcode integrations, fired after postcode or housenumber changed.
`vat-change` | Events for VAT validation.

## Regular Events

These are custom vanilla JS events that are fired that you can hook into:

Event | Explanation
:--- | :---
`vue:loaded` | After `window.app` has been created, always use this if you want to interact with the global Vue object after it's created. `DOMContentLoaded` or `turbo:load` are NOT recommended for this.
`vue:mounted` | After the global vue component has been mounted, [see](https://github.com/rapidez/core/blob/master/resources/js/package.js#L173)
`turbo:load` | The `DOMContentLoaded` for Turbo navigation, it will fire late the initial request. We recommend using `vue:loaded` instead. There are more [Turbo events](https://turbo.hotwired.dev/reference/events)
`cart-updated` | Fired whenever the `updateCart` has been executed, this is no guarantee data has actually changed.
`insights-event:*` | These are fired by the listing and autocomplete component. `*` needs to be replaced by any of the [InsightsMethods](https://github.com/algolia/instantsearch/blob/5a2d2121c1f82840e59ba69edfe0a4f41450f41b/packages/instantsearch.js/src/types/insights.ts#L21). In the event detail you will get the [InsightsEvent](https://github.com/algolia/instantsearch/blob/5a2d2121c1f82840e59ba69edfe0a4f41450f41b/packages/instantsearch.js/src/types/insights.ts#L34) and can be used for analytics.

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
