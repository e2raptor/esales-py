function charge(){
     console.log('Entering confirm_test');
    // Load native UI library
    //var gui = window.nwDispatcher.requireNwGui();
    var gui = require("nw.gui");
     console.log('Surpasing require nw.gui');
    // Get the current window
    var win = gui.Window.get();
    // Listen to the minimize event
    win.on('minimize', function() {
      console.log('Window is minimized');
    });
    // Minimize the window
    win.minimize();
    // Unlisten the minimize event
    win.removeAllListeners('minimize');
    // Create a new window and get it
    var new_win = gui.Window.open('https://github.com');
    // And listen to new window's focus event
    new_win.on('focus', function() {
      console.log('New window is focused');
    });
}

function update_total_amount(lines){
    var amount = 0;
    lines.forEach(function(l) {
        amount = amount + l.amount;
    });
    return amount;
}

function update_ticket_class(tickets){
    tickets.forEach(function(ticket) {
        $('#div_'+ticket).removeClass('hidden');
        $('#'+ticket).removeClass('hidden');
    });
}

eventas.controller('SalesController', function($scope, $filter, $http){

    $scope.selected_line = false;
    $scope.total_amount = 0.00;
    $scope.product_quantity = 1;
    $scope.tickets = {};

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

     //Para cuando cambien de ticket que se actualice el monto
     $scope.updateAmount = function(){
             var active = $("ul#tabSales li.active a").attr('id');
             $scope.total_amount = update_total_amount($scope.tickets[active])
     }

     //PERMITE SELECCIONAR UNA LINEA
     $scope.selectLine = function(l){
         var active = $("ul#tabSales li.active a").attr('id');
         tr_id = "#tr_"+active+"_"+l.id;
         $('tr').filter(function(){
             return this.parentNode.id == 'tbody_'+active;
         }).removeClass('info');
         $(tr_id).addClass("info");
         $scope.selected_line = tr_id;
     }

    //CARGA EL FORM PARA CAMBIAR CANTIDAD DE UNA LINEA
     $scope.modifyLine = function(l){
         var active = $("ul#tabSales li.active a").attr('id');
         $scope.stock = 0;
         var current_qty = 0;
         if($scope.selected_line != false){
             var id = $scope.selected_line.split("_");
             //Muestra los datos en el form
             $http.get('/ventas/lineas/'+id[1]+'/'+id[2]).
                success(function(data, status, headers, config) {
                  $scope.stock = data.line.stock;
                  $scope.ticket = data.lines;
              });
            $.confirm({
                title: 'Modificar línea',
                content: 'url:ventas/form/modificar/linea',
                confirmButton: 'Aceptar',
                cancelButton: 'Cancelar',
                confirmButtonClass: 'btn-primary',
                keyboardEnabled: true,
                confirm: function () {
                    var input = this.$b.find('input#input-quantity');
                    var over = this.$b.find('#over');
                    var no_quantity = this.$b.find('#no_quantity');
                    if (input.val() == 0) {
                        no_quantity.show();
                        return false;
                    } 
                    else if(input.val() == ''){
                        return false;
                    }
                    else if(input.val() > $scope.stock){
                        over.show();
                        return false;
                    }
                    else {
                         //Actualizo la cantidad
                         data = {'id':id[2], 'qty': input.val()}
                         $http.post("/ventas/modificar/linea", data)
                             .success(function(res){
                                 $scope.tickets = res['lines'];
                                 update_ticket_class(res['act_tickets']);
                                 $scope.total_amount = update_total_amount($scope.tickets[id[1]]);
                             });
                    }
                }
            });
         }
         else{
             $.alert({
                title: 'Seleccione',
                content: 'Debe seleccionar una línea del ticket para modificar',
                keyboardEnabled:true,
                confirmButton: 'Aceptar',
                confirmButtonClass: 'btn-info',
             });
         }
     }

    //BORRA REALMENTE LA LINEA LLAMANDO LA API
        $scope.deleteSaleLine = function(ticket, id){
            $http.delete('/ventas/lineas/' + ticket +'/'+ id)
              .success(function(response, status, headers, config){
                $scope.tickets = response['lines'];
                update_ticket_class(response['act_tickets']);
                $scope.total_amount = update_total_amount($scope.tickets[ticket])
              })
              .error(function(response, status, headers, config){
                $scope.error_message = response.error_message;
                console.log(response.error_message)
              });
        }; 

    //AGREGAR NUEVA LINEA
      $scope.addSaleLine = function(){
             var active = $("ul#tabSales li.active a").attr('id');
              data = {
                      'product':$('#product_sale').val(),
                      'quantity':$scope.product_quantity,
                      'active_ticket': active,
                     }

            //Aqui luego de ver como hacer, pasar tambien el ticket
             $http.post("/ventas/lineas/add", data)
                        .success(function(res){
                         //Tanto para success como para error, el parametro res
                         //Es lo que me devuelve la funcion que se llama del py
                         //en formato json
                          console.log(res);
                          if (res['no_stock'] == true) { 
                            $.alert({
                                title: 'Insuficiente!',
                                content: 'No hay suficiente stock para la cantidad especificada de '+data['product'],
                                keyboardEnabled:true,
                                confirmButton: 'Aceptar',
                                confirmButtonClass: 'btn-info',
                            });}
                          else if (res['exists'] == true) { 
                            $.alert({
                                title: 'Producto repetido!',
                                content: 'El producto '+data['product']+' ya se encuentra en esta venta, puede modificar la cantidad directamente en la tabla o eliminar la línea y crearla nuevamente',
                                keyboardEnabled:true,
                                confirmButton: 'Aceptar',
                                confirmButtonClass: 'btn-info',
                            });}
                          else if (res['incorrect_format'] == true) { 
                            $.alert({
                                title: 'Formato incorrecto',
                                content: 'A especificado un producto incorrecto o que no existe',
                                keyboardEnabled:true,
                                confirmButton: 'Aceptar',
                                confirmButtonClass: 'btn-info',
                            });}
                          else{
                              $scope.tickets = res['lines'];
                              update_ticket_class(res['act_tickets']);
                              $scope.product = '';
                              $scope.quantity = 1;
                              $scope.total_amount = update_total_amount(res['lines'][active])
                              $('#product_sale').focus();
                          }
                    })
                    .error(function(res){
                      console.log(res);
                    });
      };

      $scope.newTicket = function(){
         var active = $("ul#tabSales li.active a").attr('id');
         tickets = $("li a.hidden");
         tickets.each(function()
         {
            //Busca el menor ticket que este inactivo (oculto)
            //Lo muestra y le hace focus
            id = $(this).attr('id');
            $(this).removeClass('hidden');
            $('#product_sale').focus();
            $('#div_'+id).removeClass('hidden');
            $('#tabSales a[href="#div_'+id+'"]').tab('show') // Select tab by name
            throw BreakException;
         });

      }

    //ELIMINA EL TICKET ACTIVO
        $scope.deleteTicket = function(){
        $.confirm({
            title: 'Confirmar',
            content: 'Desea eliminar el ticket actual?',
            keyboardEnabled:true,
            confirm: function(){
                 var active = $("ul#tabSales li.active a").attr('id');
                 //Set ticket name
                 //$ticket[active] = "Ticket "+"1";
                 //Si es cualquier ticket excepto el 1, lo oculto
                 if(active != "t1"){
                     $('#'+active).addClass('hidden');
                     $('#div_'+active).addClass('hidden');
                     $('#tabSales a[href="#div_t1"]').tab('show') // Select tab by name
                 }
                //Send the request to delete it
                $http.delete('/ventas/ticket/' + active)
                  .success(function(response, status, headers, config){
                    $scope.tickets = response['lines'];
                    update_ticket_class(response['act_tickets']);
                    $scope.total_amount = update_total_amount($scope.tickets[active])
                });
            },
            confirmButton: 'Continuar',
            cancelButton: 'Cancelar',
            confirmButtonClass: 'btn-info',
        })//1er confirm
        };

    $scope.chargeSale = function(){
        charge();

    };






});
