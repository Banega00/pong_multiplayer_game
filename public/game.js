import { socket } from './index.js'
import { gotoGame } from './index.js';

if (getGameId()) gotoGame();

document.querySelectorAll('.ready-btn').forEach(btn => btn.addEventListener('click', (event) => changeReadyBtnState(event.target)))

const changeReadyBtnState = (btn) => {
    if (btn.classList.contains('ready')) {
        btn.classList.remove('ready')
        btn.classList.add('unready')

        sendReadyState(false, getGameId());
    } else if (btn.classList.contains('unready')) {
        btn.classList.remove('unready')
        btn.classList.add('ready')

        sendReadyState(true, getGameId());

    }
}

const sendReadyState = (readyState) => {
    socket.emit('ready_state', readyState, getGameId);
}

function getGameId() { return window.sessionStorage.getItem('gameId') }

socket.on('game_id', (gameId) => {
    window.sessionStorage.setItem('gameId', gameId)
})


socket.on('game_started', () => { alert("GAME STARTED") })
