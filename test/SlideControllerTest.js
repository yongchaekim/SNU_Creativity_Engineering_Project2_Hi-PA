var header = require('./testHeader');
var expect = header.expect;
var chai = header.chai;
var sinon = header.sinon;
var jquery = header.jquery;

require('./testForh5');

var slideController = require('../public/javascripts/controller/SlideController');

describe('SlideController', function() {
  function createState(indexf, indexh, indexv, overview = false, paused = false) {
      return {indexf, indexh, indexv, overview, paused};
  }
  before(function() {
    global.parentController = {
      timeController: {
        get_status: function(){return 'STARTED';}
      }
    }
    slideController.socket = {
      emit: function(){},
    }
    sinon.stub(slideController, '_syncButtonRefresh');
  });

  after(function(){
    parentController = undefined;
    slideController.socket = null;
    slideController._syncButtonRefresh.restore();
  });

  describe('equalState', function() {
    it('_equal state working?', function() {
        let cs = createState;
        let sc = slideController;
        expect(sc._equalState(cs(0,0,0,0,false), cs(0,0,0,0,false))).equal(true);
        expect(sc._equalState(cs(1,0,0,0,false), cs(0,0,0,0,false))).equal(false);
        expect(sc._equalState(cs(0,0,0,0,false), cs(0,1,0,0,false))).equal(false);
        expect(sc._equalState(cs(0,0,1,0,false), cs(0,0,0,0,false))).equal(false);
        expect(sc._equalState(cs(0,0,0,0,false), cs(0,0,0,1,false))).equal(false);
        expect(sc._equalState(cs(0,0,0,0,true), cs(0,0,0,0,false))).equal(false);
    });
  });

  describe('_postInfo', function() {
    it('_postInfo', function() {
      var mock = sinon.mock(slideController.socket);
      mock.expects('emit').once().withArgs('slidestatechanged', {slideData: {state: 1}});
      slideController._postInfo(1);
      mock.restore();
      mock.verify();
    });
  });

  describe('_desync', function() {
    it('_desync', function() {
      slideController._desync();
      expect(slideController._isInSync).equal(false);
    });
  });

  describe('_resync', function() {
    it('_resync', function() {
      slideController._resync();
      expect(slideController._isInSync).equal(true);
    });
  });

  describe('_presenterSlideChanged', function() {
    let getStatusValue = 'STARTED';
    let getStateValue = createState(0,0,0,false,false);

    before(function() {
      sinon.stub(parentController.timeController, 'get_status')
        .callsFake(function(){return getStatusValue;});
      sinon.stub(slideController, 'getState')
        .callsFake(function(){return getStateValue;});
    });

    after(function() {
      parentController.timeController.get_status.restore();
    });

    it('timecontroller status is not started', function() {
      getStatusValue = 'PAUSED';
      getStateValue = createState(1,1,1,false,false);
      let mock = sinon.mock(slideController);
      mock.expects('_postInfo').once().withArgs(getStateValue);
      slideController._presenterSlideChanged();
      mock.restore();
      mock.verify();
    });

    describe('timeController status is started', function() {
      before(function() {
        getStatusValue = 'STARTED';
        sinon.stub(slideController, '_postInfo');
      });

      after(function() {
        slideController._postInfo.restore();
      });

      function setStateMock() {
        return sinon.mock(slideController);
      }

      describe('getState equal currentState', function() {
        it('getState equal currentState', function() {
          getStateValue = createState(1,0,0);
          slideController._currentState = createState(1,0,0);
          slideController._presenterSlideChanged();
          expect(slideController._currentState).to.deep.equal(createState(1,0,0));
        });

      });

      describe('getState not equal currentState', function() {
        let alertResult = {questionID: null, tooltip: null, leftTime: 10};
        function setAlertResult(questionID, tooltip, leftTime) {
          alertResult = {questionID, tooltip, leftTime};
        }

        before(function() {
          slideController._isNetworking = false;
          sinon.stub(h5, 'ajax').callsFake(function (options) {
            var dfd = jquery.Deferred();
            dfd.resolve(alertResult);
            return dfd.promise();
          });
          global.config = {
            url: 'localhost:8000',
          }
        });

        after(function() {
          h5.ajax.restore();
          global.config = null;
        });

        beforeEach(function() {
          getStateValue = createState(1,0,0);
          slideController._currentState = createState(2,0,0);
        });

        it('isNetworking', function() {
          slideController._isNetworking = true;
          let mock = sinon.mock(slideController);
          mock.expects('setState').once().withArgs(slideController._currentState);
          slideController._presenterSlideChanged();
          mock.restore();
          mock.verify();
          slideController._isNetworking = false;
        });

        it('no alert', function() {
          setAlertResult(null, null, 10);
          let mock = sinon.mock(slideController);
          mock.expects('setState').twice();
          slideController._presenterSlideChanged();
          mock.restore();
          mock.verify();
        });

        it('alert but no time', function() {
          setAlertResult(null, 123, 10);
          let mock = sinon.mock(slideController);
          mock.expects('setState').twice();
          slideController._presenterSlideChanged();
          mock.restore();
          mock.verify();
        });

        it('alert', function() {
          setAlertResult(null, 123, 100);
          let mock = sinon.mock(slideController);
          mock.expects('setState').once();
          slideController._presenterSlideChanged();
          mock.restore();
          mock.verify();
        });
      });
    });
  });
});