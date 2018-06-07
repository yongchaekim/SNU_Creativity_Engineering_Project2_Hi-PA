var header = require('./testHeader');
var expect = header.expect;
var chai = header.chai;
var sinon = header.sinon;
var jquery = header.jquery;

require('./testForh5');

var feedbackController = require('../public/javascripts/controller/FeedbackController');

describe('FeedbackController', function() {
  before(function() {
    feedbackController.view = {update: function(){}};
    feedbackController.socket = {emit: function(){}};
    sinon.stub(feedbackController, '_refreshShow');
  });

  after(function() {
    delete feedbackController.view;
    feedbackController.socket = null;
    feedbackController._refreshShow.restore();
  });

  beforeEach(function() {
    feedbackController._selectedFeedback = {speed: 0, volume: 0};
    feedbackController._data =  {fast: 0, slow: 0, loud: 0, small: 0};
  })

  it('_speedFeedback', function() {
    var mock = sinon.mock(feedbackController.socket);
    mock.expects('emit').once().withArgs('SpeedFeedback', {sign: 1});
    feedbackController._speedFeedback(1);
    mock.verify();
    expect(feedbackController._selectedFeedback.speed).to.equal(1);
    mock.restore();
  });

  it('_volumeFeedback', function() {
    var mock = sinon.mock(feedbackController.socket);
    mock.expects('emit').once().withArgs('VolumeFeedback', {sign: 1});
    feedbackController._volumeFeedback(1);
    mock.verify();
    expect(feedbackController._selectedFeedback.volume).to.equal(1);
    mock.restore();
  });

  it('_receivedSpeedFeedback', function() {
    let data = {fast: 3, slow: 5};
    feedbackController._receivedSpeedFeedback(data);
    let fc = feedbackController;
    expect(fc._data.fast).to.equal(3);
    expect(fc._data.slow).to.equal(5);
  });

  it('_receivedVolumeFeedback', function() {
    let data = {loud: 3, small: 5};
    feedbackController._receivedVolumeFeedback(data);
    let fc = feedbackController;
    expect(fc._data.loud).to.equal(3);
    expect(fc._data.small).to.equal(5);
  });
});