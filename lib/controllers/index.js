(function() {
  'use strict';

  module.exports = function(app) {

    app.get('/', function (req, res) {
      if (! req.user) return res.render('login');

        console.log(req.session.githubTeams);

      return res.render('index');
    });

  };

})();
