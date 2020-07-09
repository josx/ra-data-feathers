import decodeJwt from 'jwt-decode';

export default (client, options = {}) => {
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

  return {
    login: params => {
      const { username, password } = params;
      return client.authenticate({
        ...authenticate,
        [usernameField]: username,
        [passwordField]: password,
      });
    },
    logout: params => {
      localStorage.removeItem(permissionsKey);
      return client.logout();
    },
    checkAuth: params => {
      const hasJwtInStorage = !!localStorage.getItem(storageKey);
      const hasReAuthenticate = Object.getOwnPropertyNames(client).includes('reAuthenticate')
        && typeof client.reAuthenticate === 'function';

      if (hasJwtInStorage && hasReAuthenticate) {
        return client
          .reAuthenticate()
          .then(() => Promise.resolve())
          .catch(() => Promise.reject({ redirectTo }));
      }

      return hasJwtInStorage ? Promise.resolve() : Promise.reject({ redirectTo });
    },
    checkError: params => {
      const { code } = params;
      if (code === 401 || (logoutOnForbidden && code === 403)) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(permissionsKey);
        return Promise.reject();
      }
      return Promise.resolve();
    },
    getPermissions: params => {
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
    },
  }
};
