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

            socket.on('set_status', (playerName, status) => {
                this.setPlayerStatus(playerName, status);
                this.io.emit('set_status', playerName, status)
            })

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
                this.io.emit('new_player_joined', playerName, PlayerStatus[PlayerStatus.ONLINE])
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
                const senderSocket: Socket = this.findPlayer(senderName).socket;

                if (response) {//if player accepted invitation
                    const game: Game = {
                        id: uuid(),
                        status: GameStatus.PREPARING,
                        maxDuration: 5,
                        currentDuration: 0,
                        maxPoints: 5,
                        players: {
                            player1: {
                                name: senderName,
                                socket: senderSocket,
                                ready: false,
                                points: 0
                            },
                            player2: {
                                name: playerName,
                                socket: socket,
                                ready: false,
                                points: 0
                            }
                        }
                    }
                    this.games.push(game)
                    socket.emit('game_id', game.id);
                    socket.to(senderSocket.id).emit('game_id', game.id);

                    socket.join(game.id);
                    senderSocket.join(game.id)

                }
                socket.to(senderSocket.id).emit('game_response', response, playerName, socket.id);
            })

            socket.on('ready_state', (readyState: boolean, gameConfig: any, gameId: string) => {
                for (const game of this.games) {
                    if (game.id === gameId) {
                        if (game.players.player1.socket.id === socket.id) {
                            //first player pressed ready btn
                            //notify second player
                            this.io.to(game.players.player2.socket.id).emit('ready_state', readyState)
                            game.players.player1.ready = readyState
                        } else {
                            //second player pressed ready btn
                            //notify first player
                            this.io.to(game.players.player1.socket.id).emit('ready_state', readyState)
                            game.players.player2.ready = readyState
                        }
                        if (gameConfig.maxDuration) game.maxDuration = gameConfig.maxDuration * 60;//maxDuration converted from minutes to seconds
                        if (gameConfig.winningPoints) game.maxPoints = gameConfig.winningPoints
                        if (bothPlayersReady(game)) {
                            this.io.to(game.id).emit('game_started', game.maxPoints)
                            this.startGame(game);
                        }
                        break;
                    }
                }
            })

            socket.on('color_change', (color, index, gameId) => {
                this.io.to(gameId).emit('color_change', color, index);
            })

            socket.on('update_position', (x, y, index, gameId) => {
                this.io.in(gameId).emit('update_position', x, y, index);
            })

            socket.on('update_ball_position', (x, y, gameId) => {
                this.io.in(gameId).emit('update_ball_position', x, y);
            })

            socket.on('point', (index, gameId) => {
                this.io.in(gameId).emit('point', index);

                //update game points
                for (const game of this.games) {
                    if (game.id = gameId) {
                        if (index === 1) {
                            game.players.player1.points++;
                        } else if (index === 2) {
                            game.players.player2.points++;
                        }
                    }

                    //
                    if (game.players.player1.points >= game.maxPoints) {
                        this.endGame(game)
                    } else if (game.players.player2.points >= game.maxPoints) {
                        this.endGame(game)
                    }
                }
            })
        })
    }

    private setPlayerStatus(playerName, status) {
        const playerStatus = status === 1 ? PlayerStatus.ONLINE : PlayerStatus.OFFLINE;
        for (const player of this.players) {
            if (player.playerName === playerName) {
                player.status = playerStatus;
                return;
            }
        }
    }

    private startGame(game: Game) {

        game.status = GameStatus.ACTIVE;

        game.maxDuration--;

        let sec = 1000;//sec === 1000 msec
        const gameInterval = setInterval(() => {
            //send time report
            if (game.maxDuration <= 0) {
                this.endGame(game, gameInterval);
                clearInterval(gameInterval)
            };
            this.io.to(game.id).emit("time_report", game.maxDuration)
            game.maxDuration--;
        }, sec)
    }

    private endGame(game: Game, interval?: NodeJS.Timer) {
        game.status = GameStatus.FINISHED;
        let player1Points = game.players.player1.points;
        let player2Points = game.players.player2.points;

        let winner: any;
        if (player1Points > player2Points) {
            winner = {
                name: game.players.player1.name,
                points: game.players.player1.points
            }
        } else if (player1Points < player2Points) {
            winner = {
                name: game.players.player2.name,
                points: game.players.player2.points
            }
        } else {
            winner = null;
        }
        //remove game from array;
        this.games = this.games.filter(g => g.id != game.id);

        //emit end game_event
        this.io.in(game.id).emit('end_game', winner);

        //remove sockets from room
        game.players.player1.socket.leave(game.id)
        game.players.player2.socket.leave(game.id)

        if (interval) clearInterval(interval);
    }

    private updatePlayersGame(player: Player) {
        for (const game of this.games) {
            if (game.players.player1.name === player.playerName) {
                game.players.player1.socket = player.socket
            } else if (game.players.player2.name === player.playerName) {
                game.players.player2.socket = player.socket
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
            socket.emit('new_player_joined', player.playerName, player.status)
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
            socket: Socket,
            ready: boolean,
            points: number
        },
        player2: {
            name: string,
            socket: Socket,
            ready: boolean
            points: number
        }
    }
    maxDuration: number,
    currentDuration: number,
    maxPoints: number
}

enum GameStatus {
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
    PREPARING = 'PREPARING'
}