const server = require('http').createServer(); //Definindo o nosso protocolo http, passando o app no createServer
const io = require('socket.io')(server); //Definindo o protocolo ws(web socket), passando o server

var messages = {
    connection: "Cliente conectado    IP: ",
};
var buttonsList = {};

io.on('connection', socket => { // Toda vez que um cliente se conectar em nosso socket o que faremos:

    var ipAddress = filterIpAddress(socket.request.connection.remoteAddress);
   
    socket.emit('conectedMessage', messages.connection + ipAddress);
    socket.emit('buttonInfo', buttonsList);
    console.log(messages.connection + ipAddress + "     ID: " + socket.id);

    socket.on('disconnect', () => {

            for(key in buttonsList){

                var buttonObj = buttonsList[key];

                if(buttonObj.clientId == socket.id) {

                    buttonObj.status = 'enabled';
                    delete buttonObj.clientId;
                }
            }

        socket.broadcast.emit('buttonInfo', buttonsList);
        socket.broadcast.emit('disconnectedBroadcast', 'Eu fui desconectado, meu id é: '+socket.id);
        console.log("Cliente desconectado IP: " + ipAddress + "     ID: " + socket.id);
    });

    socket.on('toggleButton', buttonInfo => {

        var permission = 'denied';

        if(buttonsList.hasOwnProperty(buttonInfo.id)) {

            if(buttonsList[buttonInfo.id].clientId == socket.id || buttonsList[buttonInfo.id].clientId == null) {

                permission = 'accepted';
            }
        }else{

            permission = 'accepted';
        }

        if(permission == 'accepted') {

            if(buttonInfo.status == 'disabled') {

                buttonsList[buttonInfo.id] = {
                    'status': 'disabled',
                    'clientId': socket.id
                }
            }else {

                buttonsList[buttonInfo.id] = {
                    'status': 'enabled',
                    'clientId': null
                }  
            }
        }

        let buttonInfoList = {};

        buttonInfoList[buttonInfo.id] = buttonInfo;
        socket.broadcast.emit('buttonInfo', buttonInfoList);
        socket.emit('toggleButton', {
            permission,
            'status': buttonInfo.status,
            'buttonId': buttonInfo.id
        });
    });  
});

function filterIpAddress(ipAddress) {

    return ipAddress.split("::ffff:").join("")
}

server.listen(3000);