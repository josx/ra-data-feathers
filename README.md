# Feathers REST Client for Admin-on-rest

The perfect match to build Backend and Frontend Admin, based on REST services.
For using [feathers](https://www.feathersjs.com) with [admin-on-rest](https://github.com/marmelab/admin-on-rest).

## Features
* GET_MANY
* GET_LIST
* GET_ONE
* CREATE
* UPDATE
* DELETE
* AUTH_LOGIN
* AUTH_LOGOUT
* AUTH_CHECK
* AUTH_ERROR
* Custom Id support

## Installation

In your admin-on-rest app just add aor-feathers-client dependency:

```sh
npm install aor-feathers-client --save
```

or

```sh
yarn add aor-feathers-client
```

## Running tests

```sh
npm run test

```

## Example with Feathersjs stable (AUK)

```js
// in src/feathersClient.js
import feathers from 'feathers-client';

const host = 'http://localhost:3030';

export default feathers()
    .configure(feathers.hooks())
    .configure(feathers.rest(host).fetch(window.fetch.bind(window)))
    .configure(feathers.authentication({ jwtStrategy: 'jwt', storage: window.localStorage }));
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

// to rename id field for *all* resources use this syntax:
const options = { id: '_id' };

// to rename id field(s) for specific resources use this syntax:
const options = {'my-resource': {id: '_id'}}

const App = () => (
  <Admin
    authClient={authClient(feathersClient, authClientOptions)}
    restClient={restClient(feathersClient, options)}
  >
    <Resource name="posts" list={PostList} />
  </Admin>
);

export default App;
```

## License

This software is licensed under the [MIT Licence](LICENSE), and sponsored by [Cambá](https://www.camba.coop).
