# Testing

---

Rapidez is built upon [Laravel](https://laravel.com/), so you have access to its [full testing suite](https://laravel.com/docs/11.x/testing), including [Laravel Dusk](https://laravel.com/docs/11.x/dusk). Dusk is most likely what you'll be using to write your tests.

[[toc]]

## Installation

Rapidez already includes some tests in the core. To install and configure Dusk, and to use these tests, you can run the following command.

```bash
php artisan rapidez:install:tests
```

::: tip Note
Laravel Dusk requires a [ChromeDriver](https://chromedriver.chromium.org/)-compatible browser to be installed by default. 
This means that the system you want to run your tests on will need to have [Chrome](https://www.google.com/chrome/) or [Chromium](https://www.chromium.org/Home/) installed.
:::

## Writing tests

Tests are located in the `/tests` folder and contain `Browser` and `Feature` tests. You can find all information about testing in the [Laravel testing docs](https://laravel.com/docs/11.x/testing) and the [Laravel Dusk docs](https://laravel.com/docs/11.x/dusk). In addition to all the functionality that Laravel offers, we've added some extras:

### `waitUntilIdle()`

Since Rapidez has many API calls and code running in the background, sometimes we want to ensure that these requests have completed and the browser is idle, with no further code execution. This is where [waitUntilIdle()](https://github.com/rapidez/core/blob/60b9c761a6d7e7f844d854306b314b422143aae9/tests/DuskTestCaseSetup.php#L39) comes in. It will wait until there are no active network requests and the browser is idle for 500ms. This ensures that API requests do not initiate another API request. By default, we wait for 120 seconds before the tests fail, but you can change that by specifying an argument:

```php
$browser->waitUntilIdle(120);
```

### `waitUntilTrueForDuration()`

[waitUntilTrueForDuration()](https://github.com/rapidez/core/blob/60b9c761a6d7e7f844d854306b314b422143aae9/tests/DuskTestCaseSetup.php#L18) is similar to [waitUntil()](https://laravel.com/docs/11.x/dusk#waiting-on-javascript-expressions). However, sometimes the result of the expression you pass can be unstable and change to false quickly after becoming true. To account for this, we have created a function that waits until the expression remains true for a given duration.

```php
$browser->waitUntilTrueForDuration('true', 120, 0.5);
```

| Argument | Default | Description |
|---|---|---|
| `script` | `'true'` | The JavaScript expression that needs to be true to continue. |
| `timeout` | 120 | The timeout in seconds. If this is exceeded, the test will fail. |
| `for` | 0.5 | The duration in seconds that the expression needs to be true for before continuing. |

## Continuous Integration

If you would like to run the tests with a CI tool like Bitbucket Pipelines or Github Actions, you need to ensure that there is a Magento environment that Rapidez can work with. You could use a test environment for this, so you don't have to set up a Magento environment in Docker. However, you will need to create an SSH tunnel for the database connection, and for every run, orders will be created. If you have made it this far and you're interested, [ask us on Slack](https://rapidez.io/slack)!

## Static analysis

Rapidez comes with PHPStan for static analysis (`composer analyse`) and Pint (`composer style` and `composer fix-style`) for code style analysis installed by default. These can be used in automated pipelines to help keep code quality under control.

### GitHub actions

The `rapidez/rapidez` repository contains an example PHPStan workflow [here](https://github.com/rapidez/rapidez/blob/master/.github/workflows/analyse.yml). Replace `composer analyse` with `composer style` to run Pint.

### Bitbucket pipelines

If you're using Bitbucket you can set up these pipelines with a php docker container. A pipeline step to run PHPStan could look something like this:

```yaml
    - step: &analyse
        name: Static analysis
        image:
          name: $DOCKER_IMAGE
          username: $DOCKER_USERNAME
          password: $DOCKER_PASSWORD
        caches:
          - composer
        script:
          - composer install
          - cp .env.example .env
          - php artisan key:generate
          - composer analyse
```
