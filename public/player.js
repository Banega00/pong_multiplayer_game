import { CANVAS_WIDTH, CANVAS_HEIGHT, c, players, canvasRect, gameId } from "./game.js";
import { playerGameIndex, socket } from './index.js'
export default class Player {
    constructor(index, color) {
        //index determins is it player 1 or player 2
        this.index = index;
        this.x = 0;
        this.y = 0;
        this.width = 20;
        this.height = 100;

        this.centerPlayer(index);

        this.color = color;

        this.speedX = 0;
        this.speedY = 0;
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y-this.height/2, this.width, this.height);
    }

    centerPlayer(index) {
        //player 1 is placed on left side and player 2 is placed on right
        this.x = this.index == 1 ? 10 : CANVAS_WIDTH - this.width - 10
        this.y = CANVAS_HEIGHT / 2
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
        this.y += this.speedY;
        this.draw();
    }

    positionPlayer() {
        this.x = this.index == 1 ? 10 : CANVAS_WIDTH - this.width - 10
        this.y = CANVAS_HEIGHT / 2 - this.height / 2
    }

    updatePosition(x, y) {
        console.log(y);
        this.y = y;
    }

    changeColor(color) {
        this.color = color;
        this.update()
    }
}


export function updatePosition(event) {
    if(gameId)
        socket.emit('update_position', event.clientX - canvasRect.x, event.clientY - canvasRect.y, playerGameIndex, gameId);
}       //calculated offset from canvas element

socket.on('update_position', (x, y, index) => {
    players[index].updatePosition(x, y);
})


