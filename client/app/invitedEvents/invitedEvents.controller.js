'use strict';

angular.module('goApp')
.controller('InvitedEventsCtrl', function ($scope, $http) {

	$scope.currentUser = {};
	$scope.events = [];



    //Set who the current user is
    var currUser = $http.get('/api/users/me')
      .success(function(data, status, headers, config){
        return data;
      });

    currUser.then(function(result){
      $scope.currentUser = result.data;
      //Get all Events.
      $http.get('/api/users/invited/events/' + $scope.currentUser._id)
        .success(function(data){
          $scope.events = data;
        })
    });

    $scope.attending = function(event){
      if(event.userAlreadyAttending == false)
          event.userAlreadyAttending = true;
      $http.put('/api/events/' + event._id, $scope.currentUser)
        .success(function(data) {
          console.log("Success. Event " + event.eventName + " was edited.");
        });
      $http.put('/api/users/' + $scope.currentUser._id, event)
        .success(function(data){
          console.log("Success. User " + $scope.currentUser.name);
        });
    };

        /*.then(function(){
          //Find if the current user is attending any of these events
          for(var i = 0; i < $scope.events.length; i++){
            for(var j = 0; j < $scope.events[i].attendees.length; j++){
              if($scope.events[i].attendees[j] === $scope.currentUser.username){
                $scope.events[i].userAlreadyAttending = true;
                break;
              }
            }
          }
        });
    });	*/


	/*var getCurrentUser = $http.get('/api/users/me')
	.success(function(data){
		console.log("Data: ", data);
		$scope.currentUser = data;
		$http.get('/api/users/invited/events/' + $scope.currentUser._id)
		.success(function(data){
			$scope.events = data;
		});
	});*/
});
