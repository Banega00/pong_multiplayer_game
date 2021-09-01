import { Socket } from "socket.io";
import { uuid } from 'uuidv4';

export class SocketManager {

    private players: Player[];
    private games: Game[];
    constructor(private readonly io: any) {
        this.players = [];
        this.games = [];
        this.io.on('connection', (socket: Socket) => {

            //if player disconnects change his status to disconnected
            //and give him 5 sec to reconnect
            //if 5 sec expires change his status to offline - and emit others that he left
            socket.on('disconnect', () => {
                for (const player of this.players) {
                    if (player.socket.id === socket.id) {
                        console.log(`Player ${player.playerName} disconnected`)
                        player.status = PlayerStatus.DISCONNECTED;

                        player.reconnectIntreval = setTimeout(() => {
                            console.log(`Player: ${player.playerName} removed from array`)
                            this.removePlayerFromArray(player)
                            socket.broadcast.emit('player_left', player.playerName)
                        }, 5000)

                        break;
                    }
                }
            });

            //new player joined the lobby - broadcast that to all other players
            socket.on('join_lobby', playerName => {
                //check if player reconnected
                for (const player of this.players) {
                    if (player.playerName === playerName) {
                        if (player.status != PlayerStatus.DISCONNECTED) {
                            console.log(player.playerName, player.status)
                            //this means someon joined the lobby with same username
                            //as player who is already online
                            socket.emit('username_taken')
                            return;
                        }

                        console.log(`Player: ${player.playerName} reconnected`)
                        this.updatePlayersGame(player);
                        player.socket = socket;
                        player.status = PlayerStatus.ONLINE;
                        clearInterval(player.reconnectIntreval as NodeJS.Timeout)
                        this.sendAllPreviousPlayers(socket);
                        return;
                    }
                }
                console.log(`New player joined the room: ${playerName} - ${socket.id}`)
                this.io.emit('new_player_joined', playerName)
                this.sendAllPreviousPlayers(socket);
                this.players.push({ playerName, socket, status: PlayerStatus.ONLINE, reconnectIntreval: null })
            })

            //player sent a new message - broadcast that to all other players
            socket.on('new_public_message', (playerName: string, message: string, socketId: string) => {
                this.io.emit('new_public_message', playerName, message, socketId)
            })

            //player request a game against another player
            socket.on('game_request', (playerName: string, senderName: string) => {
                const player = this.findPlayer(playerName);

                socket.to(player.socket.id).emit('game_request', senderName)
            })

            socket.on('game_response', (response: boolean, playerName: string, senderName: string) => {
                //sender is player who initiated game request
                const senderSocketId: string = this.findPlayer(senderName).socket.id;

                if (response) {//if player accepted invitation
                    const game: Game = {
                        id: uuid(),
                        status: GameStatus.PREPARING,
                        players: {
                            player1: {
                                name: senderName,
                                socketId: senderSocketId,
                                ready: false
                            },
                            player2: {
                                name: playerName,
                                socketId: socket.id,
                                ready: false
                            }
                        }
                    }
                    this.games.push(game)
                    socket.emit('game_id', game.id);
                    socket.to(senderSocketId).emit('game_id', game.id);
                }
                socket.to(senderSocketId).emit('game_response', response, playerName, socket.id);
            })

            socket.on('ready_state', (readyState: boolean, gameId: string) => {
                for (const game of this.games) {
                    if (game.id === gameId) {
                        if (game.players.player1.socketId === socket.id) {
                            //first player pressed ready btn
                            //notify second player
                            this.io.to(game.players.player2.socketId).emit('ready_state', readyState)
                            game.players.player1.ready = readyState
                        } else {
                            //second player pressed ready btn
                            //notify first player
                            this.io.to(game.players.player1.socketId).emit('ready_state', readyState)
                            game.players.player2.ready = readyState
                        }
                        if (bothPlayersReady(game)) {
                            this.io.to(game.players.player1.socketId).emit('game_started')
                            this.io.to(game.players.player2.socketId).emit('game_started')
                            game.status = GameStatus.ACTIVE;
                        }

                        break;
                    }
                }
            })
        })
    }

    private updatePlayersGame(player: Player) {
        for (const game of this.games) {
            if (game.players.player1.name === player.playerName) {
                game.players.player1.socketId = player.socket.id
            } else if (game.players.player2.name === player.playerName) {
                game.players.player2.socketId = player.socket.id
            }
        }
    }

    private findPlayerBySocketId(socketId: string) {
        for (const player of this.players) {
            if (player.socket.id === socketId) return player
        }
    }

    private removePlayerFromArray(playerToRemove: Player) {
        this.players = this.players.filter(player => player.playerName != playerToRemove.playerName)
    }

    private sendAllPreviousPlayers(socket: Socket) {
        for (const player of this.players) {
            socket.emit('new_player_joined', player.playerName)
        }
    }

    private findPlayer(playerName: string): any {
        for (const player of this.players) {
            if (player.playerName === playerName) return player;
        }
    }
}




interface Player {
    socket: Socket,
    playerName: string,
    status: PlayerStatus,
    reconnectIntreval: NodeJS.Timeout | null;
}

enum PlayerStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    IN_GAME = 'IN_GAME',
    DISCONNECTED = 'DISCONNECTED'//when player's socket disconnects - player is disconnected for 5 sec
    //after what his status is changed in offline
}

//returns true if ready status of both players is true 
function bothPlayersReady(game: Game): boolean {
    return game.players.player1.ready && game.players.player2.ready
}

interface Game {
    id: string,
    status: GameStatus,
    players: {
        player1: {
            name: string,
            socketId: string
            ready: boolean
        },
        player2: {
            name: string,
            socketId: string
            ready: boolean
        }
    }
}

enum GameStatus {
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
    PREPARING = 'PREPARING'
}