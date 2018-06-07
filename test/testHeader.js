var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var chaiHttp = require('chai-http');
chai.use(chaiAsPromised);
chai.use(chaiHttp);
chai.should();

var sinon = require('sinon');
var jquery = require('jquery-deferred');

module.exports = {expect : expect, chai : chai, sinon, jquery};
