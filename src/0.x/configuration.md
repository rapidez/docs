# Configuration

---

Publish the Rapidez config file:

```sh
php artisan vendor:publish --provider="Rapidez\Core\RapidezServiceProvider" --tag="config"
```

After that you'll find all configuration options in `config/rapidez.php` with comments explaining the options. Most of them use the `env()` function so it's possible to have different configurations per environment in the `.env`.

::: tip
For more info on how the configuration works read the [Laravel configuration docs](https://laravel.com/docs/master/configuration)
:::

## Elasticsearch

To communicate with Elasticsearch, Rapidez is using the [laravel-elasticsearch](https://github.com/cviebrock/laravel-elasticsearch) package. If you need to change the Elasticsearch credentials you can do so with these `.env` configurations:

```
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_SCHEME=
ELASTICSEARCH_USER=
ELASTICSEARCH_PASS=
```
