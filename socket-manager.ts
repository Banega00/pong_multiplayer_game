import { Socket } from "socket.io";

export class SocketManager {

    private players: { socket: Socket, playerName: string }[];
    private games: Game[];
    constructor(private readonly io: any) {
        this.players = [];
        this.games = [];
        this.io.on('connection', (socket: Socket) => {

            socket.on('disconnect', () => {
                this.players = this.players.filter(player => player.socket.id != socket.id)
                socket.broadcast.emit('player_left', socket.id)
                console.log(socket.id)
            });

            //new player joined the lobby - broadcast that to all other players
            socket.on('join_lobby', (playerName: string) => {

                //check if player already exists in array of online players
                for (const player of this.players) {
                    if (player.playerName === playerName)
                        socket.emit('username_taken')
                }

                //for newly joined player - broadcast all previously joined players
                this.players.forEach(player => {
                    socket.emit('new_player_joined', player.playerName, player.socket.id)
                })

                this.players.push({ socket, playerName })
                this.io.emit('new_player_joined', playerName, socket.id)
            })

            //player sent a new message - broadcast that to all other players
            socket.on('new_public_message', (playerName: string, message: string, socketId: string) => {
                this.io.emit('new_public_message', playerName, message, socketId)
            })

            //player request a game against another player
            //socketId is socket id of player who received game request
            socket.on('game_request', (playerName: string, socketId: string) => {
                socket.to(socketId).emit('game_request', playerName, socket.id);
            })

            socket.on('game_response', (response: boolean, playerName: string, socketId: string) => {
                socket.to(socketId).emit('game_response', response, playerName, socket.id);
            })


            socket.on('players', (player1, player2) => {
                for (const game of this.games) {

                }
            })
        })
    }
}

interface Game {
    id: string,
    players: {
        player1: {
            name: string,
            socket: Socket
        },
        player2: {
            name: string,
            socket: Socket
        }
    }
}