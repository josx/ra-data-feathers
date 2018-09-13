"use strict";

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const aorAuthClient = require('../lib').authClient;

const { expect } = chai;
chai.use(chaiAsPromised);

const debug = require('debug')

const dbg = debug('aor-feathers-client:test')

const fakeClient = {
  // authenticate: ({ email, password }) => { ... }
};

let authClient;

const options = {
  storageKey: 'storageKey'
};

function setupClient(options = {}) {
  authClient = aorAuthClient(fakeClient, options)
}



describe('Auth Client', function () {
  describe('when called with AUTH_CHECK', function () {

    describe('when [storageKey] is not set', function() {
      beforeEach(function() {
        setupClient(options);
        global.localStorage = {
          getItem: sinon.stub().returns()
        }
      });

      afterEach(function() {
        delete global.localStorage;
      });

      it('should reject', function () {
        return expect(authClient('AUTH_CHECK', {})).to.be.rejected;
      });

      describe('when redirectTo is set', function() {
        let testOptions = Object.assign({}, options, { redirectTo: '/someurl' })
        beforeEach(function() {
          setupClient(testOptions);
        });

        it('should reject with the redirectTo URL', function() {
          return expect(authClient('AUTH_CHECK', {})).to.be.rejectedWith({ redirectTo: testOptions.redirectTo });
        });
      })
    });

    describe('when [storageKey] is set', function() {
      before(function() {
        global.localStorage = {
          getItem: sinon.stub().returns('somedata')
        }
      });
      after(function() {
        delete global.localStorage;
      });

      it('should resolve', function() {
        return expect(authClient('AUTH_CHECK', {})).to.be.fulfilled;
      });
    });
  });

  describe('when called with an invalid type', function () {
    beforeEach(function () {
      setupClient();
    });

    it('should throw an error', function () {
      const errorRes = new Error('Unsupported FeathersJS authClient action type WRONG_TYPE')
      try {
        return authClient('WRONG_TYPE', 'posts', {})
          .then(result => {
            throw new Error("client must reject");
          })
          .catch(err => {});
      } catch (err) {
        expect(err).to.deep.equal(errorRes);
      }
    });
  });
});
