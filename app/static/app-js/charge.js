eventas.controller('ChargeController', function($scope, $filter, $http){

    $scope.selected_line = false;
    $scope.total_amount = 0.00;
    $scope.product_quantity = 1;
    $scope.tickets = {};
    $scope.active = function(){
        act = $("ul#tabSales li.active a").attr('id');
        $("a#cobrar").attr('href', '/cobrar?ticket='+act);
        return act;
    }

     $http.get('/productos/get/description').
        success(function(data, status, headers, config) {
         $("#product_sale").autocomplete({source:data['products']});
      });

     $http.get('/ventas/lineas/get').
        success(function(data, status, headers, config) {
          $scope.tickets = data['lines'];
          update_ticket_class(data['act_tickets']);
          $scope.updateAmount();
      });


});
