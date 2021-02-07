const AIBase = require('./AI/AIBase.js');
const EnemyAI = require('./AI/EnemyAI.js');
var ServerObject = require('./ServerObject.js');
var Vector3 = require('./Vector3.js');
var util = require('util');
let FlockAI = require('./AI/FlockAI');
const ServerItem = require('./Utility/ServerItem.js');

module.exports = class Missile extends ServerObject{
    constructor() {
        super();//go to the class you inherited from to see what runs first
        this.direction = new Vector3();
        this.speed = 25;
        this.isDestoryed = false;
        this.activator = '';
        this.target = new Vector3();
        this.hasTarget = false;
        this.targetId = '';
        this.rotation = 0;
        this.pitch =0;
    }

    onUpdate( UpdateMissileAI,connections,serverItems)
    {
        let missile = this;
        //let direction = new Vector3(0,0,1);
        let targetPosition = new Vector3();
        //let lobbyServerItems = aiFlockList;
        let aiFlockList = serverItems.filter(item => {return item instanceof FlockAI;});
        aiFlockList.forEach(ai => {
            if (ai.id == missile.targetId){
                targetPosition.x = ai.position.x;
                targetPosition.y = ai.position.y;
                targetPosition.z = ai.position.z;
            }
        });
        let forwardDirection = new Vector3(0,0,1);
        //console.log("HIIII: ");

        if(!missile.hasTarget)
        {
            console.log("returning: ");
            return;
        }

        //get normalized diretion between tank and target
        let direction = new Vector3();
        direction.x = targetPosition.x - missile.position.x;
        direction.y = targetPosition.y - missile.position.y;
        direction.z = targetPosition.z - missile.position.z;
        direction = direction.Normalized();

        let rotation = Math.atan2(direction.x, direction.z) * missile.radiansToDegrees();
        let pitch = -Math.asin(direction.y) * missile.radiansToDegrees();

        //angle_B = atan2( Dot(W0,U) / abs(W0), Dot(U0,U) / abs(U0)
        //cross product is cald like this:
        //Example: The cross product of a = (2,3,4) and b = (5,6,7)
        // cx = aybz − azby = 3×7 − 4×6 = −3
        // cy = azbx − axbz = 4×5 − 2×7 = 6
        // cz = axby − aybx = 2×6 − 3×5 = −3
        //Answer: a × b = (−3,6,−3)

        //dot product is calcd like this:
        // ie. a=(1,2,3) and b=(4,−5,6)
        //dot = (1 * 4) + (2 * (-5)) + (3 * 6)


        //console.log("bank : " + bank);
        if(isNaN(rotation) || isNaN(pitch)){
            return;
        }

        //console.log("node rotation of barrel " + rotation);

        //movement will based off of using the 
        //barrel rotation that points to the player
        // let angleAmount = missile.getAngleDifference(missile.rotation, rotation);//direction we need the angle to rotate
        // let angleStep = angleAmount * 0.1;//dont just snap but rotate towards
        // missile.rotation = missile.rotation + angleStep; //Apply the angle step
        missile.rotation = rotation;
        missile.pitch = pitch;

        forwardDirection = missile.getForwardDirection();

        

        missile.position.x = missile.position.x + direction.x * missile.speed;
        missile.position.y = missile.position.y + direction.y * missile.speed;
        missile.position.z = missile.position.z + direction.z * missile.speed;
    


        UpdateMissileAI({
            targetId:  missile.targetId,
            id: missile.id,
            position: {
                x: missile.position.x,
                y: missile.position.y,
                z: missile.position.z
            },
            direction: {
                x: direction.x,
                y: direction.y,
                z: direction.z
            },
            targetPosition: {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z
            },
            speed: missile.speed
        });

        return this.isDestoryed;

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
        angleAmount = ai.getAngleDifference(ai.pitch, pitch);//direction we need the angle to rotate
        angleStep = angleAmount * .1;//dont just snap but rotate towards
        ai.pitch = ai.pitch + angleStep;
        ai.pitch = pitch;
    }

    onObtainTarget(aiEnemyList){
        let ai = this;
        let foundTarget = false;
        ai.target = undefined;
       

        //find the closest target and go after
        let availableTargets = aiEnemyList.filter(ai =>{
            let enemyplayer = ai;
            return ai.position.Distance(enemyplayer.position) < 1000000;
        });

        //sort through to find the closest oppoent; perhaps in the future you can
        //expand that for lowest health
        availableTargets.sort((a,b) => {
            let aDistance = ai.position.Distance(a.position);
            let bDistance = ai.position.Distance(b.position);
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