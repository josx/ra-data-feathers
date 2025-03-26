# ra-data-feathers
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-28-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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
  storageKey: 'feathers-jwt', // The key in localStorage used to store the authentication token
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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.camba.coop/"><img src="https://avatars1.githubusercontent.com/u/791137?v=4?s=40" width="40px;" alt=""/><br /><sub><b>José Luis Di Biase</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=josx" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=josx" title="Documentation">📖</a></td>
    <td align="center"><a href="http://nicknelson.io/"><img src="https://avatars1.githubusercontent.com/u/7485405?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Nicholas Nelson</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=nicholasnelson" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=nicholasnelson" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.champigny.name/"><img src="https://avatars3.githubusercontent.com/u/707217?v=4?s=40" width="40px;" alt=""/><br /><sub><b>F.C</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=fonzarely" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=fonzarely" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/AmrN"><img src="https://avatars3.githubusercontent.com/u/11032286?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Amr Noman</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=AmrN" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=AmrN" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/lijoantony"><img src="https://avatars2.githubusercontent.com/u/1202940?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Lijo Antony</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=lijoantony" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=lijoantony" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/tony-kerz"><img src="https://avatars0.githubusercontent.com/u/1223231?v=4?s=40" width="40px;" alt=""/><br /><sub><b>tony kerz</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=tony-kerz" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=tony-kerz" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/vonagam"><img src="https://avatars1.githubusercontent.com/u/5790814?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Dmitrii Maganov</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=vonagam" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=vonagam" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/dreamrace"><img src="https://avatars3.githubusercontent.com/u/3618360?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Dream</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=dreamrace" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=dreamrace" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/wedneyyuri"><img src="https://avatars3.githubusercontent.com/u/7511692?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Wédney Yuri</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=wedneyyuri" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=wedneyyuri" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/7flash"><img src="https://avatars2.githubusercontent.com/u/4569866?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Igor Berlenko</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=7flash" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=7flash" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.softkraft.co/"><img src="https://avatars2.githubusercontent.com/u/71683?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Tomasz Bak</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=tb" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=tb" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/DanStorm"><img src="https://avatars3.githubusercontent.com/u/5097089?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Dan Stevens</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=DanStorm" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=DanStorm" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/dprentis"><img src="https://avatars2.githubusercontent.com/u/1877008?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Daniel Prentis</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=dprentis" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=dprentis" title="Documentation">📖</a></td>
    <td align="center"><a href="https://camba.coop/"><img src="https://avatars2.githubusercontent.com/u/1382608?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Facundo Mainere</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=FacundoMainere" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=FacundoMainere" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/kfern"><img src="https://avatars2.githubusercontent.com/u/1898891?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Fernando Navarro</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=kfern" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=kfern" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/loming"><img src="https://avatars3.githubusercontent.com/u/4988275?v=4?s=40" width="40px;" alt=""/><br /><sub><b>LoMing</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=loming" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=loming" title="Documentation">📖</a></td>
    <td align="center"><a href="https://faizudd.in/"><img src="https://avatars1.githubusercontent.com/u/10869488?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Mohammed Faizuddin</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=TheHyphen" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=TheHyphen" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Ryanthegiantlion"><img src="https://avatars2.githubusercontent.com/u/1843898?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Ryan Harmuth</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=Ryanthegiantlion" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=Ryanthegiantlion" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/sgobotta"><img src="https://avatars2.githubusercontent.com/u/17838461?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Santiago Botta</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=sgobotta" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=sgobotta" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/taylorgoodallau"><img src="https://avatars2.githubusercontent.com/u/47597450?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Taylor Goodall</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=taylorgoodallau" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=taylorgoodallau" title="Documentation">📖</a></td>
    <td align="center"><a href="https://craftcloud3d.com/"><img src="https://avatars2.githubusercontent.com/u/52403795?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Alexander Friedl</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=alex-all3dp" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=alex-all3dp" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/fabioptoi"><img src="https://avatars3.githubusercontent.com/u/11648668?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Fábio Toi</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=fabioptoi" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=fabioptoi" title="Documentation">📖</a></td>
    <td align="center"><a href="http://jvke.co/"><img src="https://avatars2.githubusercontent.com/u/3538455?v=4?s=40" width="40px;" alt=""/><br /><sub><b>jvke</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=jvke" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=jvke" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/nhkhanh"><img src="https://avatars0.githubusercontent.com/u/4928520?v=4?s=40" width="40px;" alt=""/><br /><sub><b>nhkhanh</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=nhkhanh" title="Code">💻</a> <a href="https://github.com/josx/ra-data-feathers/commits?author=nhkhanh" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/ucokfm"><img src="https://avatars.githubusercontent.com/u/1414833?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Ucok Freddy</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=ucokfm" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/olosegres/jsona"><img src="https://avatars.githubusercontent.com/u/3730589?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Sergei Solo</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=olosegres" title="Code">💻</a></td>
    <td align="center"><a href="https://berviantoleo.my.id/"><img src="https://avatars.githubusercontent.com/u/15927349?v=4?s=40" width="40px;" alt=""/><br /><sub><b>Bervianto Leo Pratama</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=berviantoleo" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/JPStrydom"><img src="https://avatars.githubusercontent.com/u/25905330?v=4?s=40" width="40px;" alt=""/><br /><sub><b>JP Strydom</b></sub></a><br /><a href="https://github.com/josx/ra-data-feathers/commits?author=JPStrydom" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
