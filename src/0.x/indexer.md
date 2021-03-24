# Running the indexer

---

The easiest way is to schedule the `rapidez:index` command in `app/Console/Kernel.php`
```php
$schedule->command('rapidez:index')->hourly();
```
For more information see [Task Scheduling](https://laravel.com/docs/master/scheduling).

Another option is to visit `/api/admin/index/products?token=` and append your `RAPIDEZ_TOKEN` from the `.env`. You can automate this however you want by sending GET requests.
