import Player from "./player.js";
import Ball from "./ball.js"

import { socket, changePlayerColorInputs, gotoGame, getGameId, playerGameIndex } from './index.js'

if (getGameId()) gotoGame();

export let gameId;

socket.on('game_id', (gId) => {
    gameId = gId;
    window.sessionStorage.setItem('gameId', gameId)
})


socket.on('color_change', (color, index) => {
    changePlayerColor(color, index);
    changePlayerColorInputs(color, index);
    prepareGameScreen();
})

socket.on('time_report', seconds => {
    let mins = Math.floor(seconds / 60);
    let sec = seconds % 60;
    if (sec < 10) sec = '0' + sec;
    document.querySelector('#clock').innerText = `${mins}:${sec}`
})

socket.on('game_started', startGame)

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export const players = [
    new Player(1, 'black'),
    new Player(2, 'black')
]

const balls = [
    new Ball(10, 20, 20, 'black')
]


//CANVAS
const canvas = document.querySelector('canvas');
export const canvasRect = canvas.getBoundingClientRect();

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
export const c = canvas.getContext('2d')

prepareGameScreen();

function prepareGameScreen() {
    c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    balls.forEach(ball => {
        ball.centerBall()
        ball.draw();
    });
    players.forEach(player => {
        player.positionPlayer();
        player.draw();
    })
}

function changePlayerColor(color, index) {
    players[index - 1]?.changeColor(color);
}

function startGame() {
    // balls.forEach(ball => {
    //     ball.centerBall()
    //     setInterval(() => ball.accelerate(0.5), 2000)
    // });
    players.forEach(player => player.positionPlayer())
    animate();
}

const animate = () => {
    window.requestAnimationFrame(animate);
    c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    players.forEach(player => player.update());
    balls.forEach(ball => ball.draw());

    if (playerGameIndex === 1) {
        balls.forEach(ball => {
            let { x, y } = ball.calculateNextPos();
            socket.emit('update_ball_position', x, y, gameId)
        });
    }
}

socket.on('update_ball_position', (x, y) => {
    balls.forEach(ball => ball.setPosition(x, y))
})

socket.on('point', index => {
    let h = document.querySelectorAll('.player .points')[index - 1];
    let points = h.innerText;
    points = parseInt(points);
    points++;
    h.innerText = points;
    balls.forEach(ball => ball.centerBall())
})

