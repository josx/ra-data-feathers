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
    logoutOnForbidden,
  } = Object.assign({}, {
    storageKey: 'token',
    authenticate: { strategy: 'local' },
    permissionsKey: 'permissions',
    permissionsField: 'roles',
    passwordField: 'password',
    usernameField: 'email',
    logoutOnForbidden: true,
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
      const hasJwtInStorage = !!localStorage.getItem(storageKey);
      const hasReAuthenticate =
        Object.getOwnPropertyNames(client).includes('reAuthenticate') &&
        typeof client.reAuthenticate === 'function';

      if (hasJwtInStorage && hasReAuthenticate) {
        return client
          .reAuthenticate()
          .then(() => Promise.resolve())
          .catch(() => Promise.reject({ redirectTo }));
      }

      return hasJwtInStorage ? Promise.resolve() : Promise.reject({ redirectTo });
    case AUTH_ERROR:
      const { code } = params;
      if (code === 401 || (logoutOnForbidden && code === 403)) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(permissionsKey);
        return Promise.reject();
      }
      return Promise.resolve();
    case AUTH_GET_PERMISSIONS:
      /*
      JWT token may be provided by oauth,
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
