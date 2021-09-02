import Player from "./player.js";
import Ball from "./ball.js"

import { socket } from './index.js'
import { gotoGame } from './index.js';
import { getGameId } from './index.js';

if (getGameId()) gotoGame();

export let gameId;

socket.on('game_id', (gId) => {
    gameId = gId;
    window.sessionStorage.setItem('gameId', gameId)
})

socket.on('game_started', startGame)

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export const players = [
    new Player(1, 'red'),
    new Player(2, 'blue')
]

const balls = [
    new Ball(10, 20, 20, 'red')
]


//CANVAS
const canvas = document.querySelector('canvas');
export const canvasRect = canvas.getBoundingClientRect();

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
export const c = canvas.getContext('2d')

function startGame() {
    balls.forEach(ball => {
        ball.centerBall()
        setInterval(() => ball.accelerate(0.5), 2000)
    });
    players.forEach(player => player.positionPlayer())
    animate();
}

const animate = () => {
    window.requestAnimationFrame(animate);
    c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    balls.forEach(ball => ball.update());
    players.forEach(player => player.update());
}


