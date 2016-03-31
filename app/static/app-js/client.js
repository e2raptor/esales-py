eventas.controller('ClientController', function($scope, $filter, $http){

    $scope.orderByField = 'name'; 
    $scope.reverseSort = false;
    $scope.exists = false;

    $scope.clients = [];
    $scope.client = {};

    //Aqui estoy llamando al route /clientes en client.py via Ajax GET
    //La funcion en el py me devuelve: {'users':[dic1, dic2]}
     $http.get('/clientes/get').
        success(function(data, status, headers, config) {
          $scope.clients = data['clients'];
      });
    //Por metodo POST llamo a add y le paso un diccionario tipo vals de open
    //para crear el nuevo objeto, lo agrego instantaneo en la tabla y limpio campos
      $scope.addClient = function(){
              data = {'name':$scope.name, 
                      'vat':$scope.vat,
                      'vat_type':$scope.vat_type,
                      'credit_limit':$scope.credit_limit
                     }

             $http.post("/clientes/add", data)
                        .success(function(res){
                         //Tanto para success como para error, el parametro res
                         //Es lo que me devuelve la funcion que se llama del py
                         //en formato json
                          console.log(res);
                          if (res['code_exists'] == true) { $scope.code_exists = true;}
                          else{
                              $scope.clients = res['clients'];
                              $scope.name = '';
                              $scope.vat = '';
                              $scope.vat_type = 'ced';
                              $("#alert-add").show('fade');
                                window.setTimeout(function() {
                                    $("#alert-add").fadeTo(500, 0).slideUp(500, function(){
                                        $(this).remove(); 
                                    });
                                }, 2000);
                          }
                    })
                    .error(function(res){
                      console.log(res);
                    });
      };

      $scope.updateClient = function(){
              data = {'name': $('#m_name').val(),
                      'vat':$('#m_vat').val(),
                      'id':$('#client_id').val(),
                      'vat_type':$('#modal_vat_type').val(),
                      'credit_limit':$('#m_credit_limit').val()
                     }

             $http.post("/clientes/update", data)
                        .success(function(res){
                         //Tanto para success como para error, el parametro res
                         //Es lo que me devuelve la funcion que se llama del py
                         //en formato json
                          console.log(res);
                          if (res['code_exists'] == true) { $scope.code_exists = true;}
                          else{
                              $scope.clients = res['clients'];
                              $('#modalClient').modal('hide');
                              $("#alert-upd").show('fade');
                                window.setTimeout(function() {
                                    $("#alert-upd").fadeTo(500, 0).slideUp(500, function(){
                                        $(this).remove(); 
                                    });
                                }, 2000);
                          }
                    })
                    .error(function(res){
                      console.log(res);
                    });
      };

      $scope.getVat = function(vat) {
          if(vat == 'ruc') return 'RUC';
          if(vat == 'pas') return 'PASAPORTE';
          if(vat == 'ced') return 'CÉDULA';
      }

      $scope.editClient = function(c){
         $http.get('/clientes/' + c.id)
            .success(function(res) {
              $scope.client = res.client;
              $('#modal_vat_type').val(res.client.vat_type);
              $('#modalClient').modal('show');
          })
            .error(function(res){
              console.log(res);
            });
      }
        $scope.deleteClient = function(p){
        $.confirm({
            title: 'Eliminar?',
            content: 'Se eliminará también su estado de cuenta',
            confirm: function(){
                $http.delete('/clientes/' + p.id)
                  .success(function(response, status, headers, config){
                    var index = $scope.clients.indexOf(p);
                    $scope.clients.splice(index,1);
                  })
                  .error(function(response, status, headers, config){
                    $scope.error_message = response.error_message;
                    console.log(response.error_message)
                  });
            },
            confirmButton: 'Continuar',
            cancelButton: 'Cancelar',
            confirmButtonClass: 'btn-info',
        });
        }
});

