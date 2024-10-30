# GraphQL

---

Magento has an excellent [GraphQL](https://devdocs.magento.com/guides/v2.4/graphql/) implementation which gives you more flexibility over the [REST API](https://devdocs.magento.com/guides/v2.4/rest/bk-rest.html). Rapidez provides some handy renderless GraphQL Vue components to communicate with GraphQL.

::: tip Examples
See the usage within the [Rapidez Repositories](https://github.com/search?q=org%3Arapidez+graphql+language%3ABlade&type=code&l=Blade)
:::

[[toc]]

## Query

`<graphql>` component example to get a list of available countries from Magento:

```html
<graphql v-cloak query="{ countries { full_name_locale } }">
    <ul v-if="data" slot-scope="{ data }">
        <li v-for="country in data.countries">@{{ country.full_name_locale }}</li>                
    </ul>
</graphql>
```

### Props

Prop | Type | Default | Explanation
:--- | :--- | :--- | :---
`query` | String | Required | GraphQL query
`variables` | Object | `{}` | GraphQL variables
`store` | String | `window.config.store_code` | Store code
[`group`](#group) | String | | Bundle queries by a name into 1 request [see: group](#group)
`check` | String | | Run a check on the response data, for example: `check="data.countries[0] == 'Country'"`
`redirect` | String | | Where to redirect if the check fails
`cache` | String | | Cache key in localstorage. Caches only when provided and will be prefixed with `graphql_`. Flushes when the [cache](cache.md) is cleared.
`callback` | Function | | Called after the query
`error-callback` | Function | Notification | Called after a unsuccessful query

::: tip
With large GraphQL queries you can extract the query to a separated file, for example: `resources/views/queries/countries.graphql` and include it with: `query='@include('queries.countries')'`
:::

### Slot scopes

Prop | Type | Explanation
:--- | :--- | :---
`data` | Object | The data returned from the GraphQL request

## Mutation

`<graphql-mutation>` component example with a newsletter subscription form:

```html
<graphql-mutation v-cloak query="mutation visitor ($email: String!) { subscribeEmailToNewsletter(email: $email) { status } }" :alert="false" :clear="true">
    <div slot-scope="{ mutate, variables, mutated, error }">
        <strong v-if="mutated">
            @lang('Thank you for subscribing!')
        </strong>
        <div v-else>
            <form v-on:submit.prevent="mutate">
                <x-rapidez::input name="email" type="email" v-model="variables.email"/>
                <x-rapidez::button type="submit">
                    @lang('Subscribe')
                </x-rapidez::button>
            </form>
            <p v-if="error">
                @{{ error }}
            </p>
        </div>
    </div>
</graphql-mutation>
```

### Props

Prop | Type | Default | Explanation
:--- | :--- | :--- | :---
`query` | String | Required | The GraphQL query
`variables` | Object | `{}` | Set the default variables `:variables="{ email: 'example@rapidez.io' }"`, useful when having the mutation component within the [`<graphql>`](graphql-components.md#query) component
`store` | String | `window.config.store_code` | Store code
[`group`](#group) | String | | Bundle queries by a name into 1 request [see: group](#group)
`watch` | Boolean | `true` | Should the `variables` be watched?
`redirect` | String | | The redirect url
`alert` | Boolean | `true` | Show an alert when an error occurs
`clear` | Boolean | `false` | Clear the values after the mutation
`notify` | Object | | Success notification
`before-request` | Function(query, variables, options): [query, variables, options] | | Called before the request is sent in order to change, must return `[query, variables, options]` if used
`callback` | Function | | Called after the mutation
`error-callback` | Function | | Called after a unsuccessful query
`mutate-event` | String | | Event name to listen to, used to trigger the mutate method
`recaptcha` | Boolean | `false` | Sends the `X-ReCaptcha` header with the request

### Slot scopes

Slot scopes are useful when wanting to get or update values or functions within the components template.

Prop | Type | Explanation
:--- | :--- | :---
`mutate` | Function | Run the GraphQL query 
`mutated` | Boolean | True if the mutation has run
`mutating` | Boolean | True when mutating
`error` | String | The error message if the GraphQL request failed
`variables` | Object | GraphQL variables
`watch` | Boolean | Can be used to toggle the `watch` prop

## General

### Group

Imagine you want to send many GraphQL requests at the same time, do you think it will be faster to send them all separately or in a single request?

GraphQL supports sending as many queries together as you like! 

Increasing performance of your query calls, and possibly improving stability as well!

So we've added the feature to be able to do this automatically!

by adding a `group="your-group-name"` to your graphql components they will automatically be merged into a single request if they would've been sent at the same time.

You can create as many groups as you like. 

Alternatively you can use the `combiningGraphQL` function in js.
```js
import { combiningGraphQL } from 'Vendor/rapidez/core/resources/js/fetch'

const response = await combiningGraphQL(query, variables, {}, group)
```

#### Caveats

There are some caveats to using this though:

1. Mutations and Queries can not be combined, you should give them their own name.
2. If you're sending variables they **can not** have the same name, if they conflict in name an error will be thrown.
  The only variable where this is allowed, is `cart_id`

### submitFieldsets

If you have multiple graphql components which may or may not exist on the page, that need to all be executed before continuing in a form `submitFieldsets` can help.

`submitFieldsets` is being used in order to make the onestepcheckout to multiplestepcheckout work without having to recreate the form fieldsets for every combination.

The way it works is that you call `submitFieldsets(element)` when you want to call all `data-function` functions within that element.

then you can chain `.then()` in order to do what should happen when all functions have successfully completed.

`data-function` **must** always be on the direct child of a Vue component, and have it's original function name. Here are some examples:

```html
<!-- Correct -->
<graphql ...>
  <div data-function="mutate">...</div>
</graphql>
<!-- Correct -->
<graphql ...>
  <fieldset data-function="mutate">...</fieldset>
</graphql>
<!-- Inorrect -->
<graphql ...>
  <fieldset>
    <div data-function="mutate">
      ...
    </div>
  </fieldset>
</graphql>
<!-- Inorrect -->
<graphql ...>
  <fieldset v-slot={ mutate: save } data-function="save">...</fieldset>
</graphql>
```

An example of how it can be implemented:

```html
<form v-on:sumbit.prevent="v-on:submit.prevent="(e) => {submitFieldsets(e.target?.form ?? e.target).then((result) => window.Turbo.visit('/success')).catch()}">
  <graphql ...>
    <fieldset data-function="mutate">...</fieldset>
  </graphql>
  <graphql ...>
    <fieldset data-function="mutate">...</fieldset>
  </graphql>
  <button type="submit">Save</button>
</form>
```
