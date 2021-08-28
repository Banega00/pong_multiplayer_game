const submitName = async () => {
    const nameInput = document.getElementById('name');
    if (!nameInput) return;

    if (!nameInput.value) return alert('Name cannot be empty')

    try {
        let response = await fetch("http://localhost:8080/login", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: nameInput.value })
        })

        response = await response.json();

        console.log(response);

        localStorage.setItem('name', nameInput.value)
        window.location = "http://localhost:8080/index.html"
    } catch (error) {
        console.log(error);
    }
}