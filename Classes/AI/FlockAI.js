let AIBase = require('../AI/AIBase');
let Vector3 = require('../Vector3');
// var robustDot = require("robust-dot-product");
// let LobbyBase = require('../Lobbies/LobbyBase');
// var util = require('util')
// let ServerItem = require('../Utility/ServerItem')
// let GameLobby = require('../Lobbies/GameLobby')

module.exports = class FlockAI extends AIBase{
    constructor(){
        super();
        this.username = "FLOCK_AI";
        this.position = new Vector3();
        //this.barrelRotation = new Number(0);
        this.shipTiltRotation = new Number(0);
        this.shipTiltRotationX = new Number(0);
        this.shipTiltRotationY = new Number(0);

        this.health = new Number(100);
        this.isDead = false;
        this.respawnTicker = new Number(0);
        this.respawnTime = new Number(0);
        this.target;
        this.hasTarget = false;
        this.groupSize = 0;
        
        //AI stats
        this.rotation = 0;
        this.pitch = 0;

        //shooting
        this.canShoot = false;
        this.currentTime = Number(0);
        this.reloadTime = Number(5);
        this.turning = false;
        this.minSpeed = null;
        this.maxSpeed = null;
        this.speed = null;
        this.flyLimits = 800;
        this.turning = false;
        this.previousDirection  = new Vector3(0,0,1);
    }


    onUpdate(updateAI_Rotation, onUpdateAI, fireBullet, aiList){
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
        this.speed = Math.floor(Math.random() * (13 - 8)) + 8;
        //ai.target is the player
        let targetConnection = ai.target;
        //console.log("my Target is: " +  targetConnection.player.id)
        let targetPosition = targetConnection.player.position;

        

        //GET THE DISTANCE TO THE TARGET
        let distance1 = ai.position.Distance(targetPosition);
        let distance2 = ai.position.Distance(new Vector3(-1000,0,0));
        //console.log("distance to target: " + distance);
        
        if(Math.abs(distance1) > 5000  || Math.abs(distance2) > 5000) {

            this.turning = true;
            
        }
        else
        {
            this.turning = false;
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
        else{
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


            if((Math.floor(Math.random() * (100 - 0)) + 0) < (10)){
                //console.log("changing speed");
                ai.speed = Math.floor(Math.random() * (8 - 6)) + 6;
            }
            if((Math.floor(Math.random() * (100 - 0)) + 0) < (20)){
                ai.ApplyRules(targetPosition, aiList, forwardDirection);
               
            }
        }

 


        // ai.position.x = ai.position.x + forwardDirection.x * ai.speed;//ai.speed;
        //     ai.position.y =  ai.position.y  + forwardDirection.y * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
        //     ai.position.z = ai.position.z + forwardDirection.z * ai.speed;//ai.speed;
        if((Math.floor(Math.random() * (100 - 0)) + 0) < (20)){
            // //move the AI forward
            //console.log("forward movent 20% of time");
            ai.position.x = ai.position.x + forwardDirection.x * ai.speed;//ai.speed;
            ai.position.y =  ai.position.y  + forwardDirection.y * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
            ai.position.z = ai.position.z + forwardDirection.z * ai.speed;//ai.speed;
        }
        else if((Math.floor(Math.random() * (100 - 0)) + 0) < (1)){
            // //move the AI towards the player 1 percent of the time
            //console.log("forward movent 20% of time");
            direction.x = targetPosition.x - ai.position.x;
            direction.y = targetPosition.y - ai.position.y;
            direction.z = targetPosition.z - ai.position.z;
            direction.x *= .5;
            direction.y *= .5;
            direction.z *= .5;
            direction = direction.Normalized();
            //console.log("THIS IS MY DIRECTION!!!!!!!!!!!!!! " + JSON.stringify(direction));
            //console.log("PreviousDirecition value: " + JSON.stringify(ai.previousDirection));
            ai.calculateRotationAndPitch(direction, ai);

            //console.log("about to update AI Flock rotation")
      
            forwardDirection = ai.getForwardDirection();
            //ai.previousDirection = forwardDirection;
            ai.position.x = ai.position.x + forwardDirection.x * ai.speed;//ai.speed;
            ai.position.y =  ai.position.y  + forwardDirection.y * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
            ai.position.z = ai.position.z + forwardDirection.z * ai.speed;//ai.speed;
        }
        else{

            let distanceFromPlayer = ai.position.Distance(targetPosition);
            if(distanceFromPlayer <= 75)
            {
                 // //move the AI towards the player 1 percent of the time
                //console.log("forward movent 20% of time");
                direction.x = ai.position.x - targetPosition.x;
                direction.y = ai.position.y - targetPosition.y;
                direction.z = ai.position.z - targetPosition.z;
                // direction.x *= .5;
                // direction.y *= .5;
                // direction.z *= .5;
                direction = direction.Normalized();
                //console.log("THIS IS MY DIRECTION!!!!!!!!!!!!!! " + JSON.stringify(direction));
                //console.log("PreviousDirecition value: " + JSON.stringify(ai.previousDirection));
                ai.calculateRotationAndPitch(direction, ai);

                //console.log("about to update AI Flock rotation")
        
                forwardDirection = ai.getForwardDirection();
                ai.position.x = ai.position.x + (forwardDirection.x) * ai.speed;//ai.speed;
                ai.position.y =  ai.position.y  + (forwardDirection.y) * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
                ai.position.z = ai.position.z + (forwardDirection.z) * ai.speed;//ai.speed;
            }
            else{
                //console.log("forward movent most of time");
                //forwardDirection = ai.getForwardDirection();
                //move forward using the last direction given
                
                ai.position.x = ai.position.x + (forwardDirection.x ) * ai.speed;//ai.speed;
                ai.position.y =  ai.position.y  + (forwardDirection.y ) * ai.speed;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
                ai.position.z = ai.position.z + (forwardDirection.z ) * ai.speed;//ai.speed;
            }
            
        }


        //console.log("direction: " + JSON.stringify(forwardDirection));
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

        //shooting
        if(ai.canShoot && ai.isDead == false){
            //console.log("AI - can shoot - AI id: " + ai.id);
            if((Math.floor(Math.random() * (100 - 0)) + 0) < (10)){
                fireBullet({
                    activator: ai.id,
                    position: ai.position.JSONData(),
                    direction: direction.JSONData()
                });
                    //console.log("AI - cannot shoot - AI id: " + ai.id);
                    ai.canShoot = false;
                    ai.currentTime = Number(0);
            }
            }else{
            //console.log("AI - can shoot - AI id: " + ai.id);
                ai.currentTime = Number(ai.currentTime) + Number(0.1);
                if(ai.currentTime >= ai.reloadTime){
                ai.canShoot = true;
            }
        }
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

    ApplyRules(targetPosition, aiList, forwardDirection){
        let ai = this;
        let vCentre = new Vector3(0,0,0);
        let vAvoid = new Vector3(0,0,0);
        let gSpeed = 0.01;//Group Speed
        let groupSize = 0;
        // let rotation = 0;
        // let pitch = 0;
        //let serverItems = lobby.serverItems;
        //console.log(util.inspect(serverItems));
        var newArray = [];
        newArray = newArray.concat(aiList);
        //LobbyBase = lobby;

        //console.log("INSIDE APPLY RULES!!!!!!!!!");
        let aiFList = newArray.filter(item => {return item instanceof FlockAI;});
        //console.log(aiFList);
        aiFList.forEach(aiInFlock => {

            //console.log("aiInFlock.id: " + aiInFlock.id + " ai.id: " + ai.id);
            //if this is not the current ai
            if(aiInFlock.id != ai.id ){
                //get the distance from this ai to each ai in the whole flock
                let distance = ai.position.Distance(aiInFlock.position);
                //console.log("distance to other AIs is : " + distance);
                //if the distance is less than or equal to 100,
                //consider this ai part of our "group"
                if(Math.abs(distance) <= 45){//neighbouring ai distance
                    //add player position to the vCentre
                    //we need an average to calculate the centre of the flock
                    //loop around and add each ai's position to vCentre
                    //vCentre is average position of our group
                    vCentre.x += aiInFlock.position.x;
                    vCentre.y += aiInFlock.position.y;
                    vCentre.z += aiInFlock.position.z;

                    vCentre.Normalized();
                    //increase the group size by 1
                    //add this ai to the group size
                    groupSize++;

                    //how close we are allowed to be to another ship
                    //if less than 5, avoid the ship
                    if(distance < 40){
                        //console.log("AVOID SHIP");

                        vAvoid.x = vAvoid.x + (ai.position.x - aiInFlock.position.x);
                        vAvoid.y = vAvoid.y + (ai.position.y - aiInFlock.position.y);
                        vAvoid.z = vAvoid.z + (ai.position.z - aiInFlock.position.z);
                        vAvoid.Normalized();
                    }

                    gSpeed = gSpeed + aiInFlock.speed;
                }
            }
            //console.log("groupSize " + groupSize);
        });

        if(groupSize > 0)
        {
            let direction = new Vector3();

            vCentre.x = vCentre.x / groupSize + (targetPosition.x - ai.position.x);
            vCentre.y = vCentre.y / groupSize + (targetPosition.y - ai.position.y);
            vCentre.z = vCentre.z / groupSize + (targetPosition.z - ai.position.z);

            ai.speed = gSpeed / groupSize;
            //console.log("speed in groupsize: " + ai.speed);
            direction.x = (vCentre.x + vAvoid.x) + (targetPosition.x - ai.position.x);;
            direction.y = (vCentre.y + vAvoid.y) + (targetPosition.y - ai.position.y);;
            direction.z = (vCentre.z + vAvoid.z) + (targetPosition.z - ai.position.z);;
            direction = direction.Normalized();
            //console.log("direction in groupsize: " + JSON.stringify(direction));

            if((direction.x != 0) && (direction.y != 0) && (direction.z != 0))
            {
                ai.calculateRotationAndPitch(direction, ai);

                forwardDirection = ai.getForwardDirection();
            }
        }
    }
    
}