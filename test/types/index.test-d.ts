import { restClient, authClient } from "../../lib";
import { expectType, expectError } from 'tsd';

interface IRestClientResult {
  (type: any, resource: any, params: any): any
}

interface IAuthClientResult {
  (type: any, params: any): any
}

const configIdandPatch = {
  id: "_id", // In this example, the database uses '_id' rather than 'id'
  usePatch: true, // Use PATCH instead of PUT for updates
}

expectType<IRestClientResult>(restClient(null, configIdandPatch));

const configFull = {
  id: 'id', // If your database uses an id field other than 'id'. Optional.
  usePatch: false, // Use PATCH instead of PUT for UPDATE requests. Optional.
  my_resource: { // Options for individual resources can be set by adding an object with the same name. Optional.
    id: 'id', // If this specific table uses an id field other than 'id'. Optional.
  },
  /* Allows to use custom query operators from various feathers-database-adapters in GET_MANY calls.
   * Will be merged with the default query operators ['$gt', '$gte', '$lt', '$lte', '$ne', '$sort', '$or', '$nin', '$in']
   */
  customQueryOperators: []
};

expectType<IRestClientResult>(restClient(null, configFull));

// this will be ignored and use default value instead
const configServices = {
  randomly: { id: "ok" }
};

expectType<IRestClientResult>(restClient(null, configServices));

// this will be false
const configInvalid = {
  id: 1
};

expectError(restClient(null, configInvalid));

const allAuthOptions = {
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

expectType<IAuthClientResult>(authClient(null, allAuthOptions));

const someOptions = {
  storageKey: 'feathers-jwt', // The key in localStorage used to store the authentication token
  authenticate: { // Options included in calls to Feathers client.authenticate
    strategy: 'local', // The authentication strategy Feathers should use
  },
}

expectType<IAuthClientResult>(authClient(null, someOptions));
