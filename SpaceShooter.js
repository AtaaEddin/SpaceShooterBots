/*
TODO:
    
    fix collision between asteroids and spaceShip
*/
const controlKeys = {
    76 : false, // 'L' key = fire
    68 : false, // 'D' key = left
    65 : false // 'A; key = right
};

// don't play with these controls :p
const asteroidJumps = 0.8; //0.8 
const spaceShipJumps = 5;
const bulletJumps = 5;
const gameAreaRefresh = 5;

// game controllers
const asteroidsSpwanSpeed = 50;
const asteroidGravity = 5; // how fast go down
const minAsteroidSpawn = 1;
const maxAsteroidSpawn = 5;
const minAsteroidRaduis = 30;
const maxAsteroidRaduis = 50;
const bulletsSpeed = 0.01; // how fast bullet go up
const BotSpeed = 0.01 // how fast the bot can go left and right

// the space ship :)
var myHero;

// the super bot is here!
var myBot;

var asteroids = [];
var bullets = [];
var myScoreBoard;

function startGame() {
    GameArea.start();
    myHero = new SpaceShip(30);
    tools.SpaceShipListener();    
    myScoreBoard = new scoreBoard();
    InitBot();
}

var GameArea =  {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 560;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.getElementById('Controller'));
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, gameAreaRefresh); //20
        this.bulletInterval = setInterval(updateBullets, bulletsSpeed); //20
        this.BotMovementInterval = setInterval(updateBotMovement, BotSpeed);
        this.asteroidsMovementInterval = setInterval(updateAsteriodsMovements, asteroidGravity)
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function InitBot() {
    myBot = new bot();
    myBot.spaceShooter = myHero;
    myBot.asteroids = asteroids;
    myBot.canvas = GameArea.canvas;
    myBot.activateAutoFire(200);
    myBot.InitBotAlgo();
}

function updateGameArea() {
    GameArea.clear();
    GameArea.frameNo += 1;

    // spwan asteroid
    if(tools.everyinterval(asteroidsSpwanSpeed)) {
        asteroidsFuns.generateNewOne(minAsteroidSpawn,
                                    maxAsteroidSpawn,
                                    minAsteroidRaduis,
                                    maxAsteroidRaduis)        
    }

    // draw asteroids
    asteroidsFuns.drawAll();

    // draw all bullets
    BulletsFuns.updateAllDraw();

    // SpaceShip update 'just drawing'
    myHero.update();

    // collision detection
    tools.asteroBulletCollision();
    tools.asteroSpaceshipCollision();

    // update score
    myScoreBoard.update();

}

function updateAsteriodsMovements(){
    // update all asteroids movement
    asteroidsFuns.moveAlldown();
} 

function updateBullets(){
    // Bullets update movement
    BulletsFuns.updateAllMovement();
    
}

function updateBotMovement(){
    // update bot movement
    myBot.updateBot();
}

function Bullet(InitX,InitY) {
    this.x = InitX;
    this.y = InitY;
    this.speed = bulletJumps;
    this.width = 5;
    this.height = 10;
    this.draw = new tools.draw();
    this.bulletHead = function() {
        return [Math.round(this.width / 2) + this.x,this.y]
    };
    this.outScreen = function () {
        if(this.y < 0) {return true;}
        return false;
    }
    this.moveBulletUp = function () {
        this.y -= this.speed;
    }
    this.update = function () {
        this.draw.Box(this.width,this.height,"red",this.x,this.y);
    }
    this.updateMovement = function() {
        this.moveBulletUp();
    }
}

var BulletsFuns =  {
    bullets : bullets,
    generateNewOne: function (x,y){
        bullets.push(new Bullet(x,y));
    },
    updateAllMovement : function (){
        for (i = 0; i < bullets.length; i++){
            bullets[i].updateMovement();
            if(bullets[i].outScreen()){
               bullets.splice(i,1);
            }
        }
    },
    updateAllDraw : function(){
        for (i = 0; i < bullets.length; i++){
            bullets[i].update();
        }
    }    
}

function SpaceShip(lineLength) {
    this.x = Math.round(GameArea.canvas.width / 2);
    this.y = GameArea.canvas.height;
    this.lineLength = lineLength;
    this.speed = spaceShipJumps;
    this.draw = new tools.draw();
    this.height = 15;
    this.getSpaceHeader = function() {
        return [this.x,this.y - this.height];
    };
    this.update = function () {
        this.draw.triangle(this.x,this.y,this.lineLength,"red",this.height);
    };
    this.shootBullet = function() {
        let triangleUpperPoint = this.y - this.height
        BulletsFuns.generateNewOne(this.x,triangleUpperPoint)
    };
    this.goLeft = function() {
        this.x -= myHero.speed;
        console.log("left")
    }
    this.goRight = function() {
        this.x += myHero.speed;
        console.log("right")
    }

}

// assuming asteroid will be just circles..:)
function asteroid(InitX, InitY, radius) {
    this.x = InitX;
    this.y = InitY;
    this.radius = radius;
    this.draw = new tools.draw();
    this.circleEdgePoint = function (){
        return [this.x,(this.y + this.radius)]
    };
    this.updateDraw = function () {
        this.draw.Cricle(radius, "green", this.x, this.y)
    };
    this.moveDown = function(){
        this.applyGravityForce();
    }
    this.applyGravityForce = function () {
        this.y += asteroidJumps;         
    };
    this.hitBottom = function () {
        let disappeared = GameArea.canvas.height + this.radius;
        if (this.y > disappeared){
            return true;
        }
        return false;
    }
} 

var asteroidsFuns = {
    asteroids : asteroids,
    generateNewOne : function (minAsteroids,maxAsteroids,minRaduis,maxRaduis) {
        // tmp array
        var newAsteroids = []
        isAsteroid = function (thisX, thisRaduis, otherX, otherRaduis) {
            let distance = Math.abs(thisX - otherX);
            if (distance < (thisRaduis + otherRaduis)) {return true;}
            return false;
        }
        canPlace = function (thisAsteroid,newAsteroids) {
            if (newAsteroids.length == 0) {return true;}
            for(i = 0; i < newAsteroids.length; i++){
                if (isAsteroid(thisAsteroid.x,
                                thisAsteroid.radius,
                                newAsteroids[i].x,
                                newAsteroids[i].radius)){
                    return false;
                }
            }
            return true;

        }
        const asteroidsNum = tools.randnum(minAsteroids,maxAsteroids);
        const Maxtrys = 10;
        let counter = 0;
        let tryRound = 0;
        while (counter < asteroidsNum){
            let randWidth = tools.randnum(0,GameArea.canvas.width);
            let randRaduis = tools.randnum(minRaduis,maxRaduis);
            newAsteroid = new asteroid(randWidth,0,randRaduis);
            if(canPlace(newAsteroid,newAsteroids)){
                asteroids.push(newAsteroid);
                newAsteroids.push(newAsteroid);
                counter++;
                tryRound = 0;
            }
            else {
                tryRound++;
            }

            if (tryRound == Maxtrys){
                break;
            }
        }
    },
    drawAll : function () {
        for(i = 0; i < asteroids.length; i++){
            asteroids[i].updateDraw();
            
        } 
    },
    moveAlldown : function() {
        for(i = 0; i < asteroids.length; i++){
            asteroids[i].moveDown();
            if (asteroids[i].hitBottom()){
                //asteroids.splice(i,1);
                tools.gameOver();
            }
        } 

    }
}

function scoreBoard () {
    this.score = 0;
    this.board = new tools.draw();
    this.update = function() {
        this.board.Text("score:"+this.score,"20px", "Consolas",
                    GameArea.canvas.width * 10 / 13,
                    20,
                    "black");
    }
}

function shutDownGame(){
    clearInterval(GameArea.interval);
    clearInterval(GameArea.BotMovementInterval);
    clearInterval(GameArea.bulletInterval);
    clearInterval(GameArea.asteroidsMovementInterval);
}

var tools = {
    draw : function (){
        this.ctx = GameArea.context;
        this.Box = function (width, height, color, x, y) {
            this.ctx.fillStyle = color
            this.ctx.fillRect(x,y,width,height)
        };
        this.Cricle = function (radius, color, x, y) {
            this.ctx.fillStyle = color
            this.ctx.beginPath();
            this.ctx.arc(x,y,radius,0,2 * Math.PI);
            this.ctx.stroke();
        };
        this.Text = function (text, size, style, x, y,color) {
            this.ctx.font = size + " " + style;
            this.ctx.fillStyle = color;
            this.ctx.fillText(text,x,y);
        }
        this.triangle = function (X,Y,lineLength,color,height) {
            const p1 = {
                x : X - Math.round(lineLength / 2),
                y : Y
            }
            const p2 = {
                x : X + Math.round(lineLength / 2),
                y : Y
            }
            const p3 = {
                x : X,
                y : Y - height
            }
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x,p1.y);
            this.ctx.lineTo(p2.x,p2.y);
            this.ctx.lineTo(p3.x,p3.y);
            this.ctx.closePath();

            //this.ctx.lineWidth = 10;
            //this.ctx.strokeStyle = color;
            this.ctx.stroke();

            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
    },
    randnum : function (max,min) {
        return Math.floor(Math.random()*(max-min)+min)
    },
    everyinterval : function (n) {
        if((GameArea.frameNo / n) % 1 == 0) {return true;}
        return false;
    },
    SpaceShipListener : function () {
        function keydown(e) {
            e = e || event;
            controlKeys[e.keyCode] = true//e.type == 'keydown';
            // 'L' key
            if (controlKeys[76]){
                myHero.shootBullet();
            }
            // 'D' key
            if (controlKeys[68]){
                if (myHero.x > GameArea.canvas.width){
                    myHero.x = GameArea.canvas.width;     
                }
                // move right
                myHero.goRight;
            }
            // 'A' key
            if(controlKeys[65]){
                if (myHero.x < 0){
                    myHero.x = 0;    
                }
                // move left
                myHero.goLeft;
            }    
        };
        function keyUp(e) {
          controlKeys[e.keyCode] = false;
        };
        window.addEventListener("keydown",keydown,true);
        window.addEventListener("keyup",keyUp,true);
    },
    asteroBulletCollision : function (){
        for (i = 0; i < asteroids.length; i++){
            for (j = 0; j < bullets.length; j++){
                var hasCollided = asteroids[i] && (this.hasCollided(bullets[j].bulletHead(),
                [asteroids[i].x,asteroids[i].y],
                asteroids[i].circleEdgePoint()) ||
                this.hasCollided([bullets[j].x,bullets[j].y],
                [asteroids[i].x,asteroids[i].y],
                asteroids[i].circleEdgePoint()) ||
                this.hasCollided([bullets[j].x + bullets[j].width,bullets[j].y],
                [asteroids[i].x,asteroids[i].y],
                asteroids[i].circleEdgePoint()))

                if (hasCollided){
                    bullets.splice(j,1);
                    asteroids.splice(i,1);
                    myScoreBoard.score ++;
                }
            }
        }
    },
    asteroSpaceshipCollision : function (){
        for (i = 0; i < asteroids.length; i++){
            //alert(myHero.getSpaceHeader())
            if (asteroids[i] && this.hasCollided(myHero.getSpaceHeader(),
                                [asteroids[i].x,asteroids[i].y],
                                asteroids[i].circleEdgePoint())){
                
                tools.gameOver();
            }            
        }
    },
    hasCollided : function (firstObjPoint,otherObjPoint,otherObjEdge) {
        if(this.eucDistance(firstObjPoint,otherObjPoint) <= 
                this.eucDistance(otherObjPoint,otherObjEdge)){
            return true;
        }
        return false;
    },
    eucDistance : function (a, b) {
        return a
            .map((x, i) => Math.abs( x - b[i] ) ** 2) // square the difference
            .reduce((sum, now) => sum + now) // sum
            ** (1/2)
    },
    gameOver : function() {
        new tools.draw().Text("Game Over", "50px", "Consolas",
                                    GameArea.canvas.width / 4,
                                    GameArea.canvas.height / 2,
                                    "red");
        shutDownGame();
        myBot.deactivateAutoFire();
    }
}

