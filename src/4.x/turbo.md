# Turbo

---

This page covers Turbo and its integration with Rapidez for enhanced performance and user experience.

[[toc]]

## What is Turbo?

[Turbo](https://turbo.hotwired.dev/) accelerates web applications by intercepting navigation and form submissions, loading content via AJAX without full page refreshes. In Rapidez, we primarily use **Turbo Drive** to update page content while keeping shared elements like headers and footers in place.

::: tip Performance Benefits
This approach significantly reduces bandwidth usage and improves perceived performance, especially noticeable on slower connections or mobile devices.
:::

## Vue Turbo Frame Component

The `vue-turbo-frame` component enables you to load Vue components inside Turbo Frames. This solves the common issue where Vue components don't render correctly when content is loaded via Turbo Frame navigation.

### Usage

The component works similarly to a regular `turbo-frame`, but includes pre-configured performance optimizations:

```html
<!-- In your main Blade template -->
<vue-turbo-frame src="/path-to-your-content" id="my-frame">
    <!-- Loading content shown before frame loads -->
    <div>Loading cool stuff...</div>
</vue-turbo-frame>
```

The content served by the `src` URL should contain a regular `turbo-frame` with your Vue component:

```html
<!-- In the Blade file that serves /path-to-your-content -->
<turbo-frame id="my-frame">
    <my-vue-component>
        <!-- Content shown after frame loads -->
        This works now, yippie! 🚀
    </my-vue-component>
</turbo-frame>
```

### Default Props

The component includes these optimized defaults:

| Prop | Value | Description |
|------|-------|-------------|
| `loading` | `lazy` | Content only loads when it scrolls into view, improving initial page load performance |
| `target` | `_top` | Ensures links navigate the whole page instead of staying within the frame |

### Performance Benefits

- **Lazy Loading**: Content loads only when needed, reducing initial page weight
- **Proper Navigation**: Links behave as expected, navigating the entire page
- **Vue Compatibility**: Vue components render correctly within Turbo Frame content
- **Seamless Integration**: Works with existing Turbo Frame functionality

### Route Configuration

Make sure you have the corresponding web route set up to serve the content:

```php
Route::get('/path-to-your-content', function () {
    return view('your.blade.template');
});
```

::: tip Performance Optimization
The lazy loading feature significantly improves page load times, especially for content below the fold. Consider using this component for any heavy Vue components or content that doesn't need to be immediately visible.
:::
