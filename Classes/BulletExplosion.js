var ServerObject = require('./ServerObject.js');
var vector3 = require('./Vector3.js');


module.exports = class BulletExplosion extends ServerObject{
    constructor() {
        super();
        this.direction = new vector3();
        this.isDestoryed = false;
        this.activator = '';
    }


    //function to handle what this obeject does
    //will return true or false if based on if it is destroyed
    onUpdate()
    {
        this.position.x += this.direction.x;
        this.position.y += this.direction.y;
        this.position.z += this.direction.z;
        return this.isDestoryed;

    }
} 