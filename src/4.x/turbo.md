# Turbo

---

[Turbo](https://turbo.hotwired.dev/) [Drive](https://turbo.hotwired.dev/handbook/drive) is used to accelerate navigation between pages by intercepting navigations, loading content via AJAX negating the need for full page reloads.

[[toc]]

## Turbo Frames

[Turbo Frames](https://turbo.hotwired.dev/handbook/frames) makes it possible to load parts of a page via AJAX. This could also be used to reduce the initial DOM size, for example by loading the content of a mega menu with it when the menu opens. With the `<turbo-frame>` Vue doesn't work, that's why there is a `<vue-turbo-frame>` Vue component.

### Usage

The component works similarly to a regular `<turbo-frame>`, but includes pre-configured performance optimizations. An example with a menu that loads fully when it's visible within the browser:

```html
<vue-turbo-frame src="/menu-with-submenus" id="menu">
    <ul>
        <li>Just the top level menu items</li>
        <li>Those which should be visible directly</li>
    </ul>
</vue-turbo-frame>
```

And the route that is just serving a Blade template:

```php
Route::view('/menu-with-submenus', 'turbo-frames.menu');
```

And the `resources/views/turbo-frames/menu.blade.php` content:

```html
<turbo-frame id="menu">
    <ul>
        <li>Just the mega menu top level items
            <ul>
                <li>But now with all sub levels</li>
            </ul>
        </li>
        <li>Those which should be visible directly
            <any-vue-component>
                Vue Components do work!
            </any-vue-component>
        </li>
    </ul>
</turbo-frame>
```

---

Another example where the whole menu is behind a toggle:

```html
<details>
    <summary>Menu</summary>
    <vue-turbo-frame id="menu" src="/menu-with-submenus">
        Loading...
    </vue-turbo-frame>
</details>
```

### Default attributes

The component adds these defaults:

| Attribute | Value | Description |
|------|-------|-------------|
| `loading` | `lazy` | Content only loads when it scrolls into view, improving initial page load performance |
| `target` | `_top` | Ensures links navigate the whole page instead of staying within the frame |
