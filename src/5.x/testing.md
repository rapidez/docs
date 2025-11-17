# Testing

---

Rapidez is built upon [Laravel](https://laravel.com/), so you have access to its [testing suite](https://laravel.com/docs/12.x/testing). On top of that there is a full [Playwright](https://playwright.dev/) test suite available!

[[toc]]

## Installation

Rapidez already includes some tests in the core. To install and to use these tests, you can run the following command. This will publish all the tests to your project.

```bash
php artisan rapidez:install:tests
```

## Running tests

- PHPUnit: `vendor/bin/phpunit` (feature tests)
- Playwright: `npx playwright test --ui` (browser tests)

## Writing tests

All tests are located in the `/tests` folder:

- `/tests/playwright` -> [Laravel testing docs](https://laravel.com/docs/12.x/testing)
- `/tests/Feature` -> [Playwright docs](https://playwright.dev/docs/intro)

## Static analysis

Rapidez comes with [PHPStan](https://phpstan.org/) for static analysis and [Laravel Pint](https://laravel.com/docs/12.x/pint) for code style analysis. These can be used in to keep the code quality high. The available commands:

- PHPStan: `composer analyse`
- Pint test: `composer style`
- Pint fix: `composer fix-style`

## Continuous Integration

Have a look at the [Github workflows within the Rapidez Core](https://github.com/rapidez/core/tree/master/.github/workflows). Need help? For example with running it on another platform like Bitbucket Pipelines? Or, to run the tests with your Magento environment instead of a demo environment in Docker? [Ask us on Slack!](https://rapidez.io/slack)
