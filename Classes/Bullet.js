var ServerObject = require('./ServerObject.js');
var vector3 = require('./Vector3.js');

module.exports = class Bullet extends ServerObject{
    constructor() {
        super();//go to the class you inherited from to see what runs first
        this.direction = new vector3();
        this.speed = 175;
        this.isDestoryed = false;
        this.activator = '';
    }

    onUpdate()
    {
        this.position.x += this.direction.x * this.speed;
        this.position.y += this.direction.y * this.speed;
        this.position.z += this.direction.z * this.speed;
        return this.isDestoryed;

    }
} 

