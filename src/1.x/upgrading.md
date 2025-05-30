# Upgrading

First have a look at all the changes between 0.x and 1.0 in the [changelog](https://github.com/rapidez/core/blob/master/CHANGELOG.md) and all code changes in the [code compare](https://github.com/rapidez/core/compare/0.x..master). We've tried to list all steps to upgrade:

- If you've published and overwritten the views:
  - Rename `resources/views/checkout/partials/form.blade.php` to `resources/views/checkout/partials/address.blade.php`
  - Check templates for regex `v-if="[^"]*user"`, these must now include `user?.id`. same with regex `v-if="[^"]*cart"` needing to be `cart?.entity_id`
- You can no longer check for a cart, or users existence in storage using `if (self.$root.cart) {` this must be replaced with a key of it. e.g. `if (self.$root.cart?.entity_id) {`
- Instead of directly using localstorage or sessionstorage, consider using one of the [stores](https://github.com/rapidez/core/tree/1.x/resources/js/stores).
  For other uses of the localstorage (especially setting values) consider [useStorage](https://vueuse.org/core/useStorage/)
- Instead of accessing the user and the cart using the `$root` or `window.app` we suggest using the [stores](https://github.com/rapidez/core/tree/1.x/resources/js/stores) as these provide additional functionality like `clear` and `refresh`
- lodash has been removed, if you are using it you can either reinstall it or migrate away
- vue-async-computed has been removed, if you were using this you can either reinstall it or migrate it to [VueUse asyncComputed](https://vueuse.org/core/computedAsync/)
- Heroicons has been upgraded to version 2, this requires some icons to be renamed in the templates, see this upgrade guide: [Heroicons upgrade guide](https://github.com/tailwindlabs/heroicons/releases/tag/v2.0.0)
