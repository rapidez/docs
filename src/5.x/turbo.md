---
description: Rapidez is using Turbo, but you can make things even faster with Turbo Frames.
---

# Turbo

---

[Turbo](https://turbo.hotwired.dev/) [Drive](https://turbo.hotwired.dev/handbook/drive) is used to accelerate navigation between pages by intercepting navigations, loading content via AJAX negating the need for full page reloads.

[[toc]]

## Turbo Frames

[Turbo Frames](https://turbo.hotwired.dev/handbook/frames) makes it possible to load parts of a page via AJAX. This could also be used to reduce the initial DOM size, for example, by loading the content of a mega menu with it when the menu opens.

To make usage simpleRapidez provides a directive for this purpose.

### How It Works

When you render a turbo frame:
1. The intended view is rendered with `$complete = false` directly in the DOM
2. A turbo frame element is lazily created
3. The turbo frame loads the same view via AJAX, but with `$complete = true`
4. Once loaded, the turbo frame replaces the initial placeholder with the complete view

### Usage

#### Step 1

Define the turbo frame in your `frontend.php` config:

```php
'turbo_frames' => [
    'navigation' => 'header.navigation.index',
],
```

The first part is the frame ID, and the second part is the view path as you would use it in blade.

#### Step 2

Use the `@turboframe` directive to render the frame in your blade file:

```blade
@turboframe('navigation')
```

This renders the intended view with the `$complete` variable set to `false` directly on the page, and creates a turbo frame that will lazily overwrite this with the same view, but with `$complete` set to `true`. **In other words, you should show a placeholder when `$complete` is set to false, and the real thing when `$complete` is true.**

#### Step 3

Separate the heave content out of your blade file and add a placeholder.

For example, if your view looks like this, with one heavy query or section that generates a lot of HTML:

```blade
<div class="...">
    Lorem ipsum dolor sit amet...
    @foreach (config('rapidez.models.category')::all() as $category)
        <div>{{ $category->name }}</div>
        @include('category.index', ['category' => $category])
    @endforeach
</div>
```

You could modify the view like so:

```blade
<div class="...">
    Lorem ipsum dolor sit amet...
    @if ($complete)
        @foreach (config('rapidez.models.category')::all() as $category)
            <div>{{ $category->name }}</div>
            @include('category.index', ['category' => $category])
        @endforeach
    @else
        {{-- You can also add a loading state if necessary! --}}
        <div>Loading...</div>
    @endif
</div>
```

::: tip $complete variable
The `$complete` variable will always be set in the turbo frame context, but if you ever include this view manually this variable will not exist.
:::

### Caching

Turbo frames use the following cache control middleware:

```
cache.headers:public;max_age=3600;stale_while_revalidate=3600;etag
```

Since these are standard GET request routes, any sort of static caching will also apply.

::: note Cache key
The Rapidez cache key is part of the route path. This means that clearing the cache will generate a new route for all turbo frames. This ensures that any other caching can be worked around when the content of the turbo frame changes.
:::
