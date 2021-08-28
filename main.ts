const http = require('http');
import mongoose from 'mongoose'
import { App } from './app';
import { Server, Socket } from "socket.io";


(async function main() {
    //connecting to database
    await mongoose.connect('mongodb+srv://bane:sifrasifra@cluster0.xxfox.mongodb.net/pong_multiplayer_db?retryWrites=true&w=majority');
    console.log('Connecting with database successful')

    //instantiating server
    const server = http.createServer(App);

    //configuring socket management
    const io = new Server(server, {
    });

    //turning on server
    const PORT = process.env.PORT;
    server.listen(PORT, () => {
        console.log(`Server is started at port: ${PORT}`)
    })
})();