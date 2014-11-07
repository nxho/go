'use strict';

angular.module('goApp')
.controller('ProfileCtrl', function ($scope, $cookieStore, $routeParams, User, Auth, $http, filterFilter) {

  $scope.individualEvent = {};
  $scope.showEditEventPage = false;
  $scope.selectedFriends = [];
  $scope.eventId = "";
  $scope.eventObj = {
    'startDate': "",
    'endDate': "",
    'startTime': "",
    'endTime': "",
    'eventLocation': "",
    'eventName': "",
    'attendees': [],
    'invited': [],
    'creator': ""
  };
  $scope.attend = {
    'confirmation': false
  };

    //Set who the current user is
    var currUser = $http.get('/api/users/me')
      .success(function(data, status, headers, config){
        return data;
      });

    currUser.then(function(result){
      $scope.user = result.data;
      console.log("User: ", $scope.user);
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
    });

  $scope.showEditEvent = function() {
    $scope.showEditEventPage = true;
    //editEventModal.$promise.then(editEventModal.show);
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

//Pending = I have a friend request pending
//Requested = I have requested someone to be my friend

/*$scope.addPendingFriend = function(){
  console.log("$selected freinds length: ", $scope.selectedFriends.length);
  for(var i = 0; i < $scope.selectedFriends.length; i++){
    $http.put('/api/users/friends/pending/confirm/' + $scope.user.username, $scope.selectedFriends[i])
    .success(function(data){
    });

    var friendObject = {
      username: $scope.user.username, 
      invited: false, 
      pending: true, 
      requested: true
    };

    //In this case, user == schan93. We loop through HIS array and we get the one that matches the user's username
    $http.put('/api/users/friends/pending/confirm/' + $scope.selectedFriends[i].username, 
      friendObject)
    .success(function(data){
    });
    $scope.selectedFriends[i].requested = true;
  }
  friendHelper.friendsToAdd = false;
};*/

    $scope.attending = function(event){
      $scope.attend.confirmation = true;

      $http.put('/api/events/' + event._id, $scope.currentUser)
        .success(function(data) {
          console.log("Success. Event " + event.eventName + " was edited.");
        });
      $http.put('/api/users/' + $scope.currentUser._id, event)
        .success(function(data){
          console.log("Success. User " + $scope.currentUser.name);
        });
    };


$scope.editEvent = function(id) {
  console.log("Event Obj: ", $scope.events[id]);
  $scope.eventObj.eventName = $scope.events[id].eventName;
  $scope.eventObj.eventLocation = $scope.events[id].eventLocation;
  $scope.eventObj.startDate = $filter('date')($scope.events[id].startDate, 'shortDate');
  $scope.eventObj.endDate = $filter('date')($scope.events[id].endDate, 'shortDate');
  $scope.eventObj.startTime = $filter('date')($scope.events[id].startTime, 'shortTime');
  $scope.eventObj.endTime = $filter('date')($scope.events[id].endTime, 'shortTime');
  console.log("Event Obj: ", $scope.eventObj.startTime);

  for(var i = 0; i < $scope.events[id].invited.length; i++){
    $scope.eventObj.invited.push($scope.events[id].invited[i]);
  }
  $scope.eventId = id;
}


$scope.getEvent = function(event){
  $scope.individualEvent = event;
}

});