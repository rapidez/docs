# Packages

---

This works just like any Laravel package, [read their documentation to get started](https://laravel.com/docs/master/packages) and have a look at the [existing packages](packages.md) to see how things are handled.

[[toc]]

## Eventy Filters

[Eventy](https://github.com/tormjens/eventy) is used to have Wordpress style filters which can be used within packages. Have a look at [their docs](https://github.com/tormjens/eventy#filters) to see how these filters can be used or at the [`AmastyLabelServiceProvider.php`](https://github.com/rapidez/amasty-label/blob/master/src/AmastyLabelServiceProvider.php) from the [Rapidez Amasty Label](https://github.com/rapidez/amasty-label) package as an example.

Filter | Explanation
:--- | :---
`product.scopes` | Add additional global product scopes
`product.casts` | Add additional global product casts
`product.children.select` | Manipulate the children select query
`productpage.scopes` | Add product scopes only for the product page
`productpage.frontend.attributes` | Add product attributes to the frontend
`index.product.scopes` | Add product scopes to the product query when indexing
`index.product.data` | Manipulate the product data before it's getting indexed 
`index.product.attributes` | Index additional product attributes
`index.product.mapping` | Manipulate the index mapping
`routes` | Register additional fallback routes ([example](https://github.com/rapidez/amasty-shop-by-brand/blob/master/src/AmastyShopByBrandServiceProvider.php))

Every models extends the [base model](https://github.com/rapidez/core/blob/master/src/Models/Model.php) which uses the [`HasEventyGlobalScopeFilter` trait](https://github.com/rapidez/core/blob/master/src/Models/Traits/HasEventyGlobalScopeFilter.php) so it's possible to add scopes to every model, for example to the category model with `category.scopes`

## Vue Events

Rapidez emits some custom Vue events you can hook into with [`$on`](https://vuejs.org/v2/api/#vm-on). This is used for example within the [Rapidez Mollie](https://github.com/rapidez/mollie) package, have a look at the [`mollie.js`](https://github.com/rapidez/mollie/blob/master/resources/js/mollie.js) file.

Event | Explanation
:--- | :---
`cart-refreshed` | After the cart is refreshed
`checkout-credentials-saved` | After the checkout credentials are saved
`checkout-payment-saved` | After the payment method is saved
`product-super-attribute-change` | After a swatch change, when calling this the product image updates based on the choice.

There is also a `doNotGoToTheNextStep` variable on the root Vue instance which can be used to prevent the checkout from going to the next step. That's also used within the [Rapidez Mollie](https://github.com/rapidez/mollie) package to prevent the checkout from going to the success page because you've to pay first and we'd like to redirect the user to the payment page.
