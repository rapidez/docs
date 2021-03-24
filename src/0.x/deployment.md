# Deployment

---

Have a look at the [Laravel deployment docs](https://laravel.com/docs/master/deployment) and make sure [CORS is opened up](installation.md#cors).

[[toc]]

## Secure Elasticsearch

You've to secure your Elasticsearch instance so other people cannot manipulate the data in it as it need to be exposed for Reactive Search.

- Enable security in `elasticsearch.yml` with: `xpack.security.enabled: true`
- Change `http.cors.allow-origin` to your domain
- Restart Elasticsearch (with Docker: `docker restart rapidez_elasticsearch`)
- Setup a password with `bin/elasticsearch-setup-passwords auto` (or use `interactive` to choose the passwords yourself, with Docker prepend `docker exec rapidez_elasticsearch `)
- Edit your `.env` and add the credentials
```dotenv
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASS=YOUR-PASSWORD
```
- Create a proxy (with SSL) on a subdomain
```nginx
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
- Add a new role `web`. It only needs one index privilege; use a `*` for the indices and `read` as privilege.
- Create an user `web`, password `rapidez` and the `web` role
- Add this to your `.env`
```dotenv
ELASTICSEARCH_URL=https://web:rapidez@elasticsearch.domain.com
```

## Magento 2 Docker

::: warning
This is only needed if you'd like to run the [Magento 2 demo webshop](installation.md#demo-magento-2-webshop) on a server.
:::

Just proxy everything to a subdomain and use that domain as `MAGENTO_URL` in the `.env`. With Laravel Forge this is really easy; just create another website on your server, setup SSL and edit the Nginx config
```nginx
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
```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=magento
DB_USERNAME=magento
DB_PASSWORD=password
```
