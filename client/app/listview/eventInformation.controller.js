'use strict';

angular.module('goApp')
  .controller('EventInformationCtrl', function ($scope, $location, $http, $routeParams, $rootScope, $cookieStore, User, Auth, listviewService) {

    $scope.eventId = $routeParams.id;
  	$scope.attend = {
      'confirmation': false
    };
    $scope.currentUser = {};
    $scope.test = {};



    //Set who the current user is
    var currUser = $http.get('/api/users/me')
      .success(function(data, status, headers, config){
        return data;
      });

    currUser.then(function(result){
      $scope.currentUser = result.data;
      //Get all the User's events.
      $http.get('/api/events/' + $scope.eventId)
        .success(function(data){
          //Get current user to display their data
          $scope.event = data;
        });
    });

    $scope.attending = function(event){
      $scope.attend.confirmation = true;
      $http.put('/api/events/' + event._id, $scope.currentUser)
        .success(function(data) {
          console.log("Success. Event " + event._id + " was edited.");
        });
      $http.put('/api/users/' + $scope.currentUser._id, event)
        .success(function(data){
          console.log("Success. User " + $scope.currentUser.name);
        });

    };

  });
 