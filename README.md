# feathers rest Client for admin-on-rest

For using [feathers](https://www.feathersjs.com) with [admin-on-rest](https://github.com/marmelab/admin-on-rest), convert AOR's REST dialect into one compatible with feathers.

## Installation

```sh
npm install aor-feathers-client --save
```

## Usage

```js
// in src/App.js
import React from 'react';
import { Admin, Resource } from 'admin-on-rest';
import feathersClient from 'aor-feathers-client';
import { PostList } from './posts';

const App = () => (
    <Admin restClient={feathersClient('http://localhost:3030')}>
        <Resource name="posts" list={PostList} />
    </Admin>
);

export default App;
```

## License

This library is licensed under the [MIT Licence](LICENSE), and sponsored by [camba](http://www.camba.coop).
