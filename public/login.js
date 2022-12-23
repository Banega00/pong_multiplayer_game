const submitName = async () => {
    const nameInput = document.getElementById('name');
    if (!nameInput) return;

    if (!nameInput.value) return alert('Name cannot be empty')

    try {
        let response = await fetch("https://pong-multiplayer.onrender.com/login", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: nameInput.value })
        })

        response = await response.json();

        console.log(response);

        sessionStorage.setItem('name', nameInput.value)
        window.location = "https://pong-multiplayer.onrender.com/index.html"
    } catch (error) {
        console.log(error);
    }
}