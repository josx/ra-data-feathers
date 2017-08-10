"use strict";

const expect = require('chai').expect;
const sinon = require('sinon');
const restClient = require('../lib').restClient;
const types = require('admin-on-rest/lib/rest/types');
const debug = require('debug')

const dbg = debug('aor-feathers-client:test')

const findResult = {
  total: 1,
  data: [
    { id: 1 },
  ]
};
const getResult = { id: 1, title: 'gotten' };
const updateResult = { id: 1, title: 'updated' };
const createResult = { id: 1, title: 'created' };
const removeResult = { id: 1, title: 'deleted' };

let aorClient, fakeClient, fakeService;

function setupClient(options = {}) {
  fakeService = {
    find: sinon.stub().returns(Promise.resolve(findResult)),
    get: sinon.stub().returns(Promise.resolve(getResult)),
    update: sinon.stub().returns(Promise.resolve(updateResult)),
    create: sinon.stub().returns(Promise.resolve(createResult)),
    remove: sinon.stub().returns(Promise.resolve(removeResult)),
  };

  // sinon.spy(fakeService.find)

  fakeClient = {
    service: (resource) => fakeService,
  };

  aorClient = restClient(fakeClient, options);
}



describe('Rest Client', function () {
  let asyncResult;
  describe('when called with GET_MANY', function () {
    let ids = [1, 2, 3];
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(types.GET_MANY, 'posts', { ids });
    });

    it("calls the client's find method", function () {
      return asyncResult.then(result => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('returns the data returned by the client', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it("converts ids in it's params into a query and pass it to client", function () {
      const query = {
        'id': { '$in': ids },
        '$limit': ids.length,
      };
      return asyncResult.then(result => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('when called with GET_LIST', function () {
    let params = {
      pagination: {
        page: 10,
        perPage: 20,
      },
      sort: {
        field: 'id',
        order: 'DESC'
      },
      filter: {
        name: 'john'
      }
    };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(types.GET_LIST, 'posts', params);
    });

    it("calls the client's find method", function () {
      return asyncResult.then(result => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('returns the data returned by the client', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('formats params into a query and pass it to client', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        '$sort[id]': '-1',
        name: 'john'
      };
      return asyncResult.then(result => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('id-option: when called with GET_LIST', function () {
    let params = {
      pagination: {
        page: 10,
        perPage: 20,
      },
      sort: {
        field: 'id',
        order: 'DESC'
      },
      filter: {
        name: 'john'
      }
    };

    it("id-option: calls the client's find method", function () {
      setupClient({id: '_id'});
      asyncResult = aorClient(types.GET_LIST, 'posts', params);
      return asyncResult.then(result => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('id-option: returns the data returned by the client', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('id-option: formats params into a query and pass it to client', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        '$sort[_id]': '-1',
        name: 'john'
      };
      return asyncResult.then(result => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('resource-id-option: when called with GET_LIST', function () {
    let params = {
      pagination: {
        page: 10,
        perPage: 20,
      },
      sort: {
        field: 'id',
        order: 'DESC'
      },
      filter: {
        name: 'john'
      }
    };

    it("resource-id-option: calls the client's find method", function () {
      setupClient({posts: {id: '_id'}});
      asyncResult = aorClient(types.GET_LIST, 'posts', params);
      return asyncResult.then(result => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('resource-id-option: returns the data returned by the client', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('resource-id-option: formats params into a query and pass it to client', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        '$sort[_id]': '-1',
        name: 'john'
      };
      return asyncResult.then(result => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });

    it("resource-id-option: calls the client's find method for default handled resource", function () {
      setupClient({widgets: {id: '_id'}});
      asyncResult = aorClient(types.GET_LIST, 'posts', params);
      return asyncResult.then(result => {
        expect(fakeService.find.calledOnce).to.be.true;
      });
    });

    it('resource-id-option: returns the data returned by the client for default handled resource', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal(findResult);
      });
    });

    it('resource-id-option: formats params into a query and pass it to client for default handled resource', function () {
      const query = {
        $limit: 20,
        $skip: 20 * 9,
        '$sort[id]': '-1',
        name: 'john'
      };
      return asyncResult.then(result => {
        expect(fakeService.find.calledWith({
          query,
        })).to.be.true;
      });
    });
  });

  describe('when called with GET_ONE', function () {
    let params = { id: 1 };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(types.GET_ONE, 'posts', params);
    });

    it("calls the client's get method with the id in params", function () {
      return asyncResult.then(result => {
        expect(fakeService.get.calledOnce).to.be.true;
        expect(fakeService.get.calledWith(1));
      });
    });

    it('returns the data returned by the client in a "data" object', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal({ data: getResult });
      });
    });
  });

  describe('when called with UPDATE', function () {
    let params = {
      id: 1,
      data: {
        title: 'updated'
      }
    };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(types.UPDATE, 'posts', params);
    });

    it("calls the client's update method with the id and data in params", function () {
      return asyncResult.then(result => {
        expect(fakeService.update.calledOnce).to.be.true;
        expect(fakeService.update.calledWith(1, { title: 'updated' }));
      });
    });

    it('returns the data returned by the client in a "data" object', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal({ data: updateResult });
      });
    });
  });

  describe('when called with CREATE', function () {
    let params = {
      data: {
        title: 'created'
      }
    };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(types.CREATE, 'posts', params);
    });

    it("calls the client's create method with the data in params", function () {
      return asyncResult.then(result => {
        expect(fakeService.create.calledOnce).to.be.true;
        expect(fakeService.create.calledWith({ title: 'created' }));
      });
    });

    it('returns the data returned by the client in a "data" object', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal({ data: createResult });
      });
    });
  });

  describe('when called with DELETE', function () {
    let params = { id: 1 };
    beforeEach(function () {
      setupClient();
      asyncResult = aorClient(types.DELETE, 'posts', params);
    });

    it("calls the client's remove method with the id in params", function () {
      return asyncResult.then(result => {
        expect(fakeService.remove.calledOnce).to.be.true;
        expect(fakeService.remove.calledWith(1));
      });
    });

    it('returns the data returned by the client', function () {
      return asyncResult.then(result => {
        expect(result).to.deep.equal({ data: removeResult });
      });
    });
  });

  describe('when called with an invalid type', function () {
    beforeEach(function () {
      setupClient();
    });

    it('should throw an error', function () {
      const errorRes = new Error('Unsupported FeathersJS restClient action type WRONG_TYPE')
      try {
        return aorClient('WRONG_TYPE', 'posts', {})
          .then(result => {
            throw new Error("client must reject");
          });
      } catch (err) {
        expect(err).to.deep.equal(errorRes);
      }
    });
  });
});
