const socket = io('http://localhost:8080', {
    'sync disconnect on unload': true
});

const playerName = sessionStorage.getItem('name')
const playersLoby = document.querySelector('.players-lobby')
const messagesContainer = document.querySelector('.messages-container')
const chatInput = document.querySelector('#chatInput')

if (!playerName) {
    window.location = 'http://localhost:8080/login.html'
}

socket.on('connect', () => {
    console.log("You are connected with", socket.id);

    socket.emit("join_lobby", playerName);
})

socket.on('new_player_joined', (playerName, socketId) => {
    //dont set playIcon and msgIcon for current player
    const playIcon = socketId === socket.id ? '' : `<div class="play-icon" title="Challange player on pong game">${playIconSvg}</div>`
    const msgIcon = socketId === socket.id ? '' : `<div class="chat-icon" title="Send player private message">${msgIconSvg}<div>`
    const newHtml = `
    <div class="player" socketId=${socketId}>
        <div class="player-name">${playerName}</div>
        <div class="controls">
            ${playIcon}
            ${msgIcon}
        </div>
    </div>`
    playersLoby.insertAdjacentHTML('beforeend', newHtml)

    const playIconElement = document.querySelector(`.player[socketid="${socketId}"] .play-icon`)
    if (playIconElement) playIconElement.addEventListener('click', (event) => requestGame(event, socketId))
})

const requestGame = (event, socketId) => {
    const btn = event.target;

    //disable btn for 8 sec
    if (btn.classList.contains('disabled-play-btn')) return;
    btn.classList.add('disabled-play-btn')
    setInterval(() => btn.classList.remove('disabled-play-btn'), 8000)

    //socket.id - is socket id of current player
    //socketId - is socket id of player who receives game request
    socket.emit("game_request", playerName, socketId);
}

socket.on('game_request', (playerName, socketId) => {

    console.log(`Player ${playerName} requested a game with you!`)
})

socket.on('username_taken', () => {
    alert('Username is already taken!')
})

socket.on('player_left', (socketId) => {

    //Player left - remove him from online players list
    const playerElement = document.querySelector(`.players-lobby .player[socketId="${socketId}"] `)

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
const msgIconSvg = `<svg version="1.1" id="Layer_1"
xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
y="0px" viewBox="0 0 512.256 512.256" style="enable-background:new 0 0 512.256 512.256;"
xml:space="preserve">
<g transform="translate(-1)">
    <g>
        <g>
            <path d="M506.885,337.001c-6.513-6.513-11.672-13.908-15.628-22.083c-7.715-15.942-10.273-33.007-9.73-47.561
       c20.811-26.105,31.607-54.246,31.607-85.939c0-88.441-84.11-149.333-192-149.333c-91.631,0-167.02,44.194-186.79,113.094
       C56.182,163.011,1.123,216.525,1.123,288.077c0,31.711,10.796,59.857,31.607,85.943c0.542,14.553-2.016,31.616-9.73,47.556
       c-3.956,8.175-9.116,15.57-15.628,22.083c-15.894,15.894,0.427,42.389,21.772,35.343c10.156-3.353,27.536-10.064,50.455-19.339
       c1.812-0.734,1.812-0.734,3.621-1.468c12.108-4.918,24.86-10.181,37.472-15.444c5.119-2.136,9.449-3.952,12.747-5.34h59.685
       c89.492,0,162.617-41.897,184.957-106.658h2.738c3.298,1.388,7.628,3.204,12.747,5.34c12.612,5.263,25.364,10.527,37.472,15.444
       c1.809,0.734,1.809,0.734,3.621,1.468c22.919,9.275,40.299,15.987,50.455,19.339C506.457,379.39,522.779,352.895,506.885,337.001
       z M193.123,394.744h-64c-2.856,0-5.683,0.573-8.313,1.686c-3.271,1.384-9.052,3.816-16.55,6.944
       c-11.502,4.8-23.119,9.599-34.228,14.123c5.005-17.612,6.207-34.916,5.032-50.441c-0.144-1.908-0.302-3.364-0.434-4.321
       c-0.561-4.075-2.288-7.902-4.974-11.018c-17.475-20.277-25.867-40.512-25.867-63.641c0-51.349,43.84-91.452,108.987-103.17
       c0.926-0.035,1.864-0.126,2.81-0.285c12.565-2.115,25.042-3.203,37.548-3.203c46.083,0,85.348,12.787,112.033,33.974
       c23.541,18.695,37.29,43.927,37.29,72.685c0,0.845-0.017,1.686-0.04,2.525c-0.164,4.558-0.764,9.338-1.816,14.733
       c-0.132,0.678-0.223,1.352-0.289,2.024C328.651,358.692,270.501,394.744,193.123,394.744z M444.594,245.068
       c-2.682,3.115-4.407,6.938-4.968,11.01c-0.132,0.957-0.289,2.413-0.434,4.321c-1.175,15.525,0.027,32.829,5.032,50.441
       c-11.109-4.524-22.726-9.323-34.228-14.123c-7.498-3.129-13.279-5.56-16.55-6.944c-2.63-1.113-5.457-1.686-8.313-1.686
       c0-42.842-19.737-79.219-52.352-105.342c-34.716-27.81-84.025-44-139.658-44c-3.414,0-6.803,0.062-10.168,0.183
       c21.669-38.669,73.586-64.174,138.178-64.174c86.748,0,149.333,45.31,149.333,106.667
       C470.467,204.528,462.074,224.765,444.594,245.068z" />
            <path
                d="M129.123,266.744h85.333c11.782,0,21.333-9.551,21.333-21.333c0-11.782-9.551-21.333-21.333-21.333h-85.333
       c-11.782,0-21.333,9.551-21.333,21.333C107.789,257.193,117.341,266.744,129.123,266.744z" />
            <path
                d="M257.123,309.411h-128c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333h128
       c11.782,0,21.333-9.551,21.333-21.333C278.456,318.962,268.905,309.411,257.123,309.411z" />
        </g>
    </g>
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