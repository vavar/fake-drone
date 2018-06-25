const sinon = require('sinon');
const chai = require('chai');

sinon.assert.expose(chai.assert, { prefix: '' });

const httpMock = require('node-mocks-http');
const HTTPStatus = require('http-status');

const db = require('../../services/db');
const getActions = require('../../controllers/get-actions');

const { assert } = chai;

describe('controllers/get-actions', function() {
    let sandbox;
    let res;

    beforeEach(function() {
        sandbox = sinon.createSandbox();
        res = httpMock.createResponse();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return action object if successful get DB result', async function() {
        const data = {
            name: 'drone',
            x: 1,
            y: 1,
            direction: 1,
        };
        sandbox.stub(db, 'get').resolves([data]);
        const req = httpMock.createRequest();
        await getActions(req, res);
        assert.calledOnce(db.get);
        assert.deepEqual(JSON.parse(res._getData()), data);
    });

    it('should return HTTP 500 if failed to get DB result', async function() {
        sandbox.stub(db, 'get').rejects(new Error());
        const req = httpMock.createRequest();
        await getActions(req, res);
        assert.calledOnce(db.get);
        assert.equal(res.statusCode, HTTPStatus.INTERNAL_SERVER_ERROR);
    });
});
