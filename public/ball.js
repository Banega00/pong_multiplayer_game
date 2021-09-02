import { CANVAS_WIDTH, CANVAS_HEIGHT, c, players } from "./game.js";
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
        this.x = CANVAS_WIDTH / 5;
        this.y = CANVAS_HEIGHT / 5;
    }

    update() {
        this.detectWalls();
        players.forEach(player => {
            //speedX moze da bude i pozitivan i negativ
            //kad je pozitivan i ideo od 0 do speedX
            //kad je negativan ide od speedX do 0
            if (this.speedX > 0) {
                for (let i = 0; i <= this.speedX; i += 2) {
                    let collision = this.detectPlayer(player, i)
                    if (collision) {
                        this.speedX *= -1;
                        return;
                    }
                }
            } else {
                for (let i = this.speedX; i <= 0; i += 2) {
                    let collision = this.detectPlayer(player, i)
                    if (collision) {
                        this.speedX *= -1;
                        return;
                    }
                }
            }
        }
        )
        this.y += this.speedY;
        this.x += this.speedX;
        this.draw();
    }

    detectWalls() {
        if (this.x + this.radius >= CANVAS_WIDTH) this.speedX *= -1;
        // if (this.x - this.radius <= 0) this.speedX *= -1;    
        if (this.y + this.radius >= CANVAS_HEIGHT) this.speedY *= -1;
        if (this.y - this.radius <= 0) this.speedY *= -1;
    }

    detectPlayer(player, speed) {
        let newPos = {
            x: this.x + speed,
            y: this.y + speed
        }
        if (player.index === 1) {
            if (newPos.y - this.radius >= player.y &&
                newPos.y + this.radius <= player.y + player.height &&
                newPos.x - this.radius <= player.x + player.width &&
                newPos.x + this.radius >= player.x) {
                return true;
            }

        } else if (player.index === 2) {
            if (this.y - this.radius >= player.y &&
                this.y + this.radius <= player.y &&
                this.x + this.radius >= player.x) {
                return true;
            }
        }

        return false;
    }
}