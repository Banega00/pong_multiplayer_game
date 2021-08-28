const playerName = localStorage.getItem('name')

document.querySelectorAll('.playerName').forEach(span => span.innerText = playerName + '!')