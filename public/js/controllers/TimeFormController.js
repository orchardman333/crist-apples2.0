'use strict';

angular.module('crist_farms')

.controller('TimeFormController', ['$scope', '$location', '$timeout', '$uibModal', 'EmployeeService', 'TimeFormService', function ($scope, $location, $timeout, $uibModal, employeeService, timeFormService) {
  var soundSuccess = new Audio('http://www.soundjay.com/button/beep-07.wav');
  var soundFailure = new Audio('http://www.soundjay.com/button/beep-10.wav');

  $scope.submit = function() {
    var data = {
      employeeId: $scope.scan,
      shiftIn: $scope.shiftStatus,
      jobId: $scope.jobId,
      managerId: null
    }
    timeFormService.submitTimeRecord(data, function(object) {
      $scope.modal(object, 750);
      $scope.startOver();
    });
  }

  $scope.refocus = function() {
    $scope.$broadcast('refocus');
  }

  $scope.selectShiftOptions = function() {
    if ($scope.scan == null) {
      $scope.error = true;
      $scope.errorColor = 'danger';
      $scope.errorMessage = 'Empty Barcode. Please Scan Again!';
      $timeout(function() {
        $scope.error = false;
        $scope.scan = null;
      $scope.refocus();
      }, 1000);
    }
    else if ($scope.scan.length == 6) {
      employeeService.LookupEmployee({barcode: $scope.scan}, function(decodedData) {
        if (decodedData.error) {
          $scope.error = true;
          $scope.errorColor = 'danger';
          $scope.errorMessage = 'Employee not found!';
          $timeout(function() {
            $scope.error = false;
            $scope.scan = null;
          }, 1000);
        }
        else {
          $scope.employeeName = decodedData.firstName + ' ' + decodedData.lastName;
          $scope.showEmployeeName = true;
        }
      });
    }
    else {
      $scope.error = true;
      $scope.errorColor = 'danger';
      $scope.errorMessage = 'Incorrect Barcode Type. Please Scan Again!';
      $timeout(function() {
        $scope.error = false;
        $scope.scan = null;
      }, 1000);
    }
  }

  $scope.clockIn = function() {
    $scope.shiftStatus = true;      //true for shifting in, false for shifting out
    $scope.showClockInOptions = true;
  }
  $scope.clockOut = function() {
    $scope.shiftStatus = false;
    $scope.submit();
  }
  $scope.startPacking = function() {
    $scope.jobId = 'h005'
    $scope.submit();
    //$scope.playAudio();
  }
  $scope.startCleaning = function() {
    $scope.jobId = 'h006'
    $scope.submit();
  }
  $scope.startOver = function() {
    $scope.showEmployeeName = false;
    $scope.showClockInOptions = false;
    $scope.shiftStatus = false;
    $scope.scan = null;
    $scope.refocus();
  }
  $scope.modal = function (object, time) {
    object.error? soundFailure.play() : soundSuccess.play();
    var modalInstance = $uibModal.open({
      templateUrl: 'js/views/modal_alert.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope) {
        $scope.message = object.titleMessage;
        $scope.color = object.error? 'btn-danger' : 'btn-success';
      }
    });
    if (!object.error) {
      $timeout(function() {
        modalInstance.close(1);
      }, time);
    }
  }
}]);
