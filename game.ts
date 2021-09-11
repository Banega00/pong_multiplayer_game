export default class Ball {
    
    public x:number;
    public y:number;
    public radius:number;
    public color:string;
    public speedX:number;
    public speedY:number;

    public CANVAS_WIDTH:number;
    public CANVAS_HEIGHT:number;

    public players = []

    public canvasRect:{x:number, y:number};
    
    constructor(x, y, radius, color, canvasRect) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.canvasRect = canvasRect;

        this.centerBall();
        this.color = color;

        this.speedX = 5;
        this.speedY = 5;

        this.CANVAS_WIDTH = 800;
        this.CANVAS_HEIGHT = 450;

        this.players.push({x: 0 , y: 0, width: 20 , height:100, index:1}, {x: 0 , y: 0, width: 20 , height:100, index:2})
        this.players.forEach((player, i)=>{
            this.centerPlayer(i);
        })
    }

    public setPlayerPosition(x: number, y: number, i:number) {
        //canvas element offset is calculated
        const player =  this.players[i];
        if(y < player.height/2){
            player.y = player.height/2;
        }else if(y + player.height/2 > this.CANVAS_HEIGHT ){
            player.y = this.CANVAS_HEIGHT - player.height/2;
        }else{
            player.y = y;
        }
        // this.players[i].x = x;
    }

    centerPlayer(index) {
        //player 1 is placed on left side and player 2 is placed on right
        this.players[index].x = index == 0 ? 10 : this.CANVAS_WIDTH - this.players[index].width - 10
        this.players[index].y = this.CANVAS_HEIGHT / 2;
    }

    accelerate(absoluteSpeed) {
        console.log(absoluteSpeed)
        this.speedX = this.speedX >= 0 ? this.speedX + absoluteSpeed : this.speedX - absoluteSpeed
    }

    centerBall() {
        this.x = this.CANVAS_WIDTH / 2;
        this.y = this.CANVAS_HEIGHT / 2;
    }

    calculateNextPos() {
        let x, y;
        this.players.forEach(player => {
            this.detectWalls();
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
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    detectWalls() {
        if (this.x + this.radius >= this.CANVAS_WIDTH + 300) {
            this.centerBall()
            this.speedX = -5;
            this.speedY = -5;
        }
        if (this.x - this.radius <= 0 - 300) {
            this.speedX = 5;
            this.speedY = -5;
            this.centerBall()
        }
        if (this.y + this.radius >= this.CANVAS_HEIGHT) {
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

        //player.y is y coord of CENTER of player
        if (player.index === 1) {
            if (newPos.y >= player.y - player.height/2 &&
                newPos.y <= player.y - player.height/2 + player.height &&
                newPos.x <= player.x + player.width &&
                newPos.x >= player.x) {
                return true;
            }

        } else if (player.index === 2) {
            if (this.y >= player.y - player.height/2 &&
                this.y <= player.y - player.height/2 + player.height &&
                this.x >= player.x &&
                this.x <= player.x + player.width) {
                return true;
            }
        }

        return false;
    }
}
