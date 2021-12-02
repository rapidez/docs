# Deployment

---

Have a look at the [Laravel deployment docs](https://laravel.com/docs/master/deployment) and make sure [CORS is opened up](installation.md#cors).

[[toc]]

## Redirecting Magento to Rapidez

The Magento frontend should not be accessible anymore as you're using Rapidez. But GraphQL, media, admin, etc should be reachable. Create a redirect rule to accomplish that, for example with Nginx:
```
location ~* ^\/(?!api|graphql|static|media|admin) {
    return 301 $scheme://your-rapidez-url.com$request_uri;
}
```
Make sure the change the admin location and url. Place this below the Magento location directives, for example [here in the sample Nginx config](https://github.com/magento/magento2/blob/203a44f9e755fa6d2e057f1b99efbaff17546a80/nginx.conf.sample#L222).

## Secure Elasticsearch

You've to secure your Elasticsearch instance so other people can't manipulate the data in it as it needs to be exposed for Reactive Search.

- Enable security in `elasticsearch.yml` with: `xpack.security.enabled: true`
- Change `http.cors.allow-origin` to your domain
- Restart Elasticsearch (with Docker: `docker restart rapidez_elasticsearch`)
- Setup a password with `bin/elasticsearch-setup-passwords auto` (or use `interactive` to choose the passwords yourself, with Docker prepend `docker exec rapidez_elasticsearch `)
- Add your credentials to `.env`
```
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASS=YOUR-PASSWORD
```
- Create a proxy (with SSL) on a subdomain
```
location / {
        proxy_pass http://localhost:9200;
}
```
- Repeat this step for Kibana which should be running on port 5601
- Set the credentials in `kibana.yml`
```yaml
elasticsearch.username: "elastic"
elasticsearch.password: "YOUR-PASSWORD"
```
- Login to Kibana and go to Management > Roles
- Add a new role `web`. It only needs one index privilege; use `rapidez_*` for the indices and `read` as privilege.
- Create an user `web`, password `rapidez` and the `web` role
- Add the url to your `.env`
```
ELASTICSEARCH_URL=https://web:rapidez@elasticsearch.domain.com
```

## Magento 2 Docker

::: warning
This is only needed if you'd like to run the [Magento 2 demo webshop](installation.md#demo-magento-2-webshop) on a server.
:::

Just proxy everything to a subdomain and use that domain as `MAGENTO_URL` in the `.env`. With Laravel Forge this is really easy; just create another website on your server, setup SSL and edit the Nginx config
```
location / {
    proxy_pass http://127.0.0.1:1234;
    proxy_redirect off;
    proxy_read_timeout 60;
    proxy_connect_timeout 60;
    
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $host;
}
```
Use the MySQL credentials from the container in the `.env`
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=magento
DB_USERNAME=magento
DB_PASSWORD=password
```
