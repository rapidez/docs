# GraphQL

---

Magento has an excellent [GraphQL](https://devdocs.magento.com/guides/v2.4/graphql/) implementation which gives you more flexibility over the [REST API](https://devdocs.magento.com/guides/v2.4/rest/bk-rest.html). Rapidez provides some handy renderless GraphQL Vue components to communicate with GraphQL.

::: tip Examples
See the usage within the [Rapidez Repositories](https://github.com/search?l=Blade&q=org%3Arapidez+graphql&type=Code)
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
`check` | String | | Run a check on the response data, for example: `check="data.countries[0] == 'Country'"`
`redirect` | String | | Where to redirect if the check fails
`cache` | String | | Cache key in localstorage. Caches only when provided and will be prefixed with `graphql_`. Will be flushed when the [cache](cache.md) is cleared.

::: tip
With large GraphQL queries you can extract the query to a separated file, for example: `resources/views/queries/countries.graphql` and include it with: `query='@include('queries.countries')'`
:::

## Mutation

`<graphql-mutation>` component example with a newsletter subscription form:

```html
<graphql-mutation v-cloak query="mutation { subscribeEmailToNewsletter(changes) { status } }" :alert="false" :clear="true">
    <div slot-scope="{ mutate, changes, mutated, error }">
        <strong v-if="mutated">
            @lang('Thank you for subscribing!')
        </strong>
        <div v-else>
            <form v-on:submit.prevent="mutate">
                <x-rapidez::input name="email" type="email" v-model="changes.email"/>
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
`query` | String | Required | GraphQL query but the data should be replaced with `changes` so it can be replaced.
`variables` | Object | `{}` | GraphQL variables
`changes` | Object | `{}` | Set the default values `:changes="{ email: 'example@rapidez.io' }"`, useful when having the mutation component within the [`<graphql>`](graphql.md#query) component
`redirect` | String | | The redirect url
`alert` | Boolean | `true` | Show an alert when an error occurs
`clear` | Boolean | `false` | Clear the values after the mutation
`callback` | Function | | Called after the mutation
