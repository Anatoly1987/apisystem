var global_area = require('../config/global');    
var Util = require('../utils/utils');

module.exports=function(io){
    var nsp = io.of('/support');
    global_area.support_io =nsp;
    nsp.on('connection', function(socket) {
        //nsp.emit('hi', 'Hello everyone!');
	console.log('connected');
        socket.on('register', function(data){
            console.log(data);
            var result = Util.check_authentification("auth " + data.token);
            if(result.status == 'error'){
                console.log(result);
                return;
            } 
            var room = "";
	    console.log(room);
            if(result.data.optionid==2){
                room = data.customerID;
                socket.join('support'+data.customerID);
            }
            else{
                socket.join('support'+result.data.identification);
                room = result.data.identification;
            } 
            console.log('new app for support connected :room support'+room);
        });

        socket.on('register_ticket', function(data){
            var result = Util.check_authentification("auth " + data.token);
            if(result.status == 'error'){
                console.log(result);
                return;
            } 
            socket.join("support_ticket");
        });
    });
   /* io.on('connection', function(socket){
        console.log('new app connected');
    })*/
}
