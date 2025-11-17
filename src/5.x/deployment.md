# Deployment

---

[[toc]]

## Checklist

- Check the [Laravel deployment docs](https://laravel.com/docs/12.x/deployment)
- Make sure the server meets the [requirements](installation.md#requirements)
- Check all [configurations](configuration.md)
- [Configure CORS](installation.md#cors)
- Make sure the [flat tables are enabled](installation.md#flat-tables)
- If you're upgrading, check the [upgrade notes](upgrading.md)
- Configure the [indexer](indexer.md) in the [scheduler](indexer.md#scheduler) or with [webhooks](indexer.md#webhook)
- [Redirect Magento](#redirecting-magento)
- [Secure Elasticsearch](#secure-elasticsearch)
- Check your `.env`
  - Set `APP_ENV` to `production`
  - Change the `RAPIDEZ_TOKEN` to something random
  - Make sure these values are `false`
    - `APP_DEBUG`
    - `VITE_DEBUG`
    - `DEBUGBAR_ENABLED`
- Optionally [configure your multistore](installation.md#multistore)
- Optionally [setup full page caching](cache.md#full-page-caching)
- Make sure `php artisan optimize` is within your deployment script
- Issues? Check see [troubleshooting](troubleshooting.md)

## Redirecting Magento

The Magento frontend should not be accessible anymore as you're using Rapidez. But GraphQL, media, admin, etc should be reachable. Create a redirect rule to accomplish that, for example with Nginx:
```nginx
location ~* ^\/(?!(rest|graphql|static|media|admin)(\/|$)) {
    return 301 $scheme://your-rapidez-url.com$request_uri;
}
```
Make sure to change the admin location and URL. Place this below the Magento location directives, for example [here in the sample Nginx config](https://github.com/magento/magento2/blob/203a44f9e755fa6d2e057f1b99efbaff17546a80/nginx.conf.sample#L222).

## Secure Elasticsearch

You have to secure your Elasticsearch instance so other people can't manipulate the data in it as it needs to be exposed for InstantSearch.

- Enable security in `elasticsearch.yml` with: `xpack.security.enabled: true`
  - On Ubuntu: `/etc/elasticsearch/elasticsearch.yml`
- Change `http.cors.allow-origin` to your domain
- Restart Elasticsearch
  - On Ubuntu: `sudo service elasticsearch restart`
  - With Docker: `docker restart rapidez_elasticsearch`
- Setup a password with `bin/elasticsearch-setup-passwords auto` (or use `interactive` to choose the passwords yourself)
  - On Ubuntu, from: `cd /usr/share/elasticsearch/`
  - With Docker, prefix with: `docker exec rapidez_elasticsearch `
- Add your credentials to `.env`
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

### Kibana

::: tip No Kibana running?
You can also secure Elasticsearch without it, see: [Without Kibana](#without-kibana)
:::

- Repeat this step for Kibana which should be running on port 5601
- Set the credentials in `kibana.yml`
```yaml
elasticsearch.username: "elastic"
elasticsearch.password: "YOUR-PASSWORD"
```
- Login to Kibana and go to Management > Roles
- Add a new role `web`. It only needs one index privilege; use `rapidez_*` for the indices and `read` as privilege.
- Create a user `web`, password `rapidez` and the `web` role
- Add the URL to your `.env`

```dotenv
ELASTICSEARCH_URL=https://web:rapidez@elasticsearch.domain.com
```

### Without Kibana

Run the following commands:

```bash
# Create the role `web` that may read `rapidez_*` indexes
curl -X POST "localhost:9200/_security/role/web?pretty" -H 'Content-Type: application/json' -d'
{
  "indices": [
    {
      "names": [ "rapidez_*" ],
      "privileges": ["read"]
    }
  ]
}
' -u username:password
```

Then create the user.

```bash
# Create the user `web` with password `rapidez`
curl -X POST "localhost:9200/_security/user/web?pretty" -H 'Content-Type: application/json' -d'
{
  "password" : "rapidez",
  "roles" : [ "web" ]
}
' -u username:password
```

Finally add the URL to your `.env`
```dotenv
ELASTICSEARCH_URL=https://web:rapidez@elasticsearch.domain.com
```

## Secure OpenSearch

You have to secure your OpenSearch instance so other people can't manipulate the data in it as it needs to be exposed for InstantSearch. Add this in your [`opensearch.yml`](https://docs.opensearch.org/docs/latest/install-and-configure/configuring-opensearch/index/#configuration-file)
```yaml
http.cors.enabled: true
http.cors.allow-credentials: true
http.cors.allow-origin: "https://your-rapidez-store.com"
http.cors.allow-headers: X-Requested-With, X-Auth-Token, Content-Type, Content-Length, Authorization, Access-Control-Allow-Headers, Accept
```

You will need to create a rapidez/web user as well in the [`internal_users.yml`](https://docs.opensearch.org/docs/latest/security/configuration/yaml/#internal_usersyml)
```yaml
web:
  hash: "WEB_PASSWORD_REPLACEME"
  reserved: true
  backend_roles:
  - "rapidez"
  description: "Public web user"
```

Then link that user to the role we are about to create in the [`roles_mapping.yml`](https://docs.opensearch.org/docs/latest/security/configuration/yaml/#roles_mappingyml)
```yaml
rapidez:
  reserved: false
  users:
  - "web"
  backend_roles:
  - "rapidez"
  description: "Allow read only access to indexes prefixed with rapidez_"
```

Create the role with the correct permissions to the `rapidez_` indexes in the [`roles.yml`](https://docs.opensearch.org/docs/latest/security/configuration/yaml/#rolesyml)
```yaml
rapidez:
  reserved: false
  cluster_permissions:
    - "indices:data/read/msearch"
    - "indices:data/read/msearch/template"
  index_permissions:
    - index_patterns:
        - 'rapidez_*'
      allowed_actions:
        - "indices:data/read/scroll"
        - "indices:data/read/scroll/clear"
        - "indices:data/read/mget"
        - "indices:data/read/mget*"
        - "indices:data/read/search"
        - "indices:data/read/search*"
        - "indices:data/read/msearch"
        - "indices:data/read/msearch/template"
        - "indices:data/read/search/template"
        - "indices:data/read/mtv"
        - "indices:data/read/mtv*"
        - "indices:data/read/search/template/render*"
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
