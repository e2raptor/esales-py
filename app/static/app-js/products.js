//function confirm_test(){
     //console.log('Entering confirm_test');
    //// Load native UI library
    //var gui = window.nwDispatcher.requireNwGui()
     //console.log('Surpasing require nw.gui');
    //// Get the current window
    //var win = gui.Window.get();
    //// Listen to the minimize event
    //win.on('minimize', function() {
      //console.log('Window is minimized');
    //});
    //// Minimize the window
    //win.minimize();
    //// Unlisten the minimize event
    //win.removeAllListeners('minimize');
    //// Create a new window and get it
    //var new_win = gui.Window.open('https://github.com');
    //// And listen to new window's focus event
    //new_win.on('focus', function() {
      //console.log('New window is focused');
    //});
//}

eventas.controller('ProductController', function($scope, $filter, $http){

    $scope.orderByField = 'firstName'; 
    $scope.reverseSort = false;
    $scope.exists = false;

    $scope.products = [];
    $scope.prod = {};

    //Aqui estoy llamando al route /productos en views.py via Ajax GET
    //La funcion en el py me devuelve: {'users':[dic1, dic2]}
     $http.get('/productos/get').
        success(function(data, status, headers, config) {
          $scope.products = data['products'];
      });
    //Por metodo POST llamo a add_user y le paso un diccionario tipo vals de open
    //para crear el nuevo objeto, lo agrego instantaneo en la tabla y limpio campos
      $scope.addProduct = function(){
              data = {'code':$scope.code, 
                      'description':$scope.description,
                      'sell_price':$scope.sell_price,
                      'purchase_price':$scope.purchase_price,
                      'maj_price':$scope.maj_price,
                      'has_stock':$scope.has_stock,
                      'iva':$scope.iva,
                      'quantity':$scope.quantity,
                      'min_stock':$scope.min_stock }

             $http.post("/productos/add_product", data)
                        .success(function(res){
                         //Tanto para success como para error, el parametro res
                         //Es lo que me devuelve la funcion que se llama del py
                         //en formato json
                          console.log(res);
                          if (res['code_exists'] == true) { $scope.code_exists = true;}
                          else{
                              $scope.products = res['products'];
                              $scope.code = '';
                              $scope.description = '';
                              $scope.sell_price = '';
                              $scope.purchase_price = '';
                              $scope.code_exists = false;
                              $scope.maj_price = '';
                              $scope.has_stock = false;
                              $scope.quantity = '';
                              $scope.min_stock = ''
                              $(".alert").show('fade');
                                window.setTimeout(function() {
                                    $(".alert").fadeTo(500, 0).slideUp(500, function(){
                                        $(this).remove(); 
                                    });
                                }, 2000);
                          }
                    })
                    .error(function(res){
                      console.log(res);
                    });
      };

      $scope.editProduct = function(p){
         $http.get('/productos/' + p.id)
            .success(function(res) {
              $scope.prod = res.product;
              $('#myModal').modal('show');
          })
            .error(function(res){
              console.log(res);
            });
      }
        $scope.deleteProduct = function(p){
            bootbox.confirm("Desea eliminar este producto?", function(result) {
            if (result){
                $http.delete('/productos/' + p.id)
                  .success(function(response, status, headers, config){
                    var index = $scope.products.indexOf(p);
                    $scope.products.splice(index,1);
                  })
                  .error(function(response, status, headers, config){
                    $scope.error_message = response.error_message;
                    console.log(response.error_message)
                  });
            }
        }); 
        }
});

