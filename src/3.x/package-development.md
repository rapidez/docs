# Packages

---

This works just like any Laravel package, [read their documentation to get started](https://laravel.com/docs/master/packages#main-content) and have a look at the [existing packages](packages.md) to see how things are handled. You could use our [Package Template](https://github.com/rapidez/package-template) as a starting point.

[[toc]]

## Eventy Filters

[Eventy](https://github.com/tormjens/eventy) is used to have Wordpress style filters which can be used within packages. Have a look at [their docs](https://github.com/tormjens/eventy#filters) to see how these filters can be used or at the [`AmastyLabelServiceProvider.php`](https://github.com/rapidez/amasty-label/blob/master/src/AmastyLabelServiceProvider.php) from the [Rapidez Amasty Label](https://github.com/rapidez/amasty-label) package as an example.

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
`routes` | ([deprecated](#addfallbackroute)) Register additional fallback routes ([example](https://github.com/rapidez/amasty-shop-by-brand/blob/master/src/AmastyShopByBrandServiceProvider.php))

Every models extends the [base model](https://github.com/rapidez/core/blob/master/src/Models/Model.php) which uses the [`HasEventyGlobalScopeFilter` trait](https://github.com/rapidez/core/blob/master/src/Models/Traits/HasEventyGlobalScopeFilter.php) so it's possible to add scopes to every model, for example the category model: `category.scopes`

## Vue Events

Rapidez emits some custom Vue events you can hook into with [`$on`](https://vuejs.org/v2/api/#vm-on). This is used for example within the [Rapidez Mollie](https://github.com/rapidez/mollie) package, have a look at the [`mollie.js`](https://github.com/rapidez/mollie/blob/master/resources/js/mollie.js) file.

Event | Explanation
:--- | :---
`cart-refreshed` | After the cart is refreshed
`checkout-credentials-saved` | After the checkout credentials are saved
`checkout-payment-selected` | After the payment method has been selected
`before-checkout-payment-saved` | Before the payment method is saved (setting checkout.preventOrder to true prevents saving and creating the order alltogether)
`checkout-payment-saved` | After the payment method is saved
`product-super-attribute-change` | After a swatch change, when calling this the product image updates based on the choice.
`logged-in` | After the user has logged in.
`logout` | After the user attempts to log out, listen to this to clear any sensitive information about the user.

There is also a `doNotGoToTheNextStep` variable on the root Vue instance which can be used to prevent the checkout from going to the next step. That's also used within the [Rapidez Mollie](https://github.com/rapidez/mollie) package to prevent the checkout from going to the success page because you've to pay first and we'd like to redirect the user to the payment page.

## Fallback routing

If your package cannot define it's own predefined routes you will want to start using fallback routes to check if it matches a route in e.g. your database.

### addFallbackRoute

If you use the `Route::fallback` you'll prevent other packages from implementing fallback routes, this is what we've created `Rapidez::addFallbackRoute()` for.

You can pass controllers, functions etc. in the same way like you would with `Route::fallback` however it will check each fallback route until it finds one that does not return void or 404.

You can use this function anywhere so long as it's before the fallback route is triggered, we suggest in your ServiceProvider or Routes file. ([example](https://github.com/rapidez/core/blob/aa1dbb54faed244b982f5b6198749ccf493c210a/src/RapidezServiceProvider.php#L87))

The first argument to this function will be your Callable or action, the second argument will be the position or priority it has. lower means higher priority. But it is optional.

::: tip
If your check to see if it matches has a high performance impact, consider putting the position higher than `9999`.
And caching the results.
:::

The following are all valid.
```php
use Rapidez\Core\Facades\Rapidez;

Rapidez::addFallbackRoute(UrlRewriteController::class);
Rapidez::addFallbackRoute('UrlRewriteController@index');
Rapidez::addFallbackRoute([UrlRewriteController::class, 'index'], 5);
Rapidez::addFallbackRoute(function (Request $request) {return redirect('/');}, 5);
```

## Hooking into commands

You can hook into commands by using the events that Rapidez fires. For example, if you want to fire a command that runs before the indexer, you can put the following into your AppServiceProvider.php:

```php
Event::listen(IndexBeforeEvent::class, fn($event) => $event->context->call('rapidez:index:categories'));
```

Have a look at [all of the currently available events in Rapidez](https://github.com/rapidez/core/tree/master/src/Events).

## Extending Models

All Rapidez models extend Rapidez' [Model](https://github.com/rapidez/core/blob/master/src/Models/Model.php)

This means it implements [Macroable](https://laravel.com/api/master/Illuminate/Support/Traits/Macroable.html) making it possible to add your own functions without overwriting the Model itself!

### Adding a single function

Say you want to add a single function to the Product model, then you can add the following in your ServiceProvider boot method:

```php
Product::macro('myTestFunction', function () {
  return 'completed!';
});
```

### Adding a multiple functions

If you want to add multiple functions this might get cluttered, which is where you can use mixins:

```php
Product::mixin(ProductMixin::class);
```

and any functions defined in this ProductMixin class will be available in the Product model

### Adding Relationships

Your package might add a new model that should be accessible from a Rapidez model.

By adding the following to your ServiceProvider boot method the Product model has a `testRelation` relationship added to it:

```php
Product::resolveRelationUsing(
    'testRelation',
    fn (Product $product) => $product->hasMany(MyTestModel::class, 'product_id');
);
```

## Notifications
Notifications are essential for keeping users informed about important events within your application. With Rapidez, you can easily add notifications to a session, ensuring that users receive relevant messages.

### Implementation
Follow these steps to add notifications to a session:

1. Add the following code to your controller function or where you want to start the session:
```php
return redirect('/')->with(['notification' => [
    'message' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'type' => 'success'
]]);
```
- `message`: The text of the notification.
- `type`: The notification type (e.g., ‘success’, ‘error’, ‘warning’).

2. **Displaying the Notification**: After the redirect, the notification will automatically appear for the user.
