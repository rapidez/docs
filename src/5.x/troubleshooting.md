# Troubleshooting

---

- Make sure Magento is functioning correctly.
- Validate the settings using `php artisan rapidez:validate`.
- Clear all of the application cache by running `php artisan optimize:clear`.
- Check if you're using full page caching (e.g. statamic's static caching) and clear that.
  - Tip: You can also work around cache entirely by adding a random query parameter to the end of your url.
- Reindex the products by executing `php artisan rapidez:index`.
- Clear the browser cache. In Google Chrome, click on the "Clear site data" button located on the application tab in DevTools.
- Join the [Rapidez Slack](https://rapidez.io/slack) and ask your questions!
