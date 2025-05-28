# Intro

---

The idea behind Rapidez is to have a blazing fast headless frontend for your Magento 2 webshop, which should be very easy to customize. The frontend is separated from the Magento installation, and communication between them is done with GraphQL. To speed things up, Rapidez also queries the Magento database to get, for example, catalog information. For category pages and filters, Rapidez uses InstantSearch, which uses ElasticSearch as a database. Indexing into ElasticSearch is also taken care of and is pretty fast.
