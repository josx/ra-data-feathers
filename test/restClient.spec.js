
import {
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_LIST,
  GET_ONE,
  CREATE,
  UPDATE,
  UPDATE_MANY,
  DELETE,
  DELETE_MANY,
} from 'react-admin';

const { expect } = require('chai');
const sinon = require('sinon');
const debug = require('debug');
const { restClient } = require('../lib');

debug('ra-data-feathers:test');

const findResult = {
  total: 1,
  data: [
    { id: 1 },
  ],
};
const getResult = { id: 1, title: 'gotten' };
const updateResult = { id: 1, title: 'updated' };
const createResult = { id: 1, title: 'created' };
const removeResult = { id: 1, title: 'deleted' };
const authenticateResult = {};

let aorClient;
let fakeClient;
let fakeService;

function setupClient(options = {}) {
  fakeService = {
    find: sinon.stub().returns(Promise.resolve(findResult)),
    get: sinon.stub().returns(Promise.resolve(getResult)),
    update: sinon.stub().callsFake((id, data) => Promise.resolve(
      Object.assign({}, data, { id }),
    )),
    patch: sinon.stub().callsFake((id, data) => Promise.resolve(
      Object.assign({}, data, { id }),
    )),
    create: sinon.stub().returns(Promise.resolve(createResult)),
    remove: sinon.stub().returns(Promise.resolve(removeResult)),
  };

  // sinon.spy(fakeService.find)

  fakeClient = {
    service: () => fakeService,
    authenticate: () => Promise.resolve(authenticateResult),
  };

  aorClient = restClient(fakeClient, options);
}


describe('Rest Client', function () {
  let asyncResult;
  describe('when called with GET_MANY', function () {
    const ids = [1, 2, 3];
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(GET_MANY, 'posts', { ids });
    });

    it("calls the client's find method", function () {
      return asyncResult.then(() => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('returns the data returned by the client', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it("converts ids in it's params into a query and pass it to client", function () {
      const query = {
        id: { $in: ids },
        $limit: ids.length,
      };
      return asyncResult.then(() => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('when called with GET_MANY_REFERENCE', function () {
    const params = {
      pagination: {
        page: 10,
        perPage: 20,
      },
      sort: {
        field: 'id',
        order: 'DESC',
      },
      filter: {
        name: 'john',
      },
      id: '1',
      target: '_userId',
    };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(GET_MANY_REFERENCE, 'posts', params);
    });

    it("calls the client's find method", function () {
      return asyncResult.then(() => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('returns the data returned by the client', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('formats params into a query and pass it to client', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        $sort: {
          id: -1,
        },
        name: 'john',
        _userId: '1',
      };
      return asyncResult.then(() => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('when called with GET_LIST', function () {
    const params = {
      pagination: {
        page: 10,
        perPage: 20,
      },
      sort: {
        field: 'id',
        order: 'DESC',
      },
      filter: {
        name: 'john',
        address: {
          city: 'London',
        },
      },
    };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(GET_LIST, 'posts', params);
    });

    it("calls the client's find method", function () {
      return asyncResult.then(() => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('returns the data returned by the client', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('formats params into a query and pass it to client', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        $sort: {
          id: -1,
        },
        name: 'john',
        'address.city': 'London',
      };
      return asyncResult.then(() => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('id-option: when called with GET_LIST', function () {
    const params = {
      pagination: {
        page: 10,
        perPage: 20,
      },
      sort: {
        field: 'id',
        order: 'DESC',
      },
      filter: {
        name: 'john',
      },
    };

    it("id-option: calls the client's find method", function () {
      setupClient({ id: '_id' });
      asyncResult = aorClient(GET_LIST, 'posts', params);
      return asyncResult.then(() => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('id-option: returns the data returned by the client', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('id-option: formats params into a query and pass it to client', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        $sort: {
          _id: -1,
        },
        name: 'john',
      };
      return asyncResult.then(() => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('resource-id-option: when called with GET_LIST', function () {
    const params = {
      pagination: {
        page: 10,
        perPage: 20,
      },
      sort: {
        field: 'id',
        order: 'DESC',
      },
      filter: {
        name: 'john',
      },
    };

    it("resource-id-option: calls the client's find method", function () {
      setupClient({ posts: { id: '_id' } });
      asyncResult = aorClient(GET_LIST, 'posts', params);
      return asyncResult.then(() => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('resource-id-option: returns the data returned by the client', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('resource-id-option: formats params into a query and pass it to client', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        $sort: {
          _id: -1,
        },
        name: 'john',
      };
      return asyncResult.then(() => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });

    it("resource-id-option: calls the client's find method for default handled resource", function () {
      setupClient({ widgets: { id: '_id' } });
      asyncResult = aorClient(GET_LIST, 'posts', params);
      return asyncResult.then(() => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('resource-id-option: returns the data returned by the client for default handled resource', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('resource-id-option: formats params into a query and pass it to client for default handled resource', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        $sort: {
          id: -1,
        },
        name: 'john',
      };
      return asyncResult.then(() => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('when called with GET_ONE', function () {
    const params = { id: 1 };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(GET_ONE, 'posts', params);
    });

    it("calls the client's get method with the id in params", function () {
      return asyncResult.then(() => {
        expect(fakeService.get.calledOnce).to.be.true;
        expect(fakeService.get.calledWith(1));
      });
    });

    it('returns the data returned by the client in a "data" object', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal({ data: getResult });
      });
    });
  });

  describe('when called with UPDATE', function () {
    const params = {
      id: 1,
      data: {
        title: 'updated',
      },
    };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(UPDATE, 'posts', params);
    });

    it("calls the client's update method with the id and data in params", function () {
      return asyncResult.then(() => {
        expect(fakeService.update.calledOnce).to.be.true;
        expect(fakeService.update.calledWith(1, { title: 'updated' }));
      });
    });

    it('returns the data returned by the client in a "data" object', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal({ data: updateResult });
      });
    });
  });

  describe('when called with UPDATE_MANY', function () {
    const params = {
      ids: [1, 2],
      data: {
        title: 'updated',
      },
    };

    describe('when options.usePatch is false', function () {
      const options = { usePatch: false };

      beforeEach(function () {
        setupClient(options);
        asyncResult = aorClient(UPDATE_MANY, 'posts', params);
      });

      it('calls the client\'s update method once for each ID', function () {
        expect(fakeService.update.calledTwice).to.be.true;
        expect(fakeService.update.firstCall.calledWith(1, params.data));
        expect(fakeService.update.secondCall.calledWith(2, params.data));
      });

      it('returns the ids of the records returned by the client', function () {
        return asyncResult.then((result) => {
          expect(result).to.deep.equal({ data: params.ids });
        });
      });
    });

    describe('when options.usePatch is true', function () {
      const options = { usePatch: true };

      beforeEach(function () {
        setupClient(options);
        asyncResult = aorClient(UPDATE_MANY, 'posts', params);
      });

      it('calls the client\'s patch method once for each ID', function () {
        expect(fakeService.patch.calledTwice).to.be.true;
        expect(fakeService.patch.firstCall.calledWith(1, params.data));
        expect(fakeService.patch.secondCall.calledWith(2, params.data));
      });

      it('returns the ids of the records returned by the client', function () {
        return asyncResult.then((result) => {
          expect(result).to.deep.equal({ data: params.ids });
        });
      });
    });
  });

  describe('when called with CREATE', function () {
    const params = {
      data: {
        title: 'created',
      },
    };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(CREATE, 'posts', params);
    });

    it("calls the client's create method with the data in params", function () {
      return asyncResult.then(() => {
        expect(fakeService.create.calledOnce).to.be.true;
        expect(fakeService.create.calledWith({ title: 'created' }));
      });
    });

    it('returns the data returned by the client in a "data" object', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal({ data: createResult });
      });
    });
  });

  describe('when called with DELETE', function () {
    const params = { id: 1 };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(DELETE, 'posts', params);
    });

    it("calls the client's remove method with the id in params", function () {
      return asyncResult.then(() => {
        expect(fakeService.remove.calledOnce).to.be.true;
        expect(fakeService.remove.calledWith(1));
      });
    });

    it('returns the data returned by the client', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal({ data: removeResult });
      });
    });
  });

  describe('when called with DELETE_MANY', function () {
    const params = { ids: [1, 2] };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(DELETE_MANY, 'posts', params);
    });

    it("calls the client's remove method twice with the ids in params", function () {
      return asyncResult.then(() => {
        expect(fakeService.remove.calledTwice).to.be.true;
        expect(fakeService.remove.firstCall.calledWith(1));
        expect(fakeService.remove.secondCall.calledWith(2));
      });
    });

    it('returns the ids of the records returned by the client', function () {
      return asyncResult.then((result) => {
        expect(result).to.deep.equal({ data: [removeResult.id, removeResult.id] });
      });
    });
  });

  describe('when called with an invalid type', function () {
    beforeEach(function () {
      setupClient();
    });

    it('should throw an error', function () {
      const errorRes = new Error('Unsupported FeathersJS restClient action type WRONG_TYPE');
      try {
        return aorClient('WRONG_TYPE', 'posts', {})
          .then(() => {
            throw new Error('client must reject');
          })
          .catch(() => {});
      } catch (err) {
        expect(err).to.deep.equal(errorRes);
      }
    });
  });
});
