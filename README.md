# feathers rest Client for admin-on-rest

For using [feathers](https://www.feathersjs.com) with [admin-on-rest](https://github.com/marmelab/admin-on-rest).

## Installation

```sh
npm install aor-feathers-client --save
```

## Usage with stable

```js
// in src/feathersClient.js
import feathers from 'feathers-client';

const host = 'http://localhost:3030';

export default feathers()
  .configure(feathers.hooks())
  .configure(feathers.rest(host).fetch(window.fetch.bind(window)))
  .configure(feathers.authentication({ storage: window.localStorage }));
```

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import { authClient, restClient } from 'aor-feathers-client';
import feathersClient from './feathersClient';
import { PostList } from './posts';

const App = () => (
  <Admin
    authClient={authClient(feathersClient)}
    restClient={restClient(feathersClient)}
  >
    <Resource name="posts" list={PostList} />
  </Admin>
);

export default App;
```

## Usage with Auk

```js
// in src/feathersClient.js
import feathers from 'feathers-client';
import hooks from 'feathers-hooks';
import rest from 'feathers-rest/client';
import authentication from 'feathers-authentication-client';

const host = 'http://localhost:3030';

export default feathers()
  .configure(hooks())
  .configure(rest(host).fetch(window.fetch.bind(window)))
  .configure(authentication({
    jwtStrategy: 'jwt',
    storage: window.localStorage,
  }));
```

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import { authClient, restClient } from 'aor-feathers-client';
import feathersClient from './feathersClient';
import { PostList } from './posts';

const authClientOptions = {
  storageKey: 'feathers-jwt',
  authenticate: { strategy: 'local' },
};

const App = () => (
  <Admin
    authClient={authClient(feathersClient, authClientOptions)}
    restClient={restClient(feathersClient)}
  >
    <Resource name="posts" list={PostList} />
  </Admin>
);

export default App;
```

## License

This library is licensed under the [MIT Licence](LICENSE), and sponsored by [camba](http://www.camba.coop).
