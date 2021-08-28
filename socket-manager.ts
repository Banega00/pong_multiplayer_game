import { Socket } from "socket.io";

export class SocketManager {

    private players: { socket: Socket, playerName: string }[];
    constructor(private readonly io: any) {
        this.players = [];
        this.io.on('connection', (socket: Socket) => {

            //new player joined the lobby - broadcast that to all other players
            socket.on('join_lobby', (playerName: string) => {
                //for newly joined player - broadcast all previously joined players
                this.players.forEach(player => {
                    socket.emit('new_player_joined', playerName)
                })

                this.players.push({ socket, playerName })
                this.io.emit('new_player_joined', playerName)
            })

            //player sent a new message - broadcast that to all other players
            socket.on('new_public_message', (playerName: string, message: string) => {
                this.io.emit('new_public_message', playerName, message)
            })
        })
    }
}