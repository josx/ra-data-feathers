# ra-data-feathers

> Feathers data provider for [react-admin](https://github.com/marmelab/react-admin)

The perfect match to build Backend and Frontend Admin, based on REST services.
For using [Feathers](https://www.feathersjs.com) with [react-admin](https://github.com/marmelab/react-admin).

If you are searching for admin-on-rest (older react-admin version), please use [1.0.0 version](https://github.com/josx/ra-data-feathers/releases/tag/v1.0.0)

## Supported react-admin request types

ra-data-feathers currently supports the following request types. More information on react-admin request types is available for [data providers](https://marmelab.com/react-admin/DataProviders.html#request-format) and [auth providers](https://marmelab.com/react-admin/Authorization.html) in the react-admin documentation.

* **Data Provider**
	* GET_LIST
	* GET_ONE
	* CREATE
	* UPDATE
	* UPDATE_MANY
	* DELETE
	* DELETE_MANY
	* GET_MANY
	* GET_MANY_REFERENCE
* **Auth Provider**
	* AUTH_LOGIN
	* AUTH_LOGOUT
	* AUTH_CHECK
	* AUTH_ERROR
	* AUTH_GET_PERMISSIONS

## Installation

In your react-admin app just add ra-data-feathers dependency:

```sh
npm install ra-data-feathers --save
```

## Usage

### Feathers Client
Both `restClient` and `authClient` depend on a configured Feathers client instance.

Configuration of the Feathers client is beyond the scope of this document. See the Feathers documentation for more information on configuring the Feathers client. Both of the following need to be configured in the Feathers client for use with ra-data-feathers.
* A client type such as [REST](https://docs.feathersjs.com/api/client/rest.html), [Socket.io](https://docs.feathersjs.com/api/client/socketio.html), or [Primus](https://docs.feathersjs.com/api/client/primus.html)
* [Authentication](https://docs.feathersjs.com/api/authentication/client.html)


### Data Provider (restClient)
The ra-data-feathers data provider (restClient) accepts two arguments: `client` and `options`.

`client`should be a [configured Feathers client instance](#Feathers-Client). This argument is required.

`options` contains configurable options for the ra-data-feathers restClient. The `options` argument is optional and can be omitted. In this case, defaults will be used.
```js
const options = {
  id: 'id', // If your database uses an id field other than 'id'. Optional.
  usePatch: false, // Use PATCH instead of PUT for UPDATE requests. Optional.
  my_resource: { // Options for individual resources can be set by adding an object with the same name. Optional.
    id: 'id', // If this specific table uses an id field other than 'id'. Optional.
  },
  /* Allows to use custom query operators from various feathers-database-adapters in GET_MANY calls.
   * Will be merged with the default query operators ['$gt', '$gte', '$lt', '$lte', '$ne', '$sort', '$or', '$nin', '$in']
   */
  customQueryOperators: []
}
```
`Performant Bulk Actions` can be used by enabling multi options in the feathers application

### Auth Provider (authClient)
`authClient` also accepts two parameters. `client` and `options`.

`client`should be a [configured Feathers client instance](#Feathers-Client). This argument is required.

`options` contains configurable options for the ra-data-feathers authClient. The `options` argument is optional and can be omitted. In this case, defaults shown below will be used.

```js
const options = {
  storageKey: 'token', // The key in localStorage used to store the authentication token
  authenticate: { // Options included in calls to Feathers client.authenticate
    strategy: 'local', // The authentication strategy Feathers should use
  },
  permissionsKey: 'permissions', // The key in localStorage used to store permissions from decoded JWT
  permissionsField: 'roles', // The key in the decoded JWT containing the user's role
  passwordField: 'password', // The key used to provide the password to Feathers client.authenticate
  usernameField: 'email', // The key used to provide the username to Feathers client.authenticate
  redirectTo: '/login', // Redirect to this path if an AUTH_CHECK fails. Uses the react-admin default of '/login' if omitted.
  logoutOnForbidden: true, // Logout when response status code is 403
}
```

### Usage with the react-admin `<Admin>` component

ra-data-feathers can be used by passing the `restClient` and `authClient` to the react-admin `<Admin>` component as the `dataProvider` and `authProvider` params respectively:
```jsx
<Admin
  dataProvider={restClient(feathersClient, restClientConfig)}
  authProvider={authClient(feathersClient, authClientConfig)}
/>
```

## Example

This example assumes the following:
* A [configured Feathers client](#feathers-client) is available at `./feathersClient`
* The Feathers authentication service includes a field called `userroles`
* List components for `AResource` and `AnotherResource` are available in `./resources`

```js
import { Admin, Resource } from 'react-admin';
import feathersClient from './feathersClient';
import { AResourceList } from './resources/AResource/List';
import { AnotherResourceList } from './resources/AnotherResourceList';
import { restClient, authClient } from 'ra-data-feathers';

const restClientOptions = {
  id: '_id', // In this example, the database uses '_id' rather than 'id'
  usePatch: true // Use PATCH instead of PUT for updates
};

const authClientOptions = {
  usernameField: 'username', // Our example database might use 'username' rather than 'email'
  permissionsField: 'userroles', // Use the 'userroles' field on the JWT as the users role
  redirectTo: '/signin', // Our example login form might be at '/signin', redirect here if AUTH_CHECK fails
}

const App = () => (
  <Admin
    title='ra-data-feathers Example'
    dataProvider={restClient(feathersClient, restClientOptions)}
    authProvider={authClient(feathersClient, authClientOptions)}
  >
    {permissions => [
      <Resource
        name='a_resource'
        list={AResourceList}
      />
      permissions === 'admin' ? // Only show this resource if the user role is 'admin'
        <Resource
          name='another_resource'
          list={AnotherResourceList}
        /> : null;
    ]}
  </Admin>
);

```

> Note: the permissions restriction above **only** affects whether a given resource is visible or not, and will not prevent users from accessing your API directly. In most projects, this option would be used with user/role restriction hooks on the server side such as [feathers-authentication-hooks](https://github.com/feathersjs-ecosystem/feathers-authentication-hooks).

You can find a complete example in [https://github.com/kfern/feathers-aor-test-integration](https://github.com/kfern/feathers-aor-test-integration)

## Running tests

Tests for the ra-data-feathers module are available from the root directory of the module with:
```sh
npm run test
```

## License

This software is licensed under the [MIT Licence](LICENSE), and sponsored by [Cambá](https://www.camba.coop).
