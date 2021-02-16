let ServerItem = require('../Utility/ServerItem')
let Vector3 = require('../Vector3')
const util = require('util');

module.exports = class Asteroid extends ServerItem {
    constructor() {
        super();
        this.username = "ASTEROID_AI";
       
        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
        this.tumble = (Math.random() * (20 - 1) + 1);;
        this.speed = (Math.random() * (20 - 1) + 1);
        this.turning = false;
        this.previousDirection  = new Vector3(0,0,1);
        //asteroid rotation
        // this.rotationX = new Number(0);
        // this.rotationY = new Number(0);
        // this.rotationZ = new Number(0);
    }

    onUpdate(onUpdateAI) {
        let ai = this;
        let direction = new Vector3(0,0,1);
        //let lobbyServerItems = aiFlockList;

        let forwardDirection = new Vector3(0,0,1);
        
                //let target = targetPosition;
        
        //if the ai doesnt have a target, return
        if(!ai.hasTarget)
        {
            return;
        }
        //Math.floor(Math.random() * (max - min)) + min;
        //this.speed = Math.floor(Math.random() * (13 - 8)) + 8;
        //ai.target is the player
        let targetConnection = ai.target;
        //console.log("my Target is: " +  targetConnection.player.id)
        let targetPosition = targetConnection.player.position;

        
        
        //GET THE DISTANCE TO THE TARGET
        let distance1 = ai.position.Distance(targetPosition);
        //let distance2 = ai.position.Distance(new Vector3(-1000,0,0));
        //console.log("distance to target: " + distance);
        
        if(Math.abs(distance1) > 5000  /*|| Math.abs(distance2) > 2500*/) {

            this.turning = true;
            //console.log("Turning");
            //console.log("distance1: " + distance1);
        }
        else
        {
            this.turning = false;
            //console.log("NOT Turning");
        }
        
        if(this.turning){
            //console.log("I am turning?  value: " + this.turning);
            //get normalized diretion between Ai and target
            //direction = new Vector3();
            direction.x = targetPosition.x - ai.position.x;
            direction.y = targetPosition.y - ai.position.y;
            direction.z = targetPosition.z - ai.position.z;
            direction = direction.Normalized();
            //console.log("THIS IS MY DIRECTION!!!!!!!!!!!!!! " + JSON.stringify(direction));
            ai.previousDirection.x = direction.x;
            ai.previousDirection.y = direction.y;
            ai.previousDirection.z = direction.z;
            ai.previousDirection = ai.previousDirection.Normalized();
            //console.log("PreviousDirecition value: " + JSON.stringify(ai.previousDirection));
            ai.calculateRotationAndPitch(direction, ai);

            //console.log("about to update AI Flock rotation")
      
            forwardDirection = ai.getForwardDirection();
        }
        else
        {
            //console.log("I am turning?  value: " + this.turning);
            //get normalized diretion between Ai and target
            //direction = new Vector3();
            direction.x =  ai.previousDirection.x;
            direction.y = ai.previousDirection.y;
            direction.z = ai.previousDirection.z;;
            direction = direction.Normalized();
            //console.log("Direcition value: " + JSON.stringify(direction));
            forwardDirection = direction;

            ai.calculateRotationAndPitch(direction, ai);


            // if((Math.floor(Math.random() * (100 - 0)) + 0) < (10)){
            //     //console.log("changing speed");
            //     ai.speed = Math.floor(Math.random() * (8 - 6)) + 6;
            // }
            // if((Math.floor(Math.random() * (100 - 0)) + 0) < (20)){
            //     ai.ApplyRules(targetPosition, aiList, forwardDirection);
               
            // }
        }

 

        // if(isNaN(forwardDirection.x) || isNaN(forwardDirection.y) || isNaN(forwardDirection.z)){
        //     return;
        // }
        // ai.position.x = ai.position.x + forwardDirection.x * ai.speed;//ai.speed;
        //     ai.position.y =  ai.position.y  + forwardDirection.y * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
        //     ai.position.z = ai.position.z + forwardDirection.z * ai.speed;//ai.speed;



        //if((Math.floor(Math.random() * (100 - 0)) + 0) < (20)){
            // //move the AI forward
            //console.log("forward movent 20% of time");
            ai.position.x = ai.position.x + direction.x * ai.speed;//ai.speed;
            ai.position.y =  ai.position.y  + direction.y * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
            ai.position.z = ai.position.z + direction.z * ai.speed;//ai.speed;
            //console.log("forward movent 20% of time X: " + ai.position.x);
            //console.log("forward movent 20% of time Y: " + ai.position.y);
            //console.log("forward movent 20% of time Z: " + ai.position.z);
        // }
        // else if((Math.floor(Math.random() * (100 - 0)) + 0) < (1)){
        //     // //move the AI towards the player 1 percent of the time
        //     //console.log("forward movent 20% of time");
        //     direction.x = targetPosition.x - ai.position.x;
        //     direction.y = targetPosition.y - ai.position.y;
        //     direction.z = targetPosition.z - ai.position.z;
        //     direction.x *= .50;
        //     direction.y *= .50;
        //     direction.z *= .50;
        //     direction = direction.Normalized();
        //     //console.log("THIS IS MY DIRECTION!!!!!!!!!!!!!! " + JSON.stringify(direction));
        //     //console.log("PreviousDirecition value: " + JSON.stringify(ai.previousDirection));
        //     ai.calculateRotationAndPitch(direction, ai);

        //     //console.log("about to update AI Flock rotation")
      
        //     forwardDirection = ai.getForwardDirection();
        //     //ai.previousDirection = forwardDirection;
        //     ai.position.x = ai.position.x + forwardDirection.x * ai.speed;//ai.speed;
        //     ai.position.y =  ai.position.y  + forwardDirection.y * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
        //     ai.position.z = ai.position.z + forwardDirection.z * ai.speed;//ai.speed;
        // }
        // else{

        //     let distanceFromPlayer = ai.position.Distance(targetPosition);
        //     if(distanceFromPlayer <= 75)
        //     {
        //          // //move the AI towards the player 1 percent of the time
        //         //console.log("forward movent 20% of time");
        //         direction.x = ai.position.x - targetPosition.x;
        //         direction.y = ai.position.y - targetPosition.y;
        //         direction.z = ai.position.z - targetPosition.z;
        //         // direction.x *= .5;
        //         // direction.y *= .5;
        //         // direction.z *= .5;
        //         direction = direction.Normalized();
        //         //console.log("THIS IS MY DIRECTION!!!!!!!!!!!!!! " + JSON.stringify(direction));
        //         //console.log("PreviousDirecition value: " + JSON.stringify(ai.previousDirection));
        //         ai.calculateRotationAndPitch(direction, ai);

        //         //console.log("about to update AI Flock rotation")
        
        //         forwardDirection = ai.getForwardDirection();
        //         ai.position.x = ai.position.x + (forwardDirection.x) * ai.speed;//ai.speed;
        //         ai.position.y =  ai.position.y  + (forwardDirection.y) * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
        //         ai.position.z = ai.position.z + (forwardDirection.z) * ai.speed;//ai.speed;
        //     }
        //     else{
        //         //console.log("forward movent most of time");
        //         //forwardDirection = ai.getForwardDirection();
        //         //move forward using the last direction given
                
        //         ai.position.x = ai.position.x + (forwardDirection.x ) * ai.speed;//ai.speed;
        //         ai.position.y =  ai.position.y  + (forwardDirection.y ) * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
        //         ai.position.z = ai.position.z + (forwardDirection.z ) * ai.speed;//ai.speed;
        //     }
            
        // }


        // console.log("ai.name" + ai.name);
        // console.log("ai.id" + ai.id);
        // console.log("ai.position.x," + ai.position.x,);
        // console.log("ai.position.y," + ai.position.y);
        // console.log(" z: ai.position.z" +  ai.position.z);
        // console.log("forwardDirection.x," + forwardDirection.x);
        // console.log("forwardDirection.y," + forwardDirection.y);
        // console.log("forwardDirection.z" + forwardDirection.z);
        // console.log("ai.speed" + ai.speed);
        // if(isNaN(ai.position.x) || isNaN(ai.position.y) || isNaN(ai.position.z)){
        //     return;
        // }
        onUpdateAI({
            name: ai.name,
            id: ai.id,
            position: {
                x: ai.position.x,
                y: ai.position.y,
                z: ai.position.z
            },
            direction: {
                x: forwardDirection.x,
                y: forwardDirection.y,
                z: forwardDirection.z
            },
            speed: ai.speed
        });
        //console.log("AI distance: " + distance);
        return this.isDead;
    }

    respawnCounter(){
        this.respawnTicker = this.respawnTicker + 1;
        if(this.respawnTicker >= 10)
        {
            this.respawnTicker = new Number(0);
            this.respawnTime = this.respawnTime + 1;

            //3 second respond time
            if(this.respawnTime >= 3){
                //console.log('respawning AI id : ' + this.id);
                this.isDead = false;
                this.respawnTicker = new Number(0);
                this.respawnTime = new Number(0);
                this.health = new Number(100);
                var min = Math.ceil(100);
                var max = Math.floor(200);
                this.position = new Vector3(0,0,500);
                //this.position.x = 0;//Math.floor(Math.random() * (max - min)) + min;
                //this.position.y = 0;//Math.floor(Math.random() * (max - min)) + min;
                //this.position.z = 200;//Math.floor(Math.random() * (max - min)) + min;
                //this.position = new Vector3(Math.floor(Math.random() * (max - min)) + min,  Math.floor(Math.random() * (max - min) + min), Math.floor(Math.random() * (max - min)) + min);
                //console.log('respawning AI id : ' + this.id + 'at this position: X: ' + this.position.x + '  Y:' + this.position.y + ' Z:' + this.position.z );
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

    calculateRotationAndPitch(direction, ai){
        let rotation = Math.atan2(direction.x, direction.z) * ai.radiansToDegrees();
        let pitch = -Math.asin(direction.y) * ai.radiansToDegrees();

        if(((isNaN(rotation) || isNaN(pitch))) /*|| ((isNaN(rotation) && isNaN(pitch)))*/){
            return;
        }

        let angleAmount = ai.getAngleDifference(ai.rotation, rotation);//direction we need the angle to rotate
        let angleStep = angleAmount * .1;//dont just snap but rotate towards
        ai.rotation = ai.rotation + angleStep;
        //ai.rotation = rotation;
        angleStep = 0;
        angleAmount = 0;
        angleAmount = ai.getAngleDifference(ai.pitch, pitch);//direction we need the angle to rotate
        angleStep = angleAmount * .1;//dont just snap but rotate towards
        ai.pitch = ai.pitch + angleStep;
        ai.pitch = pitch;
    }

    onObtainTarget(connections){
        let ai = this;
        let foundTarget = false;
        ai.target = undefined;

        //find the closest target and go after
        let availableTargets = connections.filter(connection =>{
            let player = connection.player;
            return ai.position.Distance(player.position) < 20000;
        });

        //sort through to find the closest oppoent; perhaps in the future you can
        //expand that for lowest health
        availableTargets.sort((a,b) => {
            let aDistance = ai.position.Distance(a.player.position);
            let bDistance = ai.position.Distance(b.player.position);
            return (aDistance < bDistance) ? -1 : 1;
        });

        if(availableTargets.length > 0){
            foundTarget = true;
            ai.target = availableTargets[0];

        }

        ai.hasTarget = foundTarget;
    }

    getForwardDirection() {
        let ai = this;

        let radiansRotation = (ai.rotation) * ai.degreesToRadians(); //We need the 90 degree art offset to get the correct vector
        let radiansPitch = (ai.pitch) * ai.degreesToRadians();
        let sin = Math.sin(radiansRotation);
        let cos = Math.cos(radiansRotation);

        //let tan = Math.tan(radiansRotation);

        let worldUpVector = ai.worldUpVector();
        let tx = worldUpVector.x;
        let ty = worldUpVector.y;
        let tz = worldUpVector.z;

        return new Vector3((Math.sin(radiansRotation) * tz) + (Math.cos(radiansRotation) * tx), (Math.sin(radiansPitch) * -1), (Math.cos(radiansRotation) * tz) - (Math.sin(radiansRotation) * tx));      
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