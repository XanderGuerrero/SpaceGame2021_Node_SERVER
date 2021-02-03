let ServerItem = require('../Utility/ServerItem')
let Vector3 = require('../Vector3')

module.exports = class AIBase extends ServerItem {
    constructor() {
        super();
        this.username = "AI_Base";

        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
        this.speed = .1;
        this.rotationSpeed = .1;
    }

    onUpdate(onUpdateAI) {
        //Calculate Statemachine
        //console.log('AI_Update');
    }

    onObtainTarget(connections) {

    }

    respawnCounter(){
        this.respawnTicker = this.respawnTicker + 1;
        if(this.respawnTicker >= 10)
        {
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            //3 second respond time
            if(this.respawnTime >= 3){
                console.log('respawning AI id : ' + this.id);
                this.isDead = false;
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                this.position = new Vector3(Math.floor(Math.random() * (100 - 0)) + 0, Math.floor(Math.random() * (100 - 0)) + 0, 400);

                return true;
            }
        }
        return false;
    }

    dealDamage(amount = Number)
    {
        //I was hit, decrase my health
        this.health = this.health - amount;

        //check if we are dead
        if(this.health <= 0)
        {
            this.isDead = true;
            this.respawnTicker = new Number(0);
            this.respawnTime = new Number(0);           
        }
        return this.isDead;
    }

    radiansToDegrees(){
        return new Number(57.29578);//360/(PI * 2);
    }

    degreesToRadians(){
        return new Number(0.01745329);
    }


    worldUpVector(){
        return new Vector3(0, 0, 1);
    }

    getAngleDifference(one, two){
        
        let diff = (two - one + 180) % 360 - 180;
        //console.log("difference : " + diff);
        return diff < -180 ? diff + 360 : diff;
        //return diff > 180 ? 360 - diff : diff;
    }
}

