let AIBase = require('../AI/AIBase');
let Vector3 = require('../Vector3');
//var robustDot = require("robust-dot-product");

module.exports = class EnemyAI extends AIBase{
    constructor(){
        super();
        this.username = "ENEMY_AI";
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

        //AI stats
        this.rotation = 0;
        this.pitch = 0;
        this.roll = 0;
        //shooting
        this.canShoot = false;
        this.currentTime = Number(0);
        this.reloadTime = Number(Math.floor(Math.random() * (5 - 4)) + 4);

    }


    //onUpdate(onUpdatePosition, onUpdateRotation) {
        //Calculate Statemachine
        //console.log('AI_Update');
    //}


    onUpdate(onUpdateAI, fireBullet){
         let ai = this;

         //if the ai doesnt have a target, return
         if(!ai.hasTarget)
        {
            return;
        }

         //ai.target is the player
        let targetConnection = ai.target;
        let targetPosition = targetConnection.player.position;

        //get normalized diretion between tank and target
        let direction = new Vector3();
        direction.x = targetPosition.x - ai.position.x;
        direction.y = targetPosition.y - ai.position.y;
        direction.z = targetPosition.z - ai.position.z;
        direction = direction.Normalized();

        let distance = ai.position.Distance(targetPosition);

        let rotation = Math.atan2(direction.x, direction.z) * ai.radiansToDegrees();
        let pitch = -Math.asin(direction.y) * ai.radiansToDegrees();

        //angle_B = atan2( Dot(W0,U) / abs(W0), Dot(U0,U) / abs(U0) )
        let U0 =  new Vector3();
        let W0 = new Vector3();
        let Up = new Vector3();
        W0.x = -direction.y;
        W0.y = direction.x;
        W0.z = 0;
        U0.x = (W0.y * direction.z) - (W0.z * direction.y);
        U0.y = (W0.x * direction.z) - (W0.z * direction.x);
        U0.z = (W0.x * direction.y) - (W0.y * direction.x);
        Up.x = 0;
        Up.y = 1;
        Up.z = 0;

        //dot product is calcd like this:
        //dot = (a1 * b1) + (a2*b2) + (a3*b3)
        var number1 = (W0.x * Up.x) + (W0.y * Up.y) + (W0.z * Up.z);

        var number2 =  (U0.x * Up.x) + (U0.y * Up.y) + (U0.z * Up.z);
        //console.log("number1 : " + number1);
        let bank = Math.atan2(number1, number2);

        //console.log("bank : " + bank);
        if(isNaN(rotation) || isNaN(pitch)){
            return;
        }

        //console.log("node rotation of barrel " + rotation);

        //movement will based off of using the 
        //barrel rotation that points to the player
        let angleAmount = ai.getAngleDifference(ai.rotation, rotation);//direction we need the angle to rotate
        let angleStep = angleAmount * ai.rotationSpeed;//dont just snap but rotate towards
        ai.rotation = ai.rotation + angleStep; //Apply the angle step
        ai.rotation = rotation;
        ai.pitch = pitch;
        ai.roll = bank;
        // console.log("angleAmountn: " + angleAmount);
        // console.log("Rotation: " + rotation);
        // console.log("AI rotation: " + ai.rotation);
        let forwardDirection = ai.getForwardDirection();

        //console.log("AI distance: " + distance);



        //shooting
        if(ai.canShoot && ai.isDead == false){
            //console.log("AI - can shoot - AI id: " + ai.id);
            if((Math.floor(Math.random() * (100 - 0)) + 0) < (5)){
                fireBullet({
                    activator: ai.id,
                    position: ai.position.JSONData(),
                    direction:{
                        x: forwardDirection.x,
                        y: forwardDirection.y,
                        z: forwardDirection.z
                    }//: direction.JSONData()
                });
                //console.log("AI - cannot shoot - AI id: " + ai.id);
                ai.canShoot = false;
                ai.currentTime = Number(0);
            }
        }else{
            //count reload time
            //console.log("AI - can shoot - AI id: " + ai.id);
            ai.currentTime = Number(ai.currentTime) + Number(0.1);
            if(ai.currentTime >= ai.reloadTime){
                ai.canShoot = true;
            }
        }

        //if(Math.abs(distance) < 400){
            //console.log("Im in the position moving: " + distance);
            if((distance >= 46) && (distance <= 500) ){
                //console.log("Im in the position moving forward: " + distance);
                //apply position from forward direction
                //can adjust ai speed here as well
                ai.position.x = ai.position.x + 0/*forwardDirection.x*/ * 3//ai.speed;
                ai.position.y =  ai.position.y  + 0/*forwardDirection.y*/ * 3;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
                ai.position.z = ai.position.z + -1/*forwardDirection.z*/ * 3//ai.speed;
            }
            //move back
            else if(distance <= 45){
                ai.position.x = ai.position.x + 0/*forwardDirection.x*/ * 3//ai.speed;
                ai.position.y =  ai.position.y  + 0/*forwardDirection.y*/ * 3;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
                ai.position.z = ai.position.z + -1/*forwardDirection.z*/ * 3//ai.speed;
                //console.log("Im in the position moving back: " + distance);
                //apply position from forward direction
                //ai.position.x = ai.position.x - forwardDirection.x   * 3;
                //ai.position.y = ai.position.y - forwardDirection.y * 5;//targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
                //ai.position.z = ai.position.z - forwardDirection.z   * 3;
            }
       
        //}
        // else if(Math.abs(distance) >= 100){

        //     ai.position.x = ai.position.x + Math.cos(1 * 5) * ai.speed;
        //     ai.position.y = targetPosition.y; // ai.position.y  + forwardDirection.y * ai.speed;
        //     ai.position.z = ai.position.z - Math.sin(1 * 5) * ai.speed;
        // }


        //console.log("forwardDirection: " + JSON.stringify(forwardDirection));
        //console.log(ai.id + ':barrel(' + rotation + ') AI(' +  ai.rotation + ')');
        //console.log("ai.position.x " + ai.position.x );
        // onUpdateAI({
        //     id: ai.id,
        //     position: /* position: ai.position.JSONData(), */
        //     {
        //         //how to random generate values: Math.floor(Math.random() * (max - min)) + min
        //         x: ai.position.x,
        //         y: ai.position.y,
        //         z: ai.position.z
        //     },
        //     //barrelRotation: rotation,
        //     shipTiltRotation : bank,
        //     shipTiltRotationX : ai.pitch,
        //     shipTiltRotationY : ai.rotation
            
        // });
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
     }

    onObtainTarget(connections){
        let ai = this;
        let foundTarget = false;
        ai.target = undefined;

        //find the closest target and go after
        let availableTargets = connections.filter(connection =>{
            let player = connection.player;
            return ai.position.Distance(player.position) < 500;
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
        
        //follow player with world of (1,0,0)
        //return new Vector3((sin * tx) + (cos * tz), 0, (cos * tx) - (sin * tz));

        //with world set to (1,0,0) below makes the ai circle the player
        //with world set to (0,0,1) below makes the ai follow the player
        
        //console.log("WORLD UP: " + JSON.stringify(worldUpVector) + " RADIANSROTATION: " + JSON.stringify(radiansRotation) + " RADIANSPITCH: " + JSON.stringify(radiansPitch));

        return new Vector3((Math.sin(radiansRotation) * tz) + (Math.cos(radiansRotation) * tx), (Math.sin(radiansPitch) * -1) /* - (Math.cos(radiansPitch) * tz ) */, (Math.cos(radiansRotation) * tz) - (Math.sin(radiansRotation) * tx));


        //return new Vector3((sin * tz) + (cos * tx), 0, (cos * tx) - (sin * tz));
    }
    
}