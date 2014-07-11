(function() {
  'use strict';

  module.exports = function(app) {

    app.get('/', function (req, res) {
      console.log(req.session);
      console.log('what');
      console.log(req.user);
      if (! req.user) return res.render('unauth');

      console.log(req.session);
      return res.render('index');
    });

  };

})();
