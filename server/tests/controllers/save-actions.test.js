const sinon = require('sinon');
const chai = require('chai');

sinon.assert.expose(chai.assert, { prefix: '' });

const httpMock = require('node-mocks-http');
const HTTPStatus = require('http-status');

const db = require('../../services/db');
const drone = require('../../services/drone');
const saveActions = require('../../controllers/save-actions');

const { assert } = chai;

describe('controllers/save-actions', function() {
    let sandbox;
    let res;

    beforeEach(function() {
        sandbox = sinon.createSandbox();
        res = httpMock.createResponse();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return HTTP 400 if invalid command', async function() {
        sandbox.stub(db, 'get').rejects(new Error());
        const req = httpMock.createRequest();

        await saveActions(req, res);

        assert.notCalled(db.get);
        assert.equal(res.statusCode, HTTPStatus.BAD_REQUEST);
    });

    it('should return HTTP 500 if cannot fetch last drone action', async function() {
        sandbox.stub(db, 'get').rejects(new Error());
        const req = httpMock.createRequest({
            params: {
                id: 'abc',
                action: 'place',
                query: {
                    x: 1,
                    y: 1,
                    f: 1,
                },
            },
        });

        await saveActions(req, res);

        assert.calledOnce(db.get);
        assert.equal(res.statusCode, HTTPStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return HTTP 400 if invalid command', async function() {
        const data = {
            name: 'drone',
            x: 1,
            y: 1,
            direction: 1,
        };
        sandbox.stub(db, 'get').resolves([data]);
        sandbox.stub(drone, 'processCommand').returns(null);
        const req = httpMock.createRequest({
            params: {
                id: 'abc',
                action: 'place',
                query: {
                    x: 1,
                    y: 1,
                    f: 1,
                },
            },
        });

        await saveActions(req, res);

        assert.calledOnce(db.get);
        assert.calledOnce(drone.processCommand);
        assert.equal(res.statusCode, HTTPStatus.BAD_REQUEST);
    });

    it('should return HTTP 500 if store DB error', async function() {
        const data = {
            name: 'place',
            x: 1,
            y: 1,
            direction: 1,
        };
        sandbox.stub(db, 'get').resolves([data]);
        sandbox.stub(db, 'save').rejects(new Error());
        sandbox.stub(drone, 'processCommand').returns(data);

        const req = httpMock.createRequest({
            params: {
                id: 'abc',
                action: 'place',
                query: {
                    x: 1,
                    y: 1,
                    f: 1,
                },
            },
        });

        await saveActions(req, res);

        assert.calledOnce(db.get);
        assert.calledOnce(drone.processCommand);
        assert.calledOnce(db.save);
        assert.equal(res.statusCode, HTTPStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 200 if store DB successful', async function() {
        const data = {
            name: 'place',
            x: 1,
            y: 1,
            direction: 1,
        };
        sandbox.stub(db, 'get').resolves([data]);
        sandbox.stub(db, 'save').resolves(data);
        sandbox.stub(drone, 'processCommand').returns(data);

        const req = httpMock.createRequest({
            params: {
                id: 'abc',
                action: 'place',
                query: {
                    x: 1,
                    y: 1,
                    f: 1,
                },
            },
        });

        await saveActions(req, res);

        assert.calledOnce(db.get);
        assert.calledOnce(drone.processCommand);
        assert.calledOnce(db.save);
        assert.equal(res.statusCode, HTTPStatus.OK);
        assert.deepEqual(JSON.parse(res._getData()), data);
    });
});
