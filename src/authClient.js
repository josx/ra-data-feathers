import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_CHECK,
  AUTH_ERROR,
  AUTH_GET_PERMISSIONS,
} from 'react-admin';
import decodeJwt from 'jwt-decode';

export default (client, options = {}) => (type, params) => {
  const {
    storageKey,
    authenticate,
    permissionsKey,
    permissionsField,
    passwordField,
    usernameField,
    redirectTo,
  } = Object.assign({}, {
    storageKey: 'token',
    authenticate: { type: 'local' },
    permissionsKey: 'permissions',
    permissionsField: 'roles',
    passwordField: 'password',
    usernameField: 'email',
  }, options);

  switch (type) {
    case AUTH_LOGIN:
      const { username, password } = params;
      return client.authenticate({
        ...authenticate,
        [usernameField]: username,
        [passwordField]: password,
      });
    case AUTH_LOGOUT:
      localStorage.removeItem(permissionsKey);
      return client.logout();
    case AUTH_CHECK:
      return localStorage.getItem(storageKey) ? Promise.resolve() : Promise.reject({ redirectTo });
    case AUTH_ERROR:
      const { code } = params;
      if (code === 401 || code === 403) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(permissionsKey);
        return Promise.reject();
      }
      return Promise.resolve();
    case AUTH_GET_PERMISSIONS:
      /*
      JWT token may be providen by oauth,
      so that's why the permissions are decoded here and not in AUTH_LOGIN.
      */
      // Get the permissions from localstorage if any.
      const localStoragePermissions = JSON.parse(localStorage.getItem(permissionsKey));
      // If any, provide them.
      if (localStoragePermissions) {
        return Promise.resolve(localStoragePermissions);
      }
      // Or find them from the token, save them and provide them.
      try {
        const jwtToken = localStorage.getItem(storageKey);
        const decodedToken = decodeJwt(jwtToken);
        const jwtPermissions = decodedToken[permissionsField] ? decodedToken[permissionsField] : [];
        localStorage.setItem(permissionsKey, JSON.stringify(jwtPermissions));
        return Promise.resolve(jwtPermissions);
      } catch (e) {
        return Promise.reject();
      }

    default:
      return Promise.reject(`Unsupported FeathersJS authClient action type ${type}`);
  }
};
