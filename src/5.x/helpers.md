# Helpers

---

[[toc]]

## Vue helpers

To make using js variables in your blade files a bit easier, we've made some helper functions you can use for displaying content properly. You can also find these in `helpers.js`:

| function | example output | description |
|---|---|---|
|`truncate(value, limit)`|Lorem ipsum dolor sit amet, c...|Truncates a string when it is longer than the limit length, then adding `...` at the end when necessary.|
|`price(value, extra)`|€ 24,99|Displays a price using Intl.NumberFormat with the current locale information. `extra` is optional and can be used for any extra parameters that should be passed into the formatter|
|`url(path)`|`https://demo.rapidez.io/joust-duffle-bag.html`|Ensures a url starts with the domain (by checking if it starts with a `/`)|
|`productPrice(product)`||Helper function that retrieves the current price of a product taking tier prices into account.|
|`productSpecialPrice(product)`||Helper function that retrieves the current special price of a product taking tier prices into account. Returns null if not relevant.|
|`roundCurrency(price)`||Rounds a price to the correct amount of decimals for the active currency.|
|`sumPrices(a, b)`||Sums two prices together, cutting off any excess decimals.|
|`stripHtmlTags(html, safeTags)`||Strips any HTML tags from a string except for the "safe" tags (and only without any attributes) using regex. safeTags defaults to `['mark']`.|
|`htmlDecode(input)`|`Tote <mark>bag</mark>`|Decodes any html characters (like `&lt;`).|

There are also some helpers on the global Vue object that are set in `package.js`:

| name | description |
|---|---|
|`search(value)`|Redirects you to the search page with the given value as the search query, but only if the value is not empty.|
|`toggleScroll(bool)`|Sets the scroll lock on the page. If the `bool` parameter is not set, it will toggle.|
|`resizedPath(imagePath, size, store, sku)`|Returns a resized image URL. Can be used with a SKU instead of an image path if `sku` is set to true. `store` defaults to the current store.|
|`loggedIn`|Returns true only when the customer is logged in.|
|`hasCart`|Returns true only when there is an active cart.|
|`canOrder`|Returns true only when every item in the cart is available.|
