'use strict';

angular.module('crist_farms')

.controller('OrchardRunLoadController', ['$scope', 'OrchardRunService', 'StorageTransferService', 'TruckService',
 function ($scope, orchardRunService, storageTransferService, truckService) {

   $scope.barCodes = [];
   $scope.displayBarCodes = $scope.barCodes.slice().reverse();
   $scope.truckDrivers = [];
   $scope.storageList = [];
   $scope.truckList = [];
   $scope.default_truck={id:''};
   $scope.comments = '';

    var d = new Date(Date.now()),
           month = '' + (d.getMonth() + 1),
           day = '' + d.getDate(),
           year = d.getFullYear();

   if (month.length < 2) month = '0' + month;
   if (day.length < 2) day = '0' + day;

   $scope.date = [year, month, day].join('-');

   truckService.GetTrucks(function (data) {
     $scope.truckList=data;
   });

   truckService.GetTruckDrivers(function (data) {
     $scope.truckDrivers=data;
   });

   storageTransferService.GetStorageList(function (data) {
      $scope.storageList =data;
   });

   orchardRunService.GetLoadSequenceId(function(data){
     $scope.loadSeqId = data.id;
   });

   $scope.removeBarCode = function(barcode){
    var index =  $scope.barCodes.indexOf(barcode);
     if (index > -1) {
          $scope.barCodes.splice(index, 1);
      }
      $scope.displayBarCodes = $scope.barCodes.slice().reverse();
      $scope.$broadcast('newItemAdded');
   };

   $scope.clearData = function(){
     $scope.barCodes = [];
     $scope.scan="";
     $scope.$broadcast('newItemAdded');
     $scope.displayBarCodes = $scope.barCodes.slice().reverse();
   };

   //console.log($scope.storageList);
   $scope.add_barcode = function(){
     if (angular.isUndefined($scope.scan) || $scope.scan === null  ){
       $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>No Barcode entered!</span></div>')
              setTimeout(function () {
                  $("div.alert").remove();
              }, 2000);
      $scope.clearData();
     }
     else{
       var callback = function(decodeData){
         var binId = '';
         if ($scope.scan.length == 17){
          binId = $scope.scan.substring(12, 17);
         }
         else {
           binId = $scope.scan.substring(10, 15);
         }
         var value = {
           barcode: $scope.scan,
           storage: $scope.default_storage,
           truckDriver: $scope.truckDriver,
          //  variety: decodeData.varietyName,
          //  strainName: decodeData.strainName,
          //  blockName: decodeData.blockName,
           nr_boxes: $scope.nr_boxes,
           comments: $scope.comments,
           truck_id: $scope.default_truck.id,
           load_seq_id: $scope.loadSeqId,
           bin_id: binId,
           date : $scope.date
         }
         console.log($scope.default_truck.id);

         $scope.barCodes.push(value);
         $scope.scan = "";
         $scope.$broadcast('newItemAdded');
         $scope.displayBarCodes = $scope.barCodes.slice().reverse();
       };

       orchardRunService.DecodeBarCode({barCode: $scope.scan}, callback);
     }
   };

   $scope.submit = function(){
      var data = {
        barCodes: $scope.barCodes
      };
      orchardRunService.SubmitLoadRun(data);
      orchardRunService.SaveData(data);
      window.location = "#/orchard_run_report";
   };

   $scope.cancel = function(){
     $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Load Cancelled</span></div>')
            setTimeout(function () {
                $("div.alert").remove();
            }, 2000);
    $scope.clearData();
    $scope.$broadcast('newItemAdded');
   };

 }]);