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
[`group`](#grouping) | String | | Bundle queries by a name into 1 request [see: group](#grouping)
`check` | Function | | Run a check on the response data, for example: `check="(data) => data.countries[0] == 'Country'"`
`redirect` | String | | Where to redirect if the check fails
`cache` | String | | Cache key in localstorage. Caches only when provided and will be prefixed with `graphql_`. Flushes when the [cache](cache.md) is cleared.
`callback` | Function | | Called after the query
`error-callback` | Function | Notification | Called after an unsuccessful query

::: tip
With large GraphQL queries you can extract the query to a separated file, for example: `resources/views/queries/countries.graphql` and include it with: `query='@include('queries.countries')'`
:::

### Slot scopes

Prop | Type | Explanation
:--- | :--- | :---
`data` | Object | The data returned from the GraphQL request
`running` | Boolean | True when running
`runQuery` | Function | Run the query again

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
[`group`](#grouping) | String | | Bundle queries by a name into 1 request [see: group](#grouping)
`watch` | Boolean | `true` | Should the `variables` be watched?
`redirect` | String | | The redirect URL
`alert` | Boolean | `true` | Show an alert when an error occurs
`clear` | Boolean | `false` | Clear the values after the mutation
`notify` | Object | | Success notification
`before-request` | Function(query, variables, options): [query, variables, options] | | Called before the request is sent in order to change, must return `[query, variables, options]` if used
`callback` | Function | | Called after the mutation
`error-callback` | Function | | Called after an unsuccessful query
`mutate-event` | String | | Event name to listen to, used to trigger the mutate method
`recaptcha` | Boolean | `false` | Sends the `X-ReCaptcha` header with the request

### Slot scopes

Slot scopes are useful when wanting to get or update values or functions within the component's template.

Prop | Type | Explanation
:--- | :--- | :---
`mutate` | Function | Run the GraphQL query 
`mutated` | Boolean | True if the mutation has run
`mutating` | Boolean | True when mutating (Alias of `running`)
`running` | Boolean | True when running
`error` | String | The error message if the GraphQL request failed
`variables` | Object | GraphQL variables
`watch` | Boolean | Can be used to toggle the `watch` prop

## Grouping

With the `group` prop, you are able to bundle multiple GraphQL requests into 1 to increase performance. When one of them gets executed, the combined query will be sent.

::: warning Note
You cannot combine mutations and queries. Variable names should be unique, except `cart_id`
:::

We also provide a `submitPartials()` helper which can be used to submit multiple queries and have a callback when they're all finished. This is used in the onestep checkout to submit each section and only continue to the success page when everything is finished.

```html
<form v-on:sumbit.prevent="(e) => {
    submitPartials(e.target?.form ?? e.target)
        .then((result) => window.Turbo.visit('/success'))
        .catch()
}">
    <graphql ...>
        <fieldset partial-submit="mutate">...</fieldset>
    </graphql>
    <graphql ...>
        <fieldset partial-submit="mutate">...</fieldset>
    </graphql>
    <button type="submit">Save</button>
</form>
```





::: warning Keep in mind
`partial-submit` **must** always be on the direct child of a Vue component and have its original function name.

::: details Example
```html
<!-- Correct -->
<graphql ...>
    <div partial-submit="mutate">...</div>
</graphql>

<!-- Correct -->
<graphql ...>
    <fieldset partial-submit="mutate">...</fieldset>
</graphql>

<!-- Incorrect -->
<graphql ...>
    <fieldset>
        <div partial-submit="mutate">
            ...
        </div>
    </fieldset>
</graphql>

<!-- Incorrect -->
<graphql ...>
    <fieldset v-slot={ mutate: save } partial-submit="save">...</fieldset>
</graphql>
```
:::
