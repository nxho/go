/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {
  //var user = require('/api/user');

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/events', require('./api/event'));

  app.use('/auth', require('./auth'));

  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  /*app.get('/api/user', function(req, res){
    User.createEvent(function(err, events){
      if(err)
        res.send(err);

      res.json(events)
    });
  });*/

  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
