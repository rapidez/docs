# Semantic Search

---

With semantic search it's possible to understand the meaning of words by utilizing vector searches. You can get results on for example "clothing", dispite that word isn't used in any product information. It knows a "shirt" or "pants" are related to "clothing". There are also multilangual machine learning models so it's possible to search in multiple languages without the need to translate anything. So in Dutch "kleding" or "tas voor op je rug" also returns results.

[[toc]]

## Preperation

Make sure you're familiar with [InstantSearch](https://github.com/algolia/instantsearch), that's what we're using for the autocomplete and product listings; like the category pages, the search page and product sliders. [Indexing](indexer.md) is handled by [Laravel Scout](https://laravel.com/docs/12.x/scout) and to make [InstantSearch](https://github.com/algolia/instantsearch) compatible with [Elasticsearch](https://www.elastic.co/elasticsearch) / [OpenSearch](https://opensearch.org) we're using [Searchkit](https://github.com/searchkit/searchkit). More docs on related topics:

- [Requirements](installation.md#requirements)
- Elasticsearch: [configuration](configuration.md#elasticsearch), [CORS](installation.md#elasticsearch) and [secure](deployment.md#secure-elasticsearch)
- OpenSearch: [configuration](configuration.md#opensearch), [CORS](installation.md#opensearch) and [secure](deployment.md#secure-opensearch)
- [Listing component](theming.md#listing-component)
- [Extending the autocomplete](extending.md#autocomplete)
- [Eventy filters](package-development.md#eventy-filters)

## Requirements

It's possible to use semantic search with Elasticsearch and OpenSearch. With OpenSearch it's a free feature to load a machine learning model within OpenSearch which creates the vectors. For Elasticsearch you've to take care of the vector creation yourself or use a paid subscription.

## Configuration

### Elasticsearch

Have a look at the [semantic search Searchkit docs](https://www.searchkit.co/docs/tutorials/semantic-search). Keep in mind this requires a paid subscription! More info in the [Elasticsearch semantic search docs](https://www.elastic.co/docs/solutions/search/semantic-search).

### OpenSearch

Follow [this gist](https://gist.github.com/dtaivpp/d7e8d8a3ee5debaf896ed2f45b915ad3), [read the linked blog](https://tippybits.com/should-you-be-doing-vector-search/) or check out [this Youtube video](https://www.youtube.com/watch?v=lpQiJGpeeWU). But also check the [OpenSearch docs about semantic search](https://docs.opensearch.org/docs/latest/vector-search/ai-search/semantic-search/) and the [semantic search tutorial](https://docs.opensearch.org/docs/latest/tutorials/vector-search/neural-search-tutorial/).

### Sentence Transformers

With the configuration of Elasticsearch / OpenSearch you'll need to pick a sentence transformer model. The defaults in the tutorials are pretty good but you've to experiment with different models to see which one returns the best results for you. [More info on pretrained models](https://www.sbert.net/docs/sentence_transformer/pretrained_models.html) and if you're looking for a multilingual model; [switch to a different model that supports multiple languages](https://www.sbert.net/docs/sentence_transformer/pretrained_models.html#multilingual-models)

## Installation

::: info NOTE
These examples are using OpenSearch!
:::

### Backend

The easiest way to install semantic search capabilities within Rapidez is with [Eventy filters](package-development.md#eventy-filters) from your `AppServiceProvider`. First you need to add these index settings:

```php
Eventy::addFilter('index.product.settings', fn ($settings) => array_merge_recursive($settings, [
    'index.knn' => true,
    'default_pipeline' => 'embedding-ingest-pipeline',
    'index.search.default_pipeline' => 'hybrid-search-pipeline'
]));
```

Create an extra field with all data you'd like to be used for the vector. With the Magento sample data you could do something like this:
```php
Eventy::addFilter('index.product.data', fn ($data) => array_merge_recursive($data, [
    'content' => implode(' - ', [
        'Product name: '.$data['name'],
        'SKU: '.$data['sku'],
        'Price: '.$data['price'].' euro',
        'Activity: '.implode(', ', $data['activity'] ?? []),
        'Material: '.implode(', ', $data['material'] ?? []),
        'Style general: '.implode(', ', $data['style_general'] ?? []),
        'Style bottom: '.implode(', ', $data['style_bottom'] ?? []),
        'Climate: '.implode(', ', $data['climate'] ?? []),
        'Pattern: '.implode(', ', $data['pattern'] ?? []),
        'Gender: '.implode(', ', $data['gender'] ?? []),
        'Description: '.strip_tags($data['description']),
    ]
)]));
```
Experiment with different data or split data in multiple fields so it's possible to search independently and apply boosts on certain data. This field also needs a mapping:

```php
Eventy::addFilter('index.product.mapping', fn ($mapping) => array_merge_recursive($mapping, [
    'properties' => [
        'content_embedding' => [
            'type' => 'knn_vector',
            'dimension' => 512,
            'method' => [
                'name' => 'hnsw',
                'space_type' => 'innerproduct',
                'engine' => 'faiss',
            ]
        ],
    ],
]));
```

::: info NOTE
Keep in mind this needs to match with your model and configurations within OpenSearch!

[More info on methods and engines](https://docs.opensearch.org/docs/latest/field-types/supported-field-types/knn-methods-engines/)
:::

Now everything is configured, run the [indexer](indexer.md):
```bash
php artisan rapidez:index
```

::: tip
Alternatively if you've [overwritten the product model](extending.md#models) you can use these methods within the product model instead of using Eventy:

- `indexMapping()`
- `indexSettings()`
- `toSearchableArray()`

See the [Laravel Scout docs](https://laravel.com/docs/12.x/scout), the [extending indexer docs](indexer.md#model) and the current [searchable trait](https://github.com/rapidez/core/blob/master/src/Models/Traits/Product/Searchable.php) used by the [product model](https://github.com/rapidez/core/blob/master/src/Models/Product.php).
:::

### Frontend

The query used to get search results needs to include our new vector field. We can overwrite the query with the `query` prop on the [listing component](theming.md#listing-component). First [publish the Blade template](theming.md#views) and edit: `resources/views/vendor/rapidez/components/listing.blade.php`


Add a a new custom function name:
```php
<listing
    ...
    :query="semanticSearch" // [!code focus]
>
```

And create that function in `resources/js/app.js`:
```js
Vue.prototype.semanticSearch = (query, searchAttributes, config) => {
    let finalQuery = Vue.prototype.relevanceQueryMatch(query, searchAttributes, config.fuzziness)

    finalQuery.bool.should.push({
        'neural': {
            'semantic_embedding': {
                'query_text': query,
                'model_id': 'YOUR-MODEL-ID',
                'min_score': 0.9,
            }
        }
    })

    return finalQuery
}
```

::: tip
Read the [OpenSearch docs on neural queries](https://docs.opensearch.org/docs/latest/query-dsl/specialized/neural/)
:::

:::: warning Temporary workaround
Until [this pull request](https://github.com/searchkit/searchkit/pull/1408) is merged you also need to add this so we can use the default query.
::: details relevanceQueryMatch function
```js
// From: https://github.com/searchkit/searchkit/blob/main/packages/searchkit/src/transformRequest.ts
// See: https://github.com/searchkit/searchkit/pull/1408
Vue.prototype.relevanceQueryMatch = (query, search_attributes, fuzziness = "AUTO:4,8") => {
    const getFieldsMap = (boostMultiplier) => {
        return search_attributes.map((attribute) => {
            return typeof attribute === "string" ? attribute : `${attribute.field}^${(attribute.weight || 1) * boostMultiplier}`;
        });
    };
    return {
        bool: {
            should: [
                {
                    bool: {
                        should: [
                            {
                                multi_match: {
                                    query,
                                    fields: getFieldsMap(1),
                                    fuzziness
                                }
                            },
                            {
                                multi_match: {
                                    query,
                                    fields: getFieldsMap(0.5),
                                    type: "bool_prefix"
                                }
                            }
                        ]
                    }
                },
                {
                    multi_match: {
                        query,
                        type: "phrase",
                        fields: getFieldsMap(2)
                    }
                }
            ]
        }
    };
}
```
:::
::::


