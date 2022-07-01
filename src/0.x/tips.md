# Tips

---

[[toc]]

## Lighthouse

By default Rapidez is optimized for Lighthouse. To keep the scores high we've listed some tips.

### Server Push

To improve the Lighthouse scores even more you could use Server Push because [Early Hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103) is not yet integrated in all major browsers. For example with [laravel-HTTP2ServerPush](https://github.com/JacobBennett/laravel-HTTP2ServerPush) (or use [this fork](https://github.com/royduin/laravel-HTTP2ServerPush) as of [this PR](https://github.com/JacobBennett/laravel-HTTP2ServerPush/pull/52)). Keep in mind that this requires HTTP/2, if you're using Cloudflare you should disable HTTP/3 as they didn't implement Server Push into it.
