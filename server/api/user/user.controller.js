'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var mongoose = require('mongoose');


var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

exports.getUserId = function(req, res) {
  console.log("Req Params: ", req.params.username);
  User.findOne({'username': req.params.username}, function (err, user){
    if(err) return res.send(500, err);
    res.send(user);
  });
};

exports.getEmail = function(req, res) {
  User.findOne({'username': req.params.username}, function (err, user){
    if(err) return res.send(500, err);
    if(!user) return res.send(404);
    res.send(user.email);
  });
}

exports.getInvitedEvents = function(req, res) {
  User.findById(req.params.id).populate('eventsInvited').exec(function(err, events){
    if(err) {
      return res.send(500, err);
    }
    return res.json(200, events.eventsInvited);
  });
}

//Set the Events that a User is invited to
exports.setInvitedEvents = function(req, res) {
  User.findOne({'username': req.params.username}, function (err, user){
    if(err) {return handleError(res, err);}
    if(!user) {return res.send(404); }
    for(var i = 0; i < user.eventsInvited.length; i++){
      if(user.eventsInvited[i] === req.body){
        console.log("Error! User has already been invited to this event!");
        return handleError(res, err);
      }
    }
    user.eventsInvited.push(req.body._id)
    user.save(function (err) {
      if (err) { return handleError(res, err);}
      return res.json(200, user);
    });


  });
}


exports.updateProfile = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  User.findById(req.params.id, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err);}
      return res.json(200, user);
    });
  });
};

//Store an image
exports.store = function(req, res){
    if(req.body._id){ delete req.body._id; }
    User.findById(req.params.id, function(err, user){
    user.img.data = fs.readFileSync(imgPath);
    user.img.contentType = 'image/png';
    user.save(function (err, user) {
      if (err) throw err;  
    });
  });
};

//Upload an image
exports.upload = function(req, res, next){
  if(req.body._id){ delete req.body._id; }
  User.findById(req.params.id, function(err, doc){
    if(err) return next(err);
    res.contentType(doc.img.contentType);
    res.send(doc.img.data);
  });
};

//Confirm friendship
exports.confirmFriend = function(req, res){
  User.findOneAndUpdate(
    {
      "username": req.params.username,
      "friends.username": req.body.username
    },
    {
      "$set": { "friends.$": req.body }
    },
    function(err,user) {
      console.log("User: ", user);
      user.save(function(err){
        if(err) {return handleError(res, err);}
          return res.json(200, user);
      });
    }
);
  /*if(req.body._id) {delete req.body._id}
    User.findOne({'username': req.params.username}, function (err, user){
      console.log("User before: ", user);
      user.friends.map(function(friend){
        if (friend.username == req.body.username){
          friend = req.body;
        }
        return friend;
      });
      user.save(function (err){
        console.log("User afteR: ", user);
        if(err) {return handleError(res, err);}
          return res.json(200, user);
      });
    });*/
};

//Make friend request pending
exports.requestPending = function(req, res){
  if(req.body._id) {delete req.body._id}
    User.findOne({'username': req.params.username}, function (err, user){
      if (err) { return handleError(res, err); }
      if(!user) { return res.send(404); }
      for(var i = 0; i < user.friends.length; i++){
        if(user.friends[i].username === req.body.username){
          console.log("Error! User has already a friend request pending with this individual!");
          return handleError(res, err);
        }
      }
      var friendObject = {
        username: req.body.username,
        requested: false,
        pending: true,
        invited: false
      };
    user.friends.push(friendObject);
    user.save(function (err) {
      if (err) { return handleError(res, err);}
        return res.json(200, user);
    });
  });
};

//Makes a user a friend
exports.requestFriend = function(req, res) {
    if(req.body._id) { delete req.body._id; }
    //if(req.params.id) {delete req.params.id; }

    User.findOne({'username': req.params.username}, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    for(var i = 0; i < user.friends.length; i++){
      if(user.friends[i].username === req.body.username){
        console.log("Error! User is already friends with this individual!");
        return handleError(res, err);
      }
    }
    var friendObject = {
      username: req.body.username,
      requested: true,
      pending: false,
      invited: false
    };
    
    user.friends.push(friendObject);
    user.save(function (err) {
      if (err) { return handleError(res, err);}
        return res.json(200, user);
    });
  });
};

// Updates an existing event a user is attending in the DB.
exports.update = function(req, res) {
    var id = req.body._id;
    if(req.body._id) { delete req.body._id; }
    User.findById(req.params.id, function (err, user) {
      if (err) { return handleError(res, err); }
      if(!user) { return res.send(404); }
      console.log(user.eventsAttending.length);
      for(var i = 0; i < user.eventsAttending.length; i++){
        if(user.eventsAttending[i].toString() === id){
          console.log("Error! User is already attending this event!");
          return handleError(res, err);
        }
      }
      user.eventsAttending.push(id);
      var updated = _.merge(user, req.body);
      updated.markModified('eventsAttending');
      updated.save(function (err) {
        if (err) { return handleError(res, err);}
          return res.json(200, user);
    });
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/*
 * Get a User and get his profile when you click on the individual's link
 */

exports.getProfile = function(req, res){
  User.findOne({'username': req.params.username}, function (err, user){
    if(err) { return handleError(res, err); }
    //if(!user) return res.send(401);
    res.json(user);
  });
};

//Get Events that a user is attending 
exports.getEvents = function(req, res) {
  User.findById(req.params.id).populate('eventsAttending').exec(function(err, events){
    if(err) {
      return res.send(500, err);
    }
    return res.json(200, events);
  });
};


/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;
  console.log("Hi");
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */

exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

function handleError(res, err) {
  console.log("Error: ", err);
  return res.send(500, err);
}
