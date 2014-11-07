'use strict';

angular.module('goApp')
.controller('UserProfileCtrl', function ($scope, $cookieStore, User, Auth, $http, listviewService, $q, $routeParams) {

  $scope.currentUsername = $routeParams.username;
  $scope.currentUser = {};
  $scope.individualEvent = {};
  $scope.attend = {
    'confirmation': false
  };
  $scope.showEditEventPage = false;
  $scope.friend = {
    'friendText': "Friend me!",
    'friendRequest': false
  };
  $scope.showFriendButton = {
    'show': false
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

  var getCurrentUser = $http.get('/api/users/me')
  .success(function(result){
    return result;
  });

  var showFriendsButton = getCurrentUser.then(function(result){
    $scope.currentUser = result.data;
    $http.get('/api/users/users/' + $scope.currentUsername)
      .success(function(data, status, headers, config){
        //Get the users profile based on whoever you click
        $scope.currentUserViewing = data;
        $scope.realCurrentUserViewing = data;  
        for(var i = 0; i < data.friends.length; i++){
          if(data.friends[i].username === $scope.currentUser.username){
            $scope.showFriendButton.show = true;
            break;
          }
        }      
      }).then(function(){
      $http.get('/api/users/events/' + $scope.currentUserViewing._id)
      .success(function(data, status, headers, config){
          //Used for displaying the events that an individual is going to (we need to populate them)
          $scope.currentUserViewing = data;
          for(var i = 0; i < $scope.currentUserViewing.eventsAttending.length; i++){
            for(var k = 0; k < $scope.currentUserViewing.eventsAttending[i].attendees.length; k++){
              if($scope.currentUser.username === $scope.currentUserViewing.eventsAttending[i].attendees[k]){
                $scope.currentUserViewing.eventsAttending[i].userAlreadyAttending = true;
                break;
              }
            } 
          }
        }); 
    });
  });

    //Set who the current user is
    /*var currUser = $http.get('/api/users/me')
      .success(function(data, status, headers, config){
        return data;
      });

    currUser.then(function(result){
      $scope.user = result.data;
      //Get all the User's events.
      $http.get('/api/users/events/' + $scope.user._id)
        .success(function(data){
          //Get current user to display their data
          $scope.currentUser = data;
        })
        .then(function(){
          //Find if the current user is attending any of these events
          for(var i = 0; i < $scope.currentUser.eventsAttending.length; i++){
            for(var j = 0; j < $scope.currentUser.eventsAttending[i].attendees.length; j++){
              if($scope.currentUser.eventsAttending[i].attendees[j] === $scope.currentUser.username){
                $scope.currentUser.eventsAttending[i].userAlreadyAttending = true;
                break;
              }
            }
          }
        });
    });*/




    $scope.attending = function(event){
      $scope.attend.confirmation = true;
      if($cookieStore.get('token')){
        $scope.currentUser = Auth.getCurrentUser();
      }
      $http.put('/api/events/' + event._id, $scope.currentUser)
        .success(function(data) {
          console.log("Success. Event " + event.eventName + " was edited.");
        });
      $http.put('/api/users/' + $scope.currentUser._id, event)
        .success(function(data){
          console.log("Success. User " + $scope.currentUser.name);
        });
    };



  $scope.alreadyFreinds = function(){
    console.log("Friends!");
    for(var i = 0; i < $scope.currentUser.friends.length; i++){
          console.log("test:", $scope.currentUser.friends[i]);
          console.log("Real current: ", $scope.realCurrentUserViewing.username);
      if($scope.currentUser.friends[i].username === $scope.realCurrentUserViewing.username && 
        $scope.currentUser.friends[i].requested == true && $scope.currentUser.friends[i].pending == true){
        return true;
      }
    }
  };

      $scope.deleteEvent = function(event) {
      //$scope.events.splice($scope.events.indexOf(event), 1); 
      //console.log("Delted: ", event);
      var confirmDelete = confirm("Are you sure you want to delete this event?");
      if(confirmDelete == true){
        $http.delete('/api/events/' + $scope.events[$scope.events.indexOf(event)]._id)
          .success(function(data) {
            console.log("Success. Event " + $scope.events[$scope.events.indexOf(event)].eventName + " deleted.");
          });
        $http.get('/api/events')
          .success(function(data, status, headers, config) {
            $scope.events = data;
          });
        }
        else{

        }
    }



  $scope.editEvent = function(id) {
    $scope.eventObj.eventName = $scope.currentUserViewing.eventsAttending[id].eventName;
    $scope.eventObj.eventLocation = $scope.currentUserViewing.eventsAttending[id].eventLocation;
    $scope.eventObj.startDate = $scope.currentUserViewing.eventsAttending[id].startDate;
    $scope.eventObj.endDate = $scope.currentUserViewing.eventsAttending[id].endDate;
    $scope.eventId = id;
  }

  //Request friend
  $scope.friendMe = function(){
    console.log("Current User: ", $scope.currentUser);
    $scope.friend.friendRequest = true;
    $scope.friend.friendText = "Friend Request Sent!"

    $http.put('/api/users/' + $scope.currentUser._id + "/" + $scope.currentUser.username, $scope.realCurrentUserViewing)
    .success(function(data) {
      console.log("Success. Friend " + $scope.currentUser.username + " has requested to be friends with " + 
        $scope.realCurrentUserViewing.username);
    });

    $http.put('/api/users/friends/' + $scope.realCurrentUserViewing._id + "/" + 
      $scope.realCurrentUserViewing.username, $scope.currentUser)
    .success(function(data) {
      console.log("Success. Friend " + $scope.realCurrentUserViewing.username + 
        " has requested to be friends with " + 
        $scope.currentUser.username);
    }); 
  };

});