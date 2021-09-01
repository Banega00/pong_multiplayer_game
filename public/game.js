// import { socket } from './index.js'
// import { gotoGame } from './index.js';
// import { getGameId } from './index.js';

// if (getGameId()) gotoGame();

// socket.on('game_id', (gameId) => {
//     window.sessionStorage.setItem('gameId', gameId)
// })


// socket.on('game_started', () => { alert("GAME STARTED") })

const WIDTH = 600;
const HEIGHT = 400;

const canvas = document.querySelector('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT
const c = canvas.getContext('2d')
console.log(c)
c.fillStyle = 'black'
c.fillRect(10, 20, 100, 200);
