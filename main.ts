const http = require('http');
import { App } from './app';
import { Server} from "socket.io";
import { SocketManager } from './socket-manager';


(async function main() {
    try {

        //instantiating server
        const server = http.createServer(App);

        //configuring socket management
        const io = new Server(server, {
        });

        const socketManager = new SocketManager(io);

        //turning on server
        let PORT: any = process.env.PORT;
        if (PORT == null || PORT == "") {
            PORT = 8000;
        }
        server.listen(PORT, () => {
            console.log(`Server is started at port: ${PORT}`)
        })


    } catch (error) {
        console.log(error);
        process.exit(-1);
    }
})();