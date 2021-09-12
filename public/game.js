import Player from "./player.js";
import Ball from "./ball.js"

import { socket, changePlayerColorInputs, gotoGame, getGameId, playerGameIndex, gotoLobby, playerName } from './index.js'
let animationFrameId;

if (getGameId()) gotoGame();

export let gameId;

socket.on('game_id', (gId) => {
    gameId = gId;
    window.sessionStorage.setItem('gameId', gameId)
})


socket.on('color_change', (color, index) => {
    changePlayerColor(color, index);
    changePlayerColorInputs(color, index);
    paintScreen();
})

socket.on('time_report', seconds => {
    let mins = Math.floor(seconds / 60);
    let sec = seconds % 60;
    if (sec < 10) sec = '0' + sec;
    document.querySelector('#clock').innerText = `${mins}:${sec}`
})

socket.on('game_started', (maxPoints) => {
    writeMaxPoints(maxPoints);
})

function writeMaxPoints(maxPoints) {

}

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export let players = [
]

let balls = [
]

export let canvasRect;
export let c;

//CANVAS
const canvas = document.querySelector('canvas');
canvasRect = canvas.getBoundingClientRect();
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
c = canvas.getContext('2d')
prepareGameScreen();


function prepareGameScreen() {
    balls = [];
    players = [];
    balls.push(new Ball(10, 20, 20, 'black'))
    players.push(
        new Player(1, 'black'),
        new Player(2, 'black')
    )

    paintScreen();
}

function paintScreen(){
    c.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    c.fillStyle = "#75b8eb";
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    balls.forEach(ball => {
        ball.draw();
    });
    players.forEach(player => {
        player.draw();
    })
}

function changePlayerColor(color, index) {
    players[index - 1]?.changeColor(color);
}

socket.on('update_ball_position', (x, y) => {
    balls.forEach(ball => ball.setPosition(x, y))

    paintScreen();
})

socket.on('point', index => incrementPoint(index))

socket.on('end_game', winner => {
    showEndOfGameDiv(winner)

    //reset clock
    document.querySelector('#clock').innerText = '5:00';

    window.sessionStorage.removeItem('gameId')

    prepareGameScreen();
    window.cancelAnimationFrame(animationFrameId);

})

function showEndOfGameDiv(winner) {
    let message;
    if (!winner) message = `GAME TIED`;
    else if (winner.name == playerName) message = "CONGRATULATIONS YOU WON"
    else message = `YOU LOSE :( \n PLAYER ${winner.name} WON`
    const div = `
    <div class="end-of-game-div">
        <div>${message}</div>
        <div>
            <div class="back-to-lobby-btn">Back to lobby</div>
        </div>
    </div>`
    document.body.insertAdjacentHTML('beforeend', div);
    document.querySelector(".back-to-lobby-btn").addEventListener('click', gotoLobby)
}

function incrementPoint(index) {
    let h = document.querySelectorAll('.player .points')[index];
    let points = h.innerText;
    points = parseInt(points);
    points++;
    h.innerText = points;
    balls.forEach(ball => ball.centerBall())
}
