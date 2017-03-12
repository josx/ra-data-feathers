import {
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_CHECK,
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
    default:
      throw new Error(`Unsupported FeathersJS authClient action type ${type}`);
  }
};
