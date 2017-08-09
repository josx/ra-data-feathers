import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_CHECK,
  AUTH_ERROR,
} from 'admin-on-rest';

export default (client, options = {}) => (type, params) => {
  const {
    storageKey,
    authenticate,
  } = Object.assign({}, {
    storageKey: 'token',
    authenticate: { type: 'local' },
  }, options);

  switch (type) {
    case AUTH_LOGIN:
      const { username, password } = params;
      return client.authenticate({
        ...authenticate,
        email: username,
        password,
      });
    case AUTH_LOGOUT:
      return client.logout();
    case AUTH_CHECK:
      return localStorage.getItem(storageKey) ? Promise.resolve() : Promise.reject();
    case AUTH_ERROR:
      const { status } = params;
      if (status === 401) {
        localStorage.removeItem(storageKey);
        return Promise.reject();
      }
      return Promise.resolve();
    default:
      throw new Error(`Unsupported FeathersJS authClient action type ${type}`);
  }
};
