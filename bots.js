function randShooter (spaceShooter,canvas){
    this.goingPoint = null;
    this.spaceShooter = spaceShooter;
    this.playground = canvas.width;
    this.changeMindPrecentage = 0.01;
    var parent = this;
    this.tryChangeMind = function(){
        changeMind = Math.random();
        if (changeMind <= parent.changeMindPrecentage){
            parent.newDistenation();
        }
    };
    this.move = function (){
        if (parent.goingPoint == null || Math.abs(parent.spaceShooter.x - parent.goingPoint) <= parent.spaceShooter.speed){
            parent.newDistenation()
        }
        else if(parent.spaceShooter.x > parent.goingPoint){
            parent.spaceShooter.x -= parent.spaceShooter.speed;
        }
        else if (parent.spaceShooter.x < parent.goingPoint){
            parent.spaceShooter.x += parent.spaceShooter.speed;
        }
        // try to change his mind
        parent.tryChangeMind();
    };
    this.newDistenation = function(){
        parent.goingPoint = Math.round(Math.random() * parent.playground)
    }

}

// DestroyCloserAsteroid 'DCA'
function DCAShooter(spaceShooter,asteroids) {
    this.goingPoint = null;
    this.spaceShooter = spaceShooter;
    var parent = this;
    this.getCloseAsteroid = function(){
        var closerAsteroidY = 0;
        for (i = 0; i < asteroids.length; i++){
            if (asteroids[i].y > closerAsteroidY){
                closerAsteroidY = asteroids[i].y;
                parent.goingPoint = asteroids[i].x;
            }
        }
    };
    this.move = function() {
        if (parent.goingPoint == null || Math.abs(parent.spaceShooter.x - parent.goingPoint) <= parent.spaceShooter.speed){
            if(Math.random() > 0.5){
                parent.spaceShooter.x -= parent.spaceShooter.speed;
            }
            else{
                parent.spaceShooter.x += parent.spaceShooter.speed;
            }
            parent.getCloseAsteroid();
        }
        else if(parent.spaceShooter.x > parent.goingPoint){
            parent.spaceShooter.x -= parent.spaceShooter.speed;
        }
        else if (parent.spaceShooter.x < parent.goingPoint){
            parent.spaceShooter.x += parent.spaceShooter.speed;
        }
    }
}

function bot () {
    this.autoFireId = null;
    this.shutdown = false;
    this.spaceShooter = null;
    this.asteroids = null;
    this.canvas = null;
    this.botAlgor = null;
    var parent = this;
    this.deactivateAutoFire = function (){
        clearInterval(autoFireId);
    };
    this.activateAutoFire = function(interval) {
        autoFireId = setInterval(parent.autoFire,interval);
    };
    this.autoFire = function() {
        parent.spaceShooter.shootBullet()
    }
    this.turnBotState = function(){
        parent.shutdown *= -1;
    };
    this.updateBot = function(){
        // random move bot
        if ((!parent.shutdown) && parent.botAlgor != null){
            parent.botAlgor.move();
            //console.log(parent.botAlgor.goingPoint)
        }
    };
    this.InitBotAlgo = function(){
        parent.botAlgor = new DCAShooter(parent.spaceShooter,parent.asteroids)
        //parent.botAlgor = new randShooter(parent.spaceShooter,parent.canvas)
        
    }
}
