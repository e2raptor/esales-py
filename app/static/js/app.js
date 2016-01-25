eventas.controller('MainController', function($scope, $http) {
    $scope.users = []

    //Aqui estoy llamando al route /users en views.py via Ajax GET
    //La funcion en el py me devuelve: {'users':[dic1, dic2]}
      $http.get('/users').
        success(function(data, status, headers, config) {
          $scope.users = data['users'];
        });
    $scope.onKeyDownResult = "";
    $scope.onKeyUpResult = "";
    $scope.onKeyPressResult = "";

    // Utility functions

    var getKeyboardEventResult = function (keyEvent, keyEventDesc)
    {
      return keyEventDesc + " (keyCode: " + (window.event ? keyEvent.keyCode : keyEvent.which) + ")";
    };

    // Event handlers
    $scope.onKeyDown = function ($event) {
      $scope.onKeyDownResult = getKeyboardEventResult($event, "Key down");
    };

    //Por metodo POST llamo a add_user y le paso un diccionario tipo vals de open
    //para crear el nuevo objeto, lo agrego instantaneo en la tabla y limpio campos
      $scope.add_user = function(){
          data = {'name':$scope.name, 'phone':$scope.phone}
         $http.post("/add_user", data)
                    .success(function(res){
                     //Tanto para success como para error, el parametro res
                     //Es lo que me devuelve la funcion que se llama del py
                     //en formato json
                      console.log(res);
                      $scope.users.push(res);
                      $scope.name = '';
                      $scope.phone = '';
                    })
                    .error(function(res){
                      console.log(res);
                    });
      };
      
      //Funcion para eliminar  un usuario
        $scope.delete_user = function(user){
        if (confirm("Desea eliminar este usuario?")){
        $http.delete('/users/' + user.id)
          .success(function(response, status, headers, config){
            var index = $scope.users.indexOf(user);
            $scope.users.splice(index,1);
          })
          .error(function(response, status, headers, config){
            $scope.error_message = response.error_message;
          });
        }}

});
