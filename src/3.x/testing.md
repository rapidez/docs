# Testing

---

Rapidez is built upon [Laravel](https://laravel.com/) so you have its [full testing suite](https://laravel.com/docs/master/testing#main-content) including [Laravel Dusk](https://laravel.com/docs/master/dusk#main-content) available to you. Dusk is most likely what you'll be using to write your tests.

[[toc]]

## Installation

Rapidez already has some tests included in the core. To install and configure Dusk, and to use these tests you can run the following command.

```bash
php artisan rapidez:install:tests
```

::: tip Note
Laravel Dusk expects a [ChromeDriver](https://chromedriver.chromium.org/) compatible browser to be installed by default. 
This means the system you want to run your tests on will need to have [Chrome](https://www.google.com/chrome/) or [Chromium](https://www.chromium.org/Home/) installed.
:::

## Writing tests

Tests are located in the `/tests` folder and contain `Browser` and `Feature` tests. All information around testing can be found within the [Laravel testing docs](https://laravel.com/docs/master/testing#main-content) and the [Laravel Dusk docs](https://laravel.com/docs/master/dusk#main-content). In additional to all functionality Laravel offers, we've added some extra's:

### `waitUntilIdle()`

Since Rapidez has many API calls and code running in the background, sometimes we want to make sure these requests have completed and the browser is idle and no longer executing code. This is what [waitUntilIdle()](https://github.com/rapidez/core/blob/60b9c761a6d7e7f844d854306b314b422143aae9/tests/DuskTestCaseSetup.php#L39) is for. It will wait until no network request is active and the browser being idle for 500ms. So we know for sure and API requests doesn't initiate another API request. By default we wait for 120 seconds until the tests will fail, but you can change that by specifying an argument:

```php
$browser->waitUntilIdle(120);
```

### `waitUntilTrueForDuration()`

[waitUntilTrueForDuration()](https://github.com/rapidez/core/blob/60b9c761a6d7e7f844d854306b314b422143aae9/tests/DuskTestCaseSetup.php#L18) is similar to [waitUntil()](https://laravel.com/docs/master/dusk#waiting-on-javascript-expressions) however since sometimes the result of an expression you pass can be unstable and change to false quickly after it was true we have created a function to wait until it is true for a duration.

```php
$browser->waitUntilTrueForDuration('true', 120, 0.5);
```

| Argument | Default | Description |
|---|---|---|
| `script` | `'true'` | The javascript expression that needs to be true to continue. |
| `timeout` | 120 | The timeout in seconds, if this is exceeded the test will fail. |
| `for` | 0.5 | How long in seconds the expression needs to be true for before continuing. |

## Continuous Integration

If you'd like to run the tests with some CI tool like Bitbucket Pipelines or Github Actions you've to make sure there is a Magento environment Rapidez can work with. You could use a test environment for that so you don't have to setup a Magento environment in Docker. But you've to make a SSH tunnel for the database connection and for every run orders will be created. If you've made it until here and you're interested; [ask us on Slack](https://rapidez.io/slack)!
