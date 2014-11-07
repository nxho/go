'use strict';

angular.module('goApp')
  .controller('CreateEventCtrl', function ($scope, $http, $location, Auth, listviewService) {


    $scope.showEditEventPage = false;//listviewService.getEditEventPage();
    $scope.currentUser = {};
    $scope.invitedFriends = [];
    $scope.date = new Date();
    $scope.submitted = false;
    $scope.location = "";
    $scope.locationCoords = {};
    $scope.place ="";
    $scope.locationWrong = {
      'wrong': false
    };
    //Temporary variables because when we try to do Date.parse, our variables turn into dates which is not what we want
    $scope.temp = {
      'startDate': "",
      'startTime': "",
      'endTime': "",
      'endDate': ""
    };

    $scope.eventObj = {
      'startDate': "",
      'endDate': "",
      'startTime': "",
      'endTime': "",
      'eventLocation': "",
      'eventName': "",
      'attendees': [],
      'invited': [],
      'creator': "",
      'eventLocationLat': 0,
      'eventLocationLng': 0,
      'userAlreadyAttending': false
    };

    $http.get('/api/users/me')
      .then(function(result){
        $scope.currentUser = result.data;
    });


    $scope.createForm = function(isValid){
      $scope.submitted = true;
      if($scope.eventObj.eventLocation == "" || $scope.eventObj.eventLocation === null){
        console.log("Requires a location");
        $scope.locationWrong.wrong = true;
      }
      var startMonth = parseInt($scope.eventObj.startDate.split("/")[0]);
      var startDay = parseInt($scope.eventObj.startDate.split("/")[1]);
      var startYear = parseInt($scope.eventObj.startDate.split("/")[2]);
      var endMonth = parseInt($scope.eventObj.endDate.split("/")[0]);
      var endDay = parseInt($scope.eventObj.endDate.split("/")[1]);
      var endYear = parseInt($scope.eventObj.endDate.split("/")[2]);
      $scope.temp.startDate = Date.parse($scope.eventObj.startDate);
      $scope.temp.endDate = Date.parse($scope.eventObj.endDate);
        //TODO: Check for PAST dates like in the here thing
      var currentDateYear = $scope.date.getFullYear().toString().substr(2,2);
      var currentMonth = $scope.date.getMonth() + 1;

      if((startDay < $scope.date.getDate() && startMonth < currentMonth && startYear < currentDateYear)
        || isNaN($scope.temp.startDate) || isNaN($scope.temp.endDate) || (endDay < $scope.date.getDate() &&
          endMonth < currentMonth && endYear < currentDateYear)){
        isValid = false;
        console.log("Invalid date.")
      }
      else if($scope.eventObj.startTime > $scope.eventObj.endTime &&
       (startDay === endDay && startMonth === endMonth && startYear === endYear)|| 
        $scope.eventObj.startTime === $scope.eventObj.endTime ||
        $scope.eventObj.startTime === undefined || $scope.eventObj.endTime === undefined){
        isValid = false;
        console.log("Invalid time.");
      }
      $scope.eventObj.eventLocation = $scope.location;
      $scope.eventObj.eventLocationLat = $scope.locationCoords.latitude;
      $scope.eventObj.eventLocationLng = $scope.locationCoords.longitude;
      if(isValid){
        $scope.eventObj.eventLocation = $scope.location;
        $scope.eventObj.startDate = Date.parse($scope.eventObj.startDate);
        $scope.eventObj.creator = $scope.currentUser.username;
        $scope.eventObj.attendees.push($scope.eventObj.creator);
        $http.post('/api/events', $scope.eventObj).
        success(function(data){
          $scope.eventObj = data;
        })
        .then(function(){
          for(var i = 0; i < $scope.eventObj.invited.length; i++){
            $http.put('/api/users/set/invited/events/current/' + $scope.eventObj.invited[i].username, $scope.eventObj)
            .success(function(data){
              $scope.eventObj = data;
            });
          }
        })
        .then(function(){
          $http.put('/api/users/' + $scope.currentUser._id, $scope.eventObj)
            .success(function(data){
              console.log("Success. User " + $scope.currentUser.name);
            });
        });
        $location.path('/');
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
