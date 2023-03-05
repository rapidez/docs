# Upgrading

::: warning Rapidez 1.0 is currently in development!
For the status see the [project on Github](https://github.com/orgs/rapidez/projects/1) or [milestone](https://github.com/rapidez/rapidez/milestone/1).
:::

First have a look at all the changes between 0.x and 1.0 in the [changelog](https://github.com/rapidez/core/blob/master/CHANGELOG.md) and all code changes in the [code compare](https://github.com/rapidez/core/compare/0.x...master). We've tried to list all steps to upgrade:

- If you've published and overwritten the views:
  - Rename `resources/views/checkout/partials/form.blade.php` to `resources/views/checkout/partials/address.blade.php`
