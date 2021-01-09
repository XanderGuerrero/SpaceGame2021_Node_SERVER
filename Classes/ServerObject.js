var shortID = require('shortid');
var Vector3 = require('./Vector3.js');

//base class for all server objects
//each onbject will at least have an
//id, name and position
module.exports = class ServerObject{

    constructor(){
        this.id = shortID.generate();
        this.name = 'ServerObject';
        this.position = new Vector3();
        this.collisionObjectsNetID = '';
        this.distance = new Number(0);
    }
}