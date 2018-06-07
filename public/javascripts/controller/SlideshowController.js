var controller = {
  __name: 'hipa.controller.SlideshowController',
  alertController: hipa.controller.AlertController,
  slideController: hipa.controller.SlideController,
  __meta: {
      alertController: {
          rootElement: '#alert-container',
      },
      slideController: {
          rootElement: '#slide-container',
      },
  },
};
h5.core.expose(controller);
