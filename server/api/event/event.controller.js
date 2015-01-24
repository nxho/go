'use strict';

var _ = require('lodash');
var Event = require('./event.model');

// Get list of events
exports.index = function(req, res) {
  Event.find(function (err, events) {
    if(err) { return handleError(res, err); }
    return res.json(200, events);
  });
};

//Find users that are attending an Event
exports.getUsers = function(req, res) {
  Event.findById(req.params.id).populate('attendees').exec(function (err, users){
    if(err) return handleError(err);
    return res.json(users.attendees)
  });
};

//Invite friends to event
exports.inviteFriends = function(req, res) {
  Event.findById(req.params.id, function (err, event) {
    if(err) {return handleError(res, err); }
    if(!event) {return res.send(404); }
    for(var i = 0; i < event.invited.length; i++){
      if(event.invited[i] === req.body.username){
        console.log("Error! User is already invited to this event!");
        return handleError(res, err);
      }
    }
    var invitedObj = {
      username: req.body.username
    };
    event.invited.push(invitedObj);
    var updated = _.merge(event, req.body);
    updated.markModified('invited');
    updated.save(function (err) {
      if(err) { return handleError(res, err); }
      return res.json(200, event);
    });
  });
}

// Get a single event
exports.show = function(req, res) {
  Event.findById(req.params.id, function (err, event) {
    if(err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    return res.json(200, event);
  });
};

// Creates a new event in the DB.
exports.create = function(req, res) {
  Event.create(req.body, function(err, event) {
    console.log("Event: ", event);
    if(err) { return handleError(res, err); }
    return res.json(201, event);
  });
};

// Update an event to have an attendee
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Event.findById(req.params.id, function (err, event) {
    if (err) { return handleError(res, err); }
    if(!event) { return res.send(404); }
    for(var i = 0; i < event.attendees.length; i++){
      if(event.attendees[i] === req.body.username){
        console.log("Error! User is already attending this event!");
        return handleError(res, err);
      }
    }
    event.attendees.push(req.body.username);
    var updated = _.merge(event, req.body);
    updated.markModified('attendees');
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, event);
    });
  });
};

// Deletes a event from the DB.
exports.destroy = function(req, res) {
  Event.findById(req.params.id).remove().exec();
};

function handleError(res, err) {
  console.log("Error: ", err);
  return res.send(500, err);
}