# Feathers REST Client for React-admin

The perfect match to build Backend and Frontend Admin, based on REST services.
For using [feathers](https://www.feathersjs.com) with [react-admin](https://github.com/marmelab/react-admin).

> If you are searching for admin-on-rest (older react-admin version), please use [1.0.0 version](https://github.com/josx/aor-feathers-client/releases/tag/v1.0.0)

## Features
* GET_MANY_REFERENCE
* GET_MANY
* GET_LIST
* GET_ONE
* CREATE
* UPDATE
* DELETE
* DELETE_MANY
* AUTH_LOGIN
* AUTH_LOGOUT
* AUTH_CHECK
* AUTH_ERROR
* AUTH_GET_PERMISSIONS
* Custom Id support

## Installation

In your react-admin app just add aor-feathers-client dependency:

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

Users service must have a roles field. We are using users.roles

```js
// in feathers-app/src/authentication.js

[...]

app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies),
        // This hook adds the `roles` attribute to the JWT payload by
        // modifying params.payload.
        hook => {
          // make sure params.payload exists
          hook.params.payload = hook.params.payload || {};
          // merge in a `roles` property
          Object.assign(hook.params.payload, {roles: hook.params.user.roles});
        }
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
});

```

If your role field has another name than "roles" you must change hook.params.user.roles by hook.params.user.[yourRolesField] in Object.assign(hook.params.payload, {roles: hook.params.user.roles})

EACH feathers service MUST use a before hook as restrictToRoles.

For example,

```js
//in feathers-app/src/users.hooks.js

  before: {
    all: [],
    find: [ authenticate('jwt'), restrictToRoles({ roles: ['admin']}) ],
    get: [ ...restrict ],
    create: [ authenticate('jwt'), restrictToRoles({ roles: ['admin']}), hashPassword() ],
    update: [ ...restrict, hashPassword() ],
    patch: [ ...restrict, hashPassword() ],
    remove: [ authenticate('jwt'), restrictToRoles({ roles: ['admin']}) ]
  },

```


```js
// in src/feathersClient.js
import feathers from "@feathersjs/client";
import auth from "@feathersjs/authentication-client";

const host = 'http://localhost:3030';
const authOptions = { jwtStrategy: 'jwt', storage: window.localStorage };

export default feathers()
    .configure(feathers.rest(host).fetch(window.fetch.bind(window)));
    .configure(auth(authOptions));
```

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'react-admin';
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
const options = {'my-resource': {id: '_id'}};

// Use HTTP PATCH method instead of PUT to implement UPDATE
const options = { usePatch: true };

const App = () => (
  <Admin
    authProvider={authClient(feathersClient, authClientOptions)}
    dataProvider={restClient(feathersClient, options)}
  >
    {permissions => [
      permissions === 'admin' ? <Resource name="users" list={UsersList} /> : null,
      <Resource
        name="post"
        list={PostList}
        create={permissions === 'admin' ? PostCreate : null}
        edit={permissions === 'admin' ? PostEdit : null}
        remove={permissions === 'admin' ? Delete : null}
      />
    ]}
  </Admin>
);


export default App;
```

You can find a complete example in [https://github.com/kfern/feathers-aor-test-integration](https://github.com/kfern/feathers-aor-test-integration)

## License

This software is licensed under the [MIT Licence](LICENSE), and sponsored by [Cambá](https://www.camba.coop).
