Use Redis to store data related to the express idempotency middleware.

# Redis adapter for express-idempotency

Allow the [express-idempotency](https://github.com/VilledeMontreal/express-idempotency) to store data in a Redis data store.

This is a [Node.js](https://nodejs.org/) module designed to work with Express, available through the [NPM registry](https://www.npmjs.com/).

## Features

- Provides adapter to support Redis
- Allows the use of time-to-live (TTL) indexes to manage data

## Getting started

Install the dependency.

```
$ npm install express-idempotency-redis-adapter
```

Integrate the data adapter during the middleware initialization.

```javascript
const idempotency = require("express-idempotency");
const RedisAdapter = require("express-idempotency-redis-adapter").default;

// New Redis Adapter that will be used by the idempotency middleware
const adapter = new RedisAdapter({
  connectionConfig: { url: "redis://localhost:6379" },
});

adapter.connect().catch((error) => {
  throw error;
});

// Add the idempotency middleware by specifying the use of the redis adapter
app.use(
  idempotency.idempotency({
    dataAdapter: adapter,
  })
);
```

The data adapter will take care of everything required to store data from the express idempotency middleware.

### Options

You can optionally configure the data adapter by providing options during initialization.

| Property           | Mandatory | Default | Description                                                                                                                 |
| ------------------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| ttl                | false     | 86400   | Time to live, in seconds. It will remove a resource after a certain period of time. Default is 86400 (1 day)                |
| connectionConfig   | false     |         | Node-Redis client configuration settings. See: https://github.com/redis/node-redis/blob/master/docs/client-configuration.md |
| connectionInstance | false     |         | Existing instance of Node-Redis                                                                                             |

> Note: You can only pass either `connectionConfig` or `connectionInstance`

#### Redis configuration

The data adapter can manage connection itself by providing a Redis configuration. It will use the [node-redis](https://github.com/redis/node-redis) package.

You might want to manage connection externally by having a singleton client. In this case, you can provide an existing instance of `node-redis` to the data adapter.

#### Time-to-live (TTL)

The data adapter will create TTL indexes to purge data from collection after a certain period of time. By default, the ttl is `1 day` but it is configurable.

## License

The source code of this project is distributed under the [MIT License](LICENSE).
