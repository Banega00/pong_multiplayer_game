const socket = io('http://localhost:8080');


const playerName = sessionStorage.getItem('name')
const playersLoby = document.querySelector('.players-lobby')
const messagesContainer = document.querySelector('.messages-container')
const chatInput = document.querySelector('#chatInput')
socket.on('connect', () => {
    console.log("You are connected with", socket.id);

    socket.emit("join_lobby", playerName);
})

socket.on('new_player_joined', (playerName) => {
    const newHtml = `
        <div class="player">
            ${playerName}
        </div>`
    playersLoby.insertAdjacentHTML('beforeend', newHtml)
})

socket.on('new_public_message', (senderName, message) => {
    let myMsgClass = '';
    if (senderName === playerName) {
        myMsgClass = 'myMsg'
    }
    if (!messagesContainer) return;
    const newHtml = `
        <div class="message-div ${myMsgClass}">
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
    socket.emit('new_public_message', playerName, message)
})




