
export const socket = io('http://localhost:8080', {
    'sync disconnect on unload': true
});

export const playerName = sessionStorage.getItem('name')
const playersLoby = document.querySelector('.players-lobby')
const messagesContainer = document.querySelector('.messages-container')
const chatInput = document.querySelector('#chatInput')
const gameRequestsContainer = document.querySelector('.game-requests-container');
const notificationsContainer = document.querySelector('.notifications-container');

const playerBoardNames = document.querySelectorAll('.player-board .player h2');
const playerBoardButtons = document.querySelectorAll('.player .ready-btn');

export let playerGameIndex;

export const gameContainer = document.querySelector('#game-container')

if (!playerName) {
    window.location = 'http://localhost:8080/login.html'
}

socket.on('connect', () => {
    console.log("You are connected with", socket.id);

    setTimeout(() => socket.emit("join_lobby", playerName), 50);
})

socket.on('new_player_joined', (otherPlayerName) => {
    //other player name is name of player who joined

    //dont set playIcon for current player
    const playIcon = otherPlayerName === playerName ? '' : `<div class="play-icon" title="Challange player on pong game">${playIconSvg}</div>`
    const newHtml = `
    <div class="player" player=${otherPlayerName}>
        <div class="player-name">
            <div class='player-status online'></div>
            ${otherPlayerName}
        </div>
        <div class="controls">
            ${playIcon}
        </div>
    </div>`
    playersLoby.insertAdjacentHTML('beforeend', newHtml)

    const playIconElement = document.querySelector(`.player[player="${otherPlayerName}"] .play-icon`)
    if (playIconElement) playIconElement.addEventListener('click', (event) => requestGame(event, otherPlayerName))
})

const requestGame = (event, opponentName) => {
    const btn = event.target;

    //disable btn for 15 sec
    if (btn.classList.contains('disabled-play-btn')) return;
    btn.classList.add('disabled-play-btn')
    setInterval(() => btn.classList.remove('disabled-play-btn'), 15000)

    //socket.id - is socket id of current player
    //socketId - is socket id of player who receives game request
    socket.emit("game_request", opponentName, playerName);
}

socket.on('game_request', (senderName) => {
    //if player already accepted game don't let him accept another game
    if (getGameId()) return;

    //senderName is name of player who sent game invitation
    const newHtml = `
    <div class="game-request-div" player=${senderName}>
            <div class="progressbar">
                <div></div>
            </div>
            <div class="game-request-div-inner">
                Player ${senderName} invited you for a game!
                <div class="game-btns">
                    <div class="accept-game-btn">${checkMark}</div>
                    <div class="decline-game-btn">${xMark}</div>
                </div>
            </div>
        </div>
    </div>`
    gameRequestsContainer.insertAdjacentHTML('beforeend', newHtml)
    const gameRequestDiv = gameRequestsContainer.querySelector(`.game-request-div[player="${senderName}"]`)
    if (gameRequestDiv) {
        startTimer(gameRequestDiv)
        gameRequestDiv.querySelector('.accept-game-btn').addEventListener('click', () => {
            gameResponse(true, senderName, playerName)
            popNotification("Accepted! Game will start soon", gotoGame)
            gameRequestDiv.remove();
        })
        gameRequestDiv.querySelector('.decline-game-btn').addEventListener('click', () => {
            gameResponse(false, senderName, playerName);
            gameRequestDiv.remove();
        })

    }
})

const changeReadyBtnListener = (event) => changeReadyBtnState(event.target)

export function gotoGame() {
    gameContainer.classList.remove('closed');
    gameContainer.classList.add('open')

    document.querySelector('.ready-btn.your-btn').removeEventListener('click', changeReadyBtnListener)
    document.querySelector('.ready-btn.your-btn').addEventListener('click', changeReadyBtnListener)
}


export function gotoLobby() {
    setStatus(playerName, 1)
    const endOfGameDiv = document.querySelector('.end-of-game-div');
    endOfGameDiv.remove();

    gameContainer.classList.remove('open');
    gameContainer.classList.add('closed');
}

const gameResponse = (response, senderName, playerName) => {
    //if player already accepted game don't let him accept another one
    if (sessionStorage.getItem('gameId')) return;

    if (response) {
        setPlayerNameOnBoard(playerName, 1);
        resetResults();
        setPlayerGameOptions();
        setYourReadyButton(1);
        setPlayerNameOnBoard(senderName, 0);
        playerGameIndex = 2;
        setColorsListeners();

        setStatus(playerName, 2)//status 2 - player is currently in game
        //status 1 - player is in lobby
    };
    socket.emit('game_response', response, playerName, senderName);
}

function resetResults() {
    document.querySelectorAll('.player .points').forEach(pointDiv => pointDiv.innerHTML = '0')
}

export function setStatus(playerName, status) {
    socket.emit('set_status', playerName, status);
}

socket.on('set_status', (playerName, status) => {
    const playerStatus = document.querySelector(`.player[player="${playerName}"] .player-status`)
    if (status === 1) {
        playerStatus.classList.remove('ingame')
        playerStatus.classList.add('online')
    } else if (status === 2) {
        playerStatus.classList.remove('online')
        playerStatus.classList.add('ingame')
    }
})



function setPlayerGameOptions() {
    const winningPointsDiv = document.querySelector('.winning-points-div');
    const maxDurationDiv = document.querySelector('.max-duration-div');
    if (playerGameIndex === 1) {
        winningPointsDiv.style.display = 'block';
        maxDurationDiv.style.display = 'block';
        winningPointsDiv.querySelector('input').value = 5;
        maxDurationDiv.querySelector('input').value = 5;
    } else {
        winningPointsDiv.style.display = 'none';
        maxDurationDiv.style.display = 'none';
    }
}

socket.on('game_response', (response, opponent) => {
    if (response) {
        setPlayerNameOnBoard(playerName, 0)
        setYourReadyButton(0);
        resetResults();
        setPlayerNameOnBoard(opponent, 1);
        playerGameIndex = 1;
        setColorsListeners()
        setStatus(playerName, 2)
    };
    const responseMsg = response ?
        `${opponent} accepted your game request, game will start soon`
        : `${opponent} declined your game request`

    if (response) sessionStorage.setItem('opponent', opponent);

    const callbackFunction = response ? gotoGame : () => 0;
    //notify player
    popNotification(responseMsg, callbackFunction);
})

export function changePlayerColorInputs(color, index) {
    const colorPickers = document.querySelectorAll('input[type="color"]')
    if (index === 1) {
        colorPickers[0].value = color;
    }
    if (index === 2) {
        colorPickers[1].value = color;
    }
}

function setColorsListeners() {
    const colorPickers = document.querySelectorAll('input[type="color"]')
    let index = playerGameIndex;
    //if index is 1 - set event listener to 0th colorpicker
    //if index is 2 - set event listener to 2th colorpicker
    if (index === 1) {
        colorPickers[1].disabled = true;
        colorPickers[0].disabled = false;
        colorPickers[0].addEventListener('change', (event) => {
            const color = event.target.value;
            socket.emit('color_change', color, index, getGameId())
        })
    }
    if (index === 2) {
        colorPickers[0].disabled = true;
        colorPickers[1].disabled = false;
        colorPickers[1].addEventListener('change', (event) => {
            const color = event.target.value;
            socket.emit('color_change', color, index, getGameId())
        })
    }

    colorPickers[0].value = "black";
    colorPickers[1].value = "black";
}

const setYourReadyButton = (index) => {
    for (var i = 0; i < playerBoardButtons.length; i++) {
        playerBoardButtons[i].classList.remove('ready');
        playerBoardButtons[i].classList.add('unready');
        if (index == i) {
            playerBoardButtons[i].classList.add('your-btn');
        } else {
            playerBoardButtons[i].classList.remove('your-btn');
        }
    }
}

//index may be 0 or 1
function setPlayerNameOnBoard(playerName, index) {
    if (playerBoardNames.item(index)) playerBoardNames.item(index).innerText = playerName;
}

function popNotification(notificationMsg, callback) {

    const notificationId = Math.round(Math.random() * 100000)//random id from 0 to - 100 000

    const newHtml = `<div class="notification" notificationid=${notificationId}>
    <div class="notificationMsg">${notificationMsg}</div>
    <div class="notification-counter">5</div>
    </div>`

    notificationsContainer.insertAdjacentHTML('beforeend', newHtml);
    const notification = document.querySelector(`[notificationid="${notificationId}"]`)
    if (notification) notificationCounter(notification, callback)
}

function notificationCounter(notification, callback) {
    const counterDiv = notification.querySelector('.notification-counter');
    let totalTime = 5;
    const interval = setInterval(() => {
        if (totalTime <= 0) {
            clearInterval(interval);
            notification.remove();
            callback();
            return;
        }
        counterDiv.innerText = totalTime;
        totalTime--;
    }, 1000)
}

const startTimer = (gameRequestDiv) => {
    const progressbar = gameRequestDiv.querySelector('.progressbar > div')
    const totalTime = 12000; //12000 msec === 12 sec
    let remainingTime = totalTime;
    let onePercent = 12000 / 1000
    const interval = setInterval(() => {
        try {
            if (remainingTime <= 0) {
                clearInterval(interval)
                gameRequestDiv.remove();
                gameResponse(false, playerName, gameRequestDiv.getAttribute('socketid'))
                return;
            }
            remainingTime -= onePercent;
            progressbar.style.width = `${(remainingTime / totalTime) * 100}%`
        } catch (err) {
            gameRequestDiv.remove()
            clearInterval(interval)
            gameResponse(false, playerName, gameRequestDiv.getAttribute('socketid'))
        }
    }, onePercent)
}
socket.on('username_taken', () => {
    alert('Username is already taken!')
    window.location = "http://localhost:8080/login.html"
})

socket.on('player_left', (playerName) => {

    //Player left - remove him from online players list
    const playerElement = document.querySelector(`.players-lobby .player[player="${playerName}"] `)

    if (playerElement) playerElement.remove();
})

socket.on('new_public_message', (senderName, message, socketId) => {
    //if it is current player's message - add aditional class
    let myMsgClass = '';
    if (senderName === playerName) {
        myMsgClass = 'myMsg'
    }
    if (!messagesContainer) return;
    const newHtml = `
        <div class="message-div ${myMsgClass} socketId=${socketId}">
            <div class="name">${senderName}</div>
            <div class="content">${message}</div>
        </div>`
    messagesContainer.insertAdjacentHTML('beforeend', newHtml)
})

document.querySelectorAll('.playerName').forEach(span => span.innerHTML = `<b>${playerName}</b>!`)

//sending messages from chat
document.getElementById('send-msg-btn').addEventListener('click', function sendMessage() {
    const message = chatInput.value;
    if (!message) return;
    if (!chatInput) return;

    chatInput.value = '';
    socket.emit('new_public_message', playerName, message, socket.id)
})

export const changeReadyBtnState = (btn) => {
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
    const colorPickers = document.querySelectorAll('input[type="color"]')
    const gameConfig = {
    };
    if (playerGameIndex === 1) {
        gameConfig.player1Color = colorPickers[0].value;

        let maxDuration = document.querySelector('.max-duration').value;
        gameConfig.maxDuration = (maxDuration > 1 && maxDuration <= 20) ? maxDuration : 5;

        let winningPoints = document.querySelector('.winning-points').value;
        gameConfig.winningPoints = (winningPoints >= 1 && winningPoints <= 30) ? winningPoints : 5;
    } else if (playerGameIndex === 2) {
        gameConfig.player2Color = colorPickers[1].value;
    }

    socket.emit('ready_state', readyState, gameConfig, getGameId());
}

socket.on('ready_state', readyState => {
    const readyBtn = document.querySelector('.ready-btn:not(.your-btn)');
    if (readyState) {
        readyBtn.classList.remove('unready');
        readyBtn.classList.add('ready');
    } else {
        readyBtn.classList.remove('ready');
        readyBtn.classList.add('unready');
    }
})

export function getGameId() { return window.sessionStorage.getItem('gameId') }



const playIconSvg = `<svg version="1.1" id="Capa_1"
xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
y="0px" viewBox="0 0 58.752 58.752" style="enable-background:new 0 0 58.752 58.752;"
xml:space="preserve">
<g>
    <path d="M52.524,23.925L12.507,0.824c-1.907-1.1-4.376-1.097-6.276,0C4.293,1.94,3.088,4.025,3.088,6.264v46.205
c0,2.24,1.204,4.325,3.131,5.435c0.953,0.555,2.042,0.848,3.149,0.848c1.104,0,2.192-0.292,3.141-0.843l40.017-23.103
c1.936-1.119,3.138-3.203,3.138-5.439C55.663,27.134,54.462,25.05,52.524,23.925z M49.524,29.612L9.504,52.716
c-0.082,0.047-0.18,0.052-0.279-0.005c-0.084-0.049-0.137-0.142-0.137-0.242V6.263c0-0.1,0.052-0.192,0.14-0.243
c0.042-0.025,0.09-0.038,0.139-0.038c0.051,0,0.099,0.013,0.142,0.038l40.01,23.098c0.089,0.052,0.145,0.147,0.145,0.249
C49.663,29.47,49.611,29.561,49.524,29.612z" />
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>`


const checkMark = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="8px" height="8px" viewBox="0 0 8 8" enable-background="new 0 0 8 8" xml:space="preserve">
<rect x="-0.013" y="4.258" transform="matrix(-0.707 -0.7072 0.7072 -0.707 0.0891 10.1702)" width="4.33" height="1.618"/>
<rect x="2.227" y="2.899" transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 11.6877 2.6833)" width="6.121" height="1.726"/>
</svg>
`
const xMark = `<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"/></svg>`