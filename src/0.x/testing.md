# Testing

---

[[toc]]

## Introduction

Rapidez is built upon [Laravel](https://laravel.com/) so you have its [full testing suite](https://laravel.com/docs/10.x/testing) including [Laravel Dusk](https://laravel.com/docs/10.x/dusk) available to you.

Dusk is most likely what you'll be using to write your tests.

## Installation

Rapidez already has some tests included in the core. To install and configure dusk, and to use these tests you can run the following command.

```bash
php artisan rapidez:install:tests
```

::: tip Note
Laravel Dusk expects a [ChromeDriver](https://chromedriver.chromium.org/) compatible browser to be installed by default. 
This means the system you want to run your tests on will need to have [Chrome](https://www.google.com/chrome/) or [Chromium](https://www.chromium.org/Home/) installed.
:::

## Configuring the driver

```bash
php artisan rapidez:install:tests
```
already installs and configures the chromedriver to be used for testing. 
But we have noticed some issues in running the driver in some cases, like using [this image](https://github.com/chilio/laravel-dusk-ci) in Bitbucket pipelines.

For the chillio dusk image you will need to add [--no-sandbox](https://github.com/chilio/laravel-dusk-ci#usage:~:text=especially-,%2D%2Dno%2Dsandbox,-in%20%24options%20for) to the [driver options](https://github.com/laravel/dusk/blob/1cc21a38e2a291c8e070d8bc680c39402a0f03cb/stubs/DuskTestCase.stub#L37)

On Bitbucket (and other pipelines/actions) we have noticed the connection to the chromedriver times out sometimes. This can be fixed by raising the timeout for the [RemoteWebDriver](https://github.com/laravel/dusk/blob/1cc21a38e2a291c8e070d8bc680c39402a0f03cb/stubs/DuskTestCase.stub#L41)
```diff
        return RemoteWebDriver::create(
            $_ENV['DUSK_DRIVER_URL'] ?? 'http://localhost:9515',
            DesiredCapabilities::chrome()->setCapability(
                ChromeOptions::CAPABILITY, $options
-           )
+           ),
+           35000, // Connection Timeout
+           90000 // Request Timeout
        );
```

## Writing tests

After the command has finished you'll find that your `/tests/` folder contains `Browser` and `Feature`.

### Feature tests

The feature tests work exactly like Laravel does so we suggest looking through the [testing documentation](https://laravel.com/docs/10.x/testing) for that.

### Browser tests (Dusk tests)

Dusk or Browser tests are also covered by the [Laravel documentation](https://laravel.com/docs/10.x/dusk). However we do have some extras to aid in testing Rapidez.

#### Additional functions

To aid in testing rapidez we have added extra functions to Dusk.

##### WaitUntilIdle

```php
$browser->waitUntilIdle(120);
```

Since Rapidez has many API calls and code running in the background, sometimes we want to make sure these requests have completed and the browser is idling and no longer executing code. This is what [waitUntilIdle](https://github.com/rapidez/core/blob/60b9c761a6d7e7f844d854306b314b422143aae9/tests/DuskTestCaseSetup.php#L39) is for.

It will wait until no network request is active and the browser being idle for 500ms.

| Argument | default | Description |
|---|---|---|
| 1) timeout | 120 | The timeout in seconds, if this is exceeded the test will fail. |

##### waitUntilTrueForDuration

```php
$browser->waitUntilTrueForDuration('true', 120, 0.5);
```

[waitUntilTrueForDuration](https://github.com/rapidez/core/blob/60b9c761a6d7e7f844d854306b314b422143aae9/tests/DuskTestCaseSetup.php#L18) is similar to [waitUntil](https://laravel.com/docs/10.x/dusk#waiting-on-javascript-expressions) however since sometimes the result of an expression you pass can be unstable and change to false quickly after it was true we have created a function to wait until it is true for a duration.

| Argument | default | Description |
|---|---|---|
| 1) script | "true" | The javascript expression that needs to be true to continue. |
| 2) timeout | 120 | The timeout in seconds, if this is exceeded the test will fail. |
| 3) for | 0.5 | How long in seconds the expression needs to be true for before continuing. |

## Additional info

### Bitbucket

When using Bitbucket pipelines we recommend to use an after-script to upload the dusk result to Bitbucket.

```yml
    - step:
        name: Dusk Tests
        services:
          - chrome
        artifacts:
          paths:
            - .bitbucket/dusk_result/**
        script:
          - php artisan dusk:chrome-driver --detect
          - php artisan serve --host=0.0.0.0 --port=80 > /dev/null 2>&1 &
          - php artisan dusk --log-junit ./test-reports/junit.xml
        after-script:
          - if [ $BITBUCKET_EXIT_CODE -eq 0 ]; then exit 0; fi
          - mkdir -p  .bitbucket/dusk_result/
          - cp -r tests/Browser/screenshots/ .bitbucket/dusk_result/
          - cp -r tests/Browser/console/ .bitbucket/dusk_result/
          - cp -r storage/logs/ .bitbucket/dusk_result/
```
