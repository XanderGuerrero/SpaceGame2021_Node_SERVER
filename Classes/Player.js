var shortID = require('shortid');
var Vector3 = require('./Vector3.js');

//export class
module.exports = class Player{
    constructor(){
        //class variables
        this.username = 'Default_Player';
        this.id = shortID.generate();
        this.position = new Vector3();
        this.zTiltValue = new Number(0);
        this.lobby = 0;
        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
    }

    displayPlayerInformation(){
        let player = this;
        return '(' + player.username + ':' + player.id + ')';
    }

    respawnCounter(){
        this.respawnTicker = this.respawnTicker + 1;
        if(this.respawnTicker >= 10)
        {
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            //3 second respond time
            //set everything back to defaults
            //return true (back to life)
            if(this.respawnTime >= 3){
                console.log('respawning player id : ' + this.id);
                this.isDead = false;
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                this.position = new Vector3(-8,5,10);

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
}