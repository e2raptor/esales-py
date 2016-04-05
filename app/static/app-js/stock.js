eventas.controller('StockController', function($scope, $filter, $http){


     $scope.code = '';
     $scope.description = '';
     $scope.current_qty = '';

     $http.get('/productos/get/description').
        success(function(data, status, headers, config) {
         $("#code").autocomplete({source:data['products']});
      });

     $('#code').blur(function(){
        alert($('#code').val());
        $http.get('/productos/get' + p.id)
            .success(function(res) {
              $scope.prod = res.product;
              $('#myModal').modal('show');
         })
            .error(function(res){
              console.log(res);
        });

     })
});

