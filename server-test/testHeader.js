var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var chaiHttp = require('chai-http');
chai.use(chaiAsPromised);
chai.use(chaiHttp);
chai.should();


module.exports = {expect : expect, chai : chai};
