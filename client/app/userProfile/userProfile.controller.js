'use strict';

angular.module('goApp')
.controller('UserProfileCtrl', function ($scope, $cookieStore, User, Auth, $http, listviewService, $q, $routeParams) {

  $scope.username = $routeParams.username;
  $scope.user = {};
  $scope.individualEvent = {};
  $scope.showEditEventPage = false;
  $scope.friend = {
    'friendText': "Friend me!",
    'friendRequest': false
  };
  $scope.eventId = "";
  $scope.eventObj = {
    'startDate': "",
    'endDate': "",
    'eventLocation': "",
    'eventName': "",
    'attendees': [],
    'invited': [],
    'creator': ""
  };
  $scope.currentUserViewing = {};
  $scope.events  = [];

  $scope.getEvent = function(event){
    $scope.individualEvent = event;
  };
  $scope.showEditEvent = function() {
    $scope.showEditEventPage = true;
    //editEventModal.$promise.then(editEventModal.show);
  };

  $http.get('/api/users/me')
    .then(function(result){
      $scope.user = result.data;
      console.log("User: ", $scope.user);
  });

  $http.get('/api/users/users/' + $scope.username)
    .success(function(data, status, headers, config){
      //Get the users profile based on whoever you click
      $scope.currentUserViewing = data;
      $scope.realCurrentUserViewing = data;
      $http.get('/api/users/events/' + $scope.currentUserViewing._id)
      .success(function(data, status, headers, config){
          //Used for displaying the events that an individual is going to (we need to populate them)
          $scope.currentUserViewing = data;
        }); 
    });


  $scope.alreadyFreinds = function(){
    console.log("Friends!");
    for(var i = 0; i < $scope.user.friends.length; i++){
          console.log("test:", $scope.user.friends[i]);
          console.log("Real current: ", $scope.realCurrentUserViewing.username);
      if($scope.user.friends[i].username === $scope.realCurrentUserViewing.username && 
        $scope.user.friends[i].requested == true && $scope.user.friends[i].pending == true){
        return true;
      }
    }
  };



  $scope.editEvent = function(id) {
    $scope.eventObj.eventName = $scope.currentUserViewing.eventsAttending[id].eventName;
    $scope.eventObj.eventLocation = $scope.currentUserViewing.eventsAttending[id].eventLocation;
    $scope.eventObj.startDate = $scope.currentUserViewing.eventsAttending[id].startDate;
    $scope.eventObj.endDate = $scope.currentUserViewing.eventsAttending[id].endDate;
    $scope.eventId = id;
  }

  //Request friend
  $scope.friendMe = function(){
    $scope.friend.friendRequest = true;
    $scope.friend.friendText = "Friend Request Sent!"

    $http.put('/api/users/' + $scope.user._id + "/" + $scope.user.username, $scope.realCurrentUserViewing)
    .success(function(data) {
      console.log("Success. Friend " + $scope.user.username + " has requested to be friends with " + 
        $scope.realCurrentUserViewing.username);
    });

    $http.put('/api/users/friends/' + $scope.realCurrentUserViewing._id + "/" + 
      $scope.realCurrentUserViewing.username, $scope.user)
    .success(function(data) {
      console.log("Success. Friend " + $scope.realCurrentUserViewing.username + 
        " has requested to be friends with " + 
        $scope.user.username);
    }); 
  };

});