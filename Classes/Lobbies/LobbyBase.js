let Connection = require('../Connection')
//let ServerItem = require('../Utility/ServerItem')
let Vector3 = require('../Vector3')
let AIBase = require('../AI/AIBase')
//let Asteroid1 = require('../AI/Asteroid1')
const util = require('util');

module.exports = class LobbyBase{
    constructor(id){
        this.id = id;
        this.connections = [];
        this.serverItems = [];
    }

    onUpdate() {       
        let lobby = this;
       
        

    }

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayPlayerInformation() + ' has entered the lobby (' + lobby.id + ')');

        lobby.connections.push(connection);

        player.lobby = lobby.id;
        connection.lobby = lobby;
    }

    onLeaveLobby(connection = Connection){
        let lobby = this;
        let player = connection.player;

        console.log('Player ' + player.displayPlayerInformation() + ' has left the lobby (' + lobby.id + ')');

        connection.lobby = undefined;

        let index = lobby.connections.indexOf(connection);
        if(index > -1) {
            lobby.connections.splice(index, 1);
        }
    }

    onServerSpawn(item = ServerItem, location = Vector3) {
        let lobby = this;
        let serverItems = lobby.serverItems;
        let connections = lobby.connections;
        let x;
        let y;
        let z;
       
        //Set item into the array
        serverItems.push(item);
        item.position = location;
        console.log(JSON.stringify('Spawning this gameObject: ' + item.username + ' ' + item.id));
         if(item.username == "ASTEROID_AI"){
          

    //             do
    //             {
    //                 //inner and outer radius of asteroid belt
    //                 let randomRadius = Math.random() * (3000 - (1500)) + (1500);//Random.Range(/*innerRadius*/5000, 7000/*outerRadius*/);
    //                 //console.log("randomRadius: " + randomRadius);
    //                 let randomRadian = Math.random() * ((2 * Math.PI) - (0)) + (0);//Random.Range(0, (2 * Mathf.PI));
    //                 //console.log("randomRadian: " + randomRadian);
    
    //                 //Math.floor(Math.random() * (600 - (-300))) + (-300);
    //                 //HEIGHT of the asteroid belt
    //                 y = Math.random() * ((/*heightOfBelt*/800 / 2) - (-/*heightOfBelt*/800 / 2)) + (-/*heightOfBelt*/800 / 2);//Random.Range(-(/*heightOfBelt*/100 / 2), (/*heightOfBelt*/100 / 2));
    //                 //console.log("randomRadian: " + y);
    
    //                 x = randomRadius * Math.cos(randomRadian);
    //                 //console.log("randomRadian: " + x);
    //                 z = randomRadius * Math.sin(randomRadian);
    //                 //console.log("randomRadian: " + z);
    //             }
    //             while ( isNaN(z) &&  isNaN(x));

    //             //translate cude to its new position
    //         let localPosition = new Vector3(x, y, z);
    //         //console.log("localPosition :" + JSON.stringify( localPosition, null, 2))


    //         //let worldOffset = new Vector3(1, 1, 1) * localPosition;

    //         let worldOffset = new Vector3();
    //         worldOffset.x = 1 * localPosition.x;
    //         worldOffset.y = 1 * localPosition.y;
    //         worldOffset.z = 1 * localPosition.z;
    //         //console.log("worldOffset :" + JSON.stringify( worldOffset, null, 2))

    //         //let worldPosition = new Vector3(6144, 7335, 4323) + worldOffset;
    //         let worldPosition = new Vector3();
    //          worldPosition.x = 2541 + worldOffset.x;
    //          worldPosition.y = 0 + worldOffset.y;
    //          worldPosition.z = 1856 + worldOffset.z; 
    //         //console.log("worldPosition :" + JSON.stringify( worldPosition, null, 2))

    //         //Set Position
    //         // item.position.x = Math.floor(Math.random() * (600 - (-300))) + (-300);
    //         // item.position.y = Math.floor(Math.random() * (100 - (-100))) + (-100);
    //         // item.position.z = 300;//Math.floor(Math.random() * (1000 - 100)) + 200;

    //         // item.direction.x = 0;//Math.floor(Math.random() * (1 - 0)) + 0;
    //         // item.direction.y = 0;//Math.floor(Math.random() * (1 - 0)) + 0;
    //         // item.direction.z = -1;
    //          //item.speed = Math.random() * (7 - 1) + 1;
            item.tumble = Math.floor(Math.random() * (20 - 0)) + 0;
            //scale of the asteroid
            item.scale.x = Math.random() * (50 - 3) + 3;
            item.scale.y = Math.random() * (50 - 3) + 3;
            item.scale.z = Math.random() * (50 - 3) + 3;

    //         // item.rotationX = 5;//Math.floor(Math.random() * (7 - .5)) + .5;
    //         // item.rotationY = 5;//Math.floor(Math.random() * (7 - .5)) + .5;
    //         // item.rotationZ = 5;//Math.floor(Math.random() * (7 - .5)) + .5;
    //         //Tell everyone in the room
            connections.forEach(connection => {
               
                 
    //                 //send the packet of data required to spawn an asteroid
    //                 //we will send its name, id, position, direction, speed 
    //                 //and new value: angular velocity
    //                 //the client will handle the movement 
    //                 //tp make it smooth and the asteroid gameobject will
    //                 //report its position back to the server
                    let Data = {
                        id: item.id,
                        name: item.username,
                        activator: 'Server',
                        position: item.position.JSONData(),
                        scale: {
                            x: item.scale.x,
                            y: item.scale.y,
                            z: item.scale.z
                        },
                        //speed: item.speed,
                        tumble: item.tumble,
                        // rotationX: item.rotationX,
                        // rotationY: item.rotationY,
                        // rotationZ: item.rotationZ
                    }


    //                 // let returnData = {
    //                 //     id: item.id,
    //                 //     name: item.username,
    //                 //     activator: 'Server',
    //                 //     position: {
    //                 //         //how to random generate values: Math.floor(Math.random() * (max - min)) + min
    //                 //         x: item.position.x,
    //                 //         y: item.position.y,
    //                 //         z: item.position.z
    //                 //     },
    //                 //     direction: {
    //                 //         x: item.direction.x,
    //                 //         y: item.direction.y,
    //                 //         z: item.direction.z
    //                 //     },
    //                 //     scale: {
    //                 //         x: item.scale.x,
    //                 //         y: item.scale.y,
    //                 //         z: item.scale.z
    //                 //     },
    //                 //     speed: item.speed,
    //                 //     tumble: item.tumble,
    //                 //     rotationX: item.rotationX,
    //                 //     rotationY: item.rotationY,
    //                 //     rotationZ: item.rotationZ
    //                 // }
    //                 //console.log("sendning asteroid belt to client.... " );
    //                 //console.log("position: " + returnData.position.x);
    //                 //console.log("position: " + util.inspect(returnData.position, false, null, true /* enable colors */));
    //                 //console.log("direction: " + util.inspect(returnData.direction, false, null, true /* enable colors */));
                     connection.socket.emit('serverSpawn', Data);
                
            });
    //         //comment
    //         //     connection.socket.emit('serverSpawn', {
    //         //         id: item.id,
    //         //         name: item.username,
    //         //         position: item.position.JSONData(),
    //         //         tumble: item.tumble,
    //         //         //speed: item.speed
    //         //     });
    //         // });
            //}
            
        }
        else{
            //Tell everyone in the room
            console.log(JSON.stringify(location))
            //item.position = location;
            connections.forEach(connection => {
                connection.socket.emit('serverSpawn', {
                    id: item.id,
                    name: item.username,
                    position: item.position.JSONData()
                });
            });
        }
    }

    

    onServerUnspawn(item = ServerItem) {
        let lobby = this;
        let connections = lobby.connections;

        //Remove item from array
        lobby.deleteServerItem(item);
        //Tell everyone in the room
        connections.forEach(connection => {
            connection.socket.emit('serverUnspawn', {
                id: item.id
            });
        });
    }

    deleteServerItem(item = ServerItem) {
        let lobby = this;
        let serverItems = lobby.serverItems;
        let index = serverItems.indexOf(item);

        //Remove our item out the array
        if (index > -1) {
            serverItems.splice(index, 1);
        }
    }
}