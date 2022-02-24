const http = require('http');
import * as mongoose from 'mongoose'
import { App } from './app';
import { Server, Socket } from "socket.io";
import { SocketManager } from './socket-manager';


(async function main() {
    try {
        //connecting to database
        await mongoose.connect('mongodb+srv://bane:sifrasifra@cluster0.xxfox.mongodb.net/pong_multiplayer_db?retryWrites=true&w=majority');
        console.log('Connecting with database successful')

        //instantiating server
        const server = http.createServer(App);

        //configuring socket management
        const io = new Server(server, {
        });

        const socketManager = new SocketManager(io);

        //turning on server
        let PORT: any = process.env.PORT;
        console.log("Starting server on port ", PORT, "...");
        
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