'use strict';

angular.module('goApp')
  .controller('ListviewCtrl', function ($filter, Auth, $scope, $http, $location, listviewService, $routeParams, $cookieStore, $modal, User, $window) {
    $scope.location = "";
    $scope.events = [];
    $scope.invitedFriends = [];
    $scope.individualEvent = {};
    $scope.eventId = "";
    $scope.searchText = "";
    $scope.showEditEventPage = false;
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
    $scope.user = {
      'userAlreadyAttending': false
    };
    
    $scope.currentUser = {};

    $scope.getEvent = function(event){
      $scope.individualEvent = event;
    };

    //Set who the current user is
    $http.get('/api/users/me')
      .then(function(result){
        $scope.currentUser = result.data;
      });

    $scope.usersAttending = [];
    $scope.temp = [];
 
    $scope.usersAttendingTest = {};
    //Getting All Events
    $http.get('/api/events')
      .success(function(data, status, headers, config) {
        $scope.events = data;
        console.log("Events: ", $scope.events);
        for(var i = 0; i < $scope.events.length; i++){
          for(var k = 0; k < $scope.events[i].attendees.length; k++){
            if($scope.currentUser.username === $scope.events[i].attendees[k])
              $scope.user.userAlreadyAttending = true;
          }
        }//TODO: Find a way to see if u can make the attending button greenz
      });

    $scope.passUser = function(user){
      listviewFactory.setUser(user);
    };


    $scope.grabEventData = function(eventId){
      $scope.show.event = false;
      listviewFactory.addEvent(eventId);
    };

    // Keeping modal code in case we end up using it. We can delete it in a bit.
    /*
    var editEventModal = $modal({
      title: 'Edit Event',
      scope: $scope,
      animation: 'am-fade-and-scale',
      template: 'app/listview/editEvent.html',
      show: false
    });
    */
    $scope.showEditEvent = function() {
      $scope.showEditEventPage = true;
      //editEventModal.$promise.then(editEventModal.show);
    };
    $scope.hideEditEvent = function() {
      $window.location.reload(); // used this function because the googlePlaces directive wasn't reloading
                                 // correctly when I simply activated the ng-show again for the listview
      //editEventModal.$promise.then(editEventModal.hide);
    };

    // for development purposes
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

    $scope.attending = function(event){
      $scope.user.userAlreadyAttending = true;
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
    // The only thing that doesn't work right now for editEvent has to do
    // with the googlePlaces custom directive. The field does not automatically
    // fill in if you put $scope.eventObj.eventLocation as the ng-model. As a
    // result, you have to retype the location when you edit an event.
    $scope.editEvent = function(id) {
      console.log("ID: ", id);
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
    $scope.createForm = function(isValid) {
      $scope.submitted = true;
      $scope.temp.startDate = Date.parse($scope.eventObj.startDate);
      $scope.temp.endDate = Date.parse($scope.eventObj.endDate);
      if($scope.temp.startDate < $scope.date || $scope.temp.endDate < $scope.temp.startDate
        || isNaN($scope.temp.startDate || isNaN($scope.temp.endDate))){
        isValid = false;
        console.log("Invalid date.")
      }
      else if($scope.eventObj.startTime > $scope.eventObj.endTime || 
        $scope.eventObj.startTime === $scope.eventObj.endTime ||
        $scope.eventObj.startTime === undefined || $scope.eventObj.endTime === undefined){
        isValid = false;
        console.log("Invalid time.");
      }
      if(isValid){
        $scope.eventObj.eventLocation = $scope.location;
        $scope.eventObj.startDate = Date.parse($scope.eventObj.startDate);
        $scope.eventObj.creator = $scope.currentUser.username;


        $http.put('/api/events/' + $scope.events[$scope.eventId]._id, $scope.eventObj)
        .success(function(data) {
          console.log("Success. Event " + $scope.eventId + " was edited.");
          for(var i = 0; i < data.invited.length; i++){
            $http.put('/api/users/set/invited/events/current/' + data.invited[i].username, data)
            .success(function(data){
              console.log("Successfully invited Friends to event");
            });
          }
          $location.path('/');
        });
      }
      else{
        console.log("Not valid.");
      }
    };

    $scope.createForm = function(isValid){
      $scope.submitted = true;
      $scope.temp.startDate = Date.parse($scope.eventObj.startDate);
      $scope.temp.endDate = Date.parse($scope.eventObj.endDate);
      if($scope.temp.startDate < $scope.date || $scope.temp.endDate < $scope.temp.startDate
        || isNaN($scope.temp.startDate || isNaN($scope.temp.endDate))){
        isValid = false;
        console.log("Invalid date.")
      }
      else if($scope.eventObj.startTime > $scope.eventObj.endTime || 
        $scope.eventObj.startTime === $scope.eventObj.endTime ||
        $scope.eventObj.startTime === undefined || $scope.eventObj.endTime === undefined){
        isValid = false;
        console.log("Invalid time.");
      }
      if(isValid){
        $scope.eventObj.eventLocation = $scope.location;
        $scope.eventObj.startDate = Date.parse($scope.eventObj.startDate);
        $scope.eventObj.creator = $scope.currentUser.username;
        $http.post('/api/events', $scope.eventObj).
        success(function(data){
          console.log("Data: ", data);
          for(var i = 0; i < data.invited.length; i++){
            $http.put('/api/users/set/invited/events/current/' + data.invited[i].username, data)
            .success(function(data){
              console.log("Successfully invited Friends to event");
            });
          }
          $location.path('/');
        });
      }
      else{
        console.log("Not valid.");
      }
    };

    $scope.addFriendsToInvite = function(){
      //Incase we need to add/delete friends from being invited
      $scope.eventObj.invited = [];
      for(var i = 0; i < $scope.invitedFriends.length; i++){
        var friendObj = {username: ""};
        friendObj.username = $scope.invitedFriends[i].username;
        $scope.eventObj.invited.push(friendObj);
      }
    }; 
  });
