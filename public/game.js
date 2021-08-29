const playerName = sessionStorage.getItem('name')
const opponent = sessionStorage.getItem('opponent')

if (!playerName) location = "http://localhost:8080/login.html"

const socket = io('http://localhost:8080', {
    'sync disconnect on unload': true
});

socket.emit('players', playerName, opponent);
