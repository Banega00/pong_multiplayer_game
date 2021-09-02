import { CANVAS_WIDTH, CANVAS_HEIGHT, c, players, canvasRect, gameId } from "./game.js";
import { playerGameIndex, socket } from './index.js'
export default class Player {
    constructor(index, color) {
        //index determins is it player 1 or player 2
        this.index = index;
        this.x = 0;
        this.y = 0;
        this.width = 30;
        this.height = 100;

        this.centerPlayer(index);

        this.color = color;

        this.speedX = 0;
        this.speedY = 0;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
    }

    centerPlayer(index) {
        //player 1 is placed on left side and player 2 is placed on right
        this.x = this.index == 1 ? 10 : CANVAS_WIDTH - this.width - 10
        this.y = CANVAS_HEIGHT / 2 - this.height / 2
    }

    moveUp() {
        this.speedY = -2;
    }

    moveDown() {
        this.speedY = 2;
    }

    stopUp() {
        this.speedY = 0;
    }

    stopDown() {
        this.speedY = 0;
    }

    update() {
        this.detectWalls();
        this.y += this.speedY;
        this.draw();
    }

    detectWalls() {

        if (this.y + this.speedY <= 0) {
            this.y = 0;
            this.speedY = 0;
        } else if (this.y + this.height + this.speedY >= CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.height;
            this.speedY = 0;
        }
    }

    positionPlayer() {
        this.x = this.index == 1 ? 10 : CANVAS_WIDTH - this.width - 10
        this.y = CANVAS_HEIGHT / 2 - this.height / 2
    }

    updatePosition(x, y) {
        this.y = y - this.height / 2 - canvasRect.y;
    }
}

window.addEventListener('mousemove', (event) => updatePoistion(event));

function updatePoistion(event) {
    socket.emit('update_position', event.clientX, event.clientY, playerGameIndex, gameId);
}

socket.on('update_position', (x, y, index) => {
    console.log("STIZE MI, ", x, y, index)
    players[index - 1].updatePosition(x, y);
})


