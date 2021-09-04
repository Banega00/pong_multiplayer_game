import { CANVAS_WIDTH, CANVAS_HEIGHT, c, players, gameId } from "./game.js";
import { socket } from "./index.js";
export default class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.centerBall();
        this.color = color;

        this.speedX = 5;
        this.speedY = 5;
    }

    draw() {
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        c.fill();
    }

    accelerate(absoluteSpeed) {
        console.log(absoluteSpeed)
        this.speedX = this.speedX >= 0 ? this.speedX + absoluteSpeed : this.speedX - absoluteSpeed
    }

    centerBall() {
        this.x = CANVAS_WIDTH / 2;
        this.y = CANVAS_HEIGHT / 2;
    }

    calculateNextPos() {
        let x, y;
        players.forEach(player => {
            this.detectWalls()
            //speedX moze da bude i pozitivan i negativ
            //kad je pozitivan i ideo od 0 do speedX
            //kad je negativan ide od speedX do 0
            if (this.speedX > 0) {
                for (let i = 0; i <= this.speedX; i += 2) {
                    let collision = this.detectPlayer(player, i)
                    if (collision) {
                        this.speedX *= -1;
                        this.speedX += this.speedX > 0 ? 0.5 : -0.5;
                        return;
                    }
                }
            } else {
                for (let i = this.speedX; i <= 0; i += 2) {
                    let collision = this.detectPlayer(player, i)
                    if (collision) {
                        this.speedX *= -1;
                        this.speedX += this.speedX > 0 ? 0.5 : -0.5;
                        return;
                    }
                }
            }
        }
        )
        y = this.y + this.speedY;
        x = this.x + this.speedX;

        return { x, y };
    }

    update() {
        const { x, y } = this.calculateNextPos();
        this.x = x;
        this.y = y;
        this.draw();
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    detectWalls() {
        if (this.x + this.radius >= CANVAS_WIDTH + 300) {
            emitPoint(1)//player 1 gets the point
            this.centerBall()
            this.speedX = -5;
            this.speedY = -5;
        }
        if (this.x - this.radius <= 0 - 300) {
            emitPoint(2)//player 2 gets the point
            this.speedX = 5;
            this.speedY = -5;
            this.centerBall()
        }
        if (this.y + this.radius >= CANVAS_HEIGHT) {
            this.speedY = 0 - Math.abs(this.speedY);
        }
        if (this.y - this.radius <= 0) {
            this.speedY = Math.abs(this.speedY);;
        }
    }

    detectPlayer(player, speed) {
        let newPos = {
            x: this.x + speed,
            y: this.y + speed
        }


        if (player.index === 1) {
            if (newPos.y >= player.y &&
                newPos.y <= player.y + player.height &&
                newPos.x <= player.x + player.width &&
                newPos.x >= player.x) {
                return true;
            }

        } else if (player.index === 2) {
            if (this.y >= player.y &&
                this.y <= player.y + player.height &&
                this.x >= player.x &&
                this.x <= player.x + player.width) {
                return true;
            }
        }

        return false;
    }
}

function emitPoint(index) {
    socket.emit('point', index, gameId);
}

