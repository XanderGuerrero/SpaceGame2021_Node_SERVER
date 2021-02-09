let LobbyBase = require('./LobbyBase')
let GameLobbySettings = require('./GameLobbySettings')
let Connection = require('../Connection')
let Bullet = require('../Bullet')
let BulletExplosion = require('../BulletExplosion')
let LobbyState = require('../Utility/LobbyState')
let Vector3 = require('../Vector3')
let ServerItem = require('../Utility/ServerItem')
let AIBase = require('../AI/AIBase')
let Missile = require('../Missile')
// let Asteroid1 = require('../AI/Asteroid1')
let EnemyAI = require('../AI/EnemyAI')
let FlockAI = require('../AI/FlockAI')
var util = require('util')
const { debugPort } = require('process')

module.exports = class GameLobby extends LobbyBase {
    constructor(id, settings = GameLobbySettings){
        super(id);
        this.settings = settings;
        this.lobbyState = new LobbyState();
        this.bullets = [];
        this.bulletExplosions = [];
        this.missiles = [];
        this.switchExplosion = 0;
    }

    //called every cycle
    onUpdate(){
        super.onUpdate();

        let lobby = this;
        let serverItems = lobby.serverItems;
        //let serverItems = lobby.serverItems;

        //console.log('IN ONUPDATE OF LOBBY!!!!!!!!!!!!!!!!');
        //filter and get all AI from serverItems
        //let aiEnemyList = serverItems.filter(item => {return item instanceof FlockAI;});
        //let aiEnemyList = serverItems.filter(item => {return item instanceof AIBase;});
        // aiList.forEach(ai => {

        //     ai.onObtainTarget(lobby.connections)

        //     //Update each ai unity, passing in a function for those that need to update other connections
        //     ai.onUpdate(data => {
        //         lobby.connections.forEach(connection => {
        //             let socket = connection.socket;
        //             //console.log(JSON.stringify(data));
        //             socket.emit('UpdateAI', data);
        //         });
        //     },(data) =>{
        //         lobby.fireBullet(undefined, data, true);//passing undefined for the connection bc this is the ai
        //     }, serverItems);
        // });
        //console.log('IN ONUPDATE OF LOBBY!!!!!!!!!!!!!!!!');
        //filter and get all AI from serverItems
        // let aiList = serverItems.filter(item => {return item instanceof AIBase;});
        // aiList.forEach(ai => {

        //     ai.onObtainTarget(lobby.connections)

        //     //Update each ai unity, passing in a function for those that need to update other connections
        //     ai.onUpdate(data => {
        //         lobby.connections.forEach(connection => {
        //             let socket = connection.socket;
        //             //console.log(JSON.stringify(data));
        //             socket.emit('UpdateAI', data);
        //         });
        //     },(data) =>{
        //         lobby.fireBullet(undefined, data, true);//passing undefined for the connection bc this is the ai
        //     }, serverItems);
        // });


        //filter and get all AI from serverItems
        
        let aiFlockList = serverItems.filter(item => {return item instanceof FlockAI;});
        let aiList = aiFlockList;
        //console.log("HI");
        //console.log(util.inspect(aiFlockList));
        aiFlockList.forEach(ai => {

            ai.onObtainTarget(lobby.connections);

            //Update each ai unity, passing in a function for those that need to update other connections
            ai.onUpdate(data => {
                lobby.connections.forEach(connection => {
                    let socket = connection.socket;
                    //console.log(JSON.stringify(data));
                    socket.emit('updateAI_Rotation', data);                 
                });
            },(data) =>{
                lobby.connections.forEach(connection => {
                    let socket = connection.socket;
                    //console.log(JSON.stringify(data));
                    socket.emit('UpdateAI', data);                  
                });
            },(data) =>{
                lobby.fireBullet(undefined, data, true);//passing undefined for the connection bc this is the ai
            }, (aiList));
        });

        //  //filter and get all Asteroid1 from serverItems
        //  let asteroid1List = serverItems.filter(item => {return item instanceof Asteroid1;});
        //  //let aiList = serverItems.filter(item => {return item instanceof AIBase;});
        //  asteroid1List.forEach(ai => {
        //      //Update each ai unity, passing in a function for those that need to update other connections
        //      ai.onUpdate(data => {
        //          lobby.connections.forEach(connection => {
        //              //let socket = connection.socket;
        //              //console.log(JSON.stringify(data));
        //              //socket.emit('updatePosition', data);
        //          });
        //      }); 
        //  });

        //super.onUpdate();
        //update the bullets
        lobby.updateBullets();
        lobby.updateMissiles();
        //respawn dead players
        lobby.updateDeadPlayers();
    }


    canEnterLobby(connection = Connection){
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if( currentPlayerCount + 1 > maxPlayerCount){
            return false;
        }

        return true;
    }

    onEnterLobby(connection = Connection) {
        let lobby = this;
        let socket = connection.socket;

        super.onEnterLobby(connection);

        //lobby.addPlayer(connection);
        if (lobby.connections.length == lobby.settings.maxPlayers) {
            console.log('We have enough players we can start the game');
            lobby.lobbyState.currentState = lobby.lobbyState.GAME;
            lobby.onSpawnAllPlayersIntoGame();
            //lobby.onSpawnAIIntoGame();
            lobby.onSpawnFlockAIIntoGame();
            //lobby.onSpawnAsteroidsIntoGame();
        }


        //can pass in data here
        let returnData = {
            state: lobby.lobbyState.currentState
        };

        socket.emit('loadGame');
        socket.emit('lobbyUpdate', returnData);
        socket.broadcast.to(lobby.id).emit('lobbyUpdate', returnData);

        //Handle spawning any server spawned objects here
        //Example: loot, perhaps flying bullets etc
    }

    onLeaveLobby(connection = Connection) {
        let lobby = this;

        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);

        //Handle unspawning any server spawned objects here
        //Example: loot, perhaps flying bullets etc
        lobby.onUnspawnAllAIInGame(connection);
        //lobby.onUnspawnAllAsteroidsInGame(connection);
    }

    onSpawnAllPlayersIntoGame() {
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            lobby.addPlayer(connection);
        });
    }

    onSpawnAIIntoGame() {
        let lobby = this;
        let connections = lobby.connections;

        for (var i = 0; i < 20; i++) {
            
                //calculate a random x,y,z coordinate
                let X = Math.floor(Math.random() * (-100 - (100))) + (100);
                let Y = Math.floor(Math.random() * (-100 - (100))) + (100);
                let Z = Math.floor(Math.random() * (500 - (300))) + (300);
    
                connections.forEach(connection => {
                    //if the x,y,z values created above are not
                    //this players position
                    if((X == connection.player.position.x) 
                            && (Y == connection.player.position.y)
                                && (Z  == connection.player.position.z)){  
                                    //generate new coordinates
                                    X = connection.player.position.x + Math.floor(Math.random() * (-100 - (100))) + (100);
                                    Y = connection.player.position.y + Math.floor(Math.random() * (-100 - (100))) + (100);
                                    Z = connection.player.position.z + Math.floor(Math.random() * (500 - (300))) + (300);   
                    }
                });  
                //go through each players position
                //and check that we are not spawning at the 
                //same position as one of the players
                //call lobby base onserverspawn and send the object you want to create
                //and its position in the game
                //you can call this many times to create multiple objects
                lobby.onServerSpawn(new EnemyAI(), new Vector3(X, Y, Z));
            
            //call lobby base onserverspawn and send the object you want to create
            //and its position in the game
            //you can call this many times to create multiple objects
            //lobby.onServerSpawn(new EnemyAI(), new Vector3(Math.floor(Math.random() * (100 - 0)) + 0, Math.floor(Math.random() * (100 - 0)) + 0, 400));
        } 
        
    }

    
    onSpawnFlockAIIntoGame() {
    let lobby = this;
    let connections = lobby.connections;
    
        //go through all players and check their positions before
        //setting the enemies position to avoid spawning in the 
        //same spot as something else
        for (var i = 0; i < 150; i++) {

            //calculate a random x,y,z coordinate
            let X = Math.floor(Math.random() * (-500 - (-1500))) + (-1500);
            let Y = Math.floor(Math.random() * (-500 - (-1500))) + (-1500);
            let Z = Math.floor(Math.random() * (-500 - (-1500))) + (-1500);

            connections.forEach(connection => {
                //if the x,y,z values created above are not
                //this players position
                if((X == connection.player.position.x) 
                        && (Y == connection.player.position.y)
                            && (Z  == connection.player.position.z)){  
                                //generate new coordinates
                                X = connection.player.position.x + Math.floor(Math.random() * (-500 - (-1500))) + (-1500);
                                Y = connection.player.position.y + Math.floor(Math.random() * (-500 - (-1500))) + (-1500);
                                Z = connection.player.position.z + Math.floor(Math.random() * (-500 - (-1500))) + (-1500);    
                }
            });  
            //go through each players position
            //and check that we are not spawning at the 
            //same position as one of the players
            //call lobby base onserverspawn and send the object you want to create
            //and its position in the game
            //you can call this many times to create multiple objects
            lobby.onServerSpawn(new FlockAI(), new Vector3(X, Math.floor(Math.random() * (500 - (-500))) + (-500), Math.floor(Math.random() * (500 - (-500))) + (-500)));
        } 
        
    }

    onUnspawnAllAIInGame(connection = Connection) {
        let lobby = this;
        let serverItems = lobby.serverItems;

        //Remove all server items from the client, but still leave them in the server others
        serverItems.forEach(serverItem => {
            connection.socket.emit('serverUnspawn', {
                id: serverItem.id
            });
        });
    }


    onSpawnAsteroidsIntoGame() {
        let lobby = this;

        var min = Math.ceil(100);
        var max = Math.floor(200);
        //this.position = new Vector3(Math.floor(Math.random() * (max - min)) + min, 0, Math.floor(Math.random() * (max - min)) + min);

        for(var i = 0; i < 550; i++)
        {
            //var Asteroid_AI = new Asteroid1();
            //Asteroid_AI.position.x = 0;//Math.floor(Math.random() * (max - min)) + min;
            //Asteroid_AI.position.y = 0;//Math.floor(Math.random() * (max - min)) + min;
            //Asteroid_AI.position.z = 600;//Math.floor(Math.random() * (max - min)) + min;
            //new Vector3( Math.floor(Math.random() * (max - min)) + min,  Math.floor(Math.random() * (100 - (-100)) + (-20)), Math.floor(Math.random() * (1000 - 500)) + 500 );
            //console.log('asteroids position: X: ' + Asteroid_AI.position.x + '  Y:' + Asteroid_AI.position.y + ' Z:' + Asteroid_AI.position.z);
            lobby.onServerSpawn(new Asteroid1(), new Vector3(0,0,0));
        }
    }




    onUnspawnAllAsteroidsInGame(connection = Connection) {
        let lobby = this;
        let serverItems = lobby.serverItems;

        //Remove all server items from the client, but still leave them in the server others
        serverItems.forEach(serverItem => {
            connection.socket.emit('serverUnspawn', {
                id: serverItem.id
            });
        });
    }




    updateBullets(){
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        //go through all the bullets
        bullets.forEach(bullet => {
            //check if its destoryed by calling on update
            //it returns a bool
                let isDestroyed = bullet.onUpdate(connections);

                //if the bullet is destoryed
                if(isDestroyed){
                    //despawn the bullet
                    lobby.despawnBullet(bullet);
                }
                else{
                    /*var returnData = {
                    id: bullet.id,
                    position:{
                        x: bullet.position.x,
                        y: bullet.position.y,
                        z: bullet.position.z
                    } 
                }

                connections.forEach(connection =>{
                    connection.socket.emit('updatePosition', returnData);
                });*/
            }
        });

    }

    updateMissiles(){
        let lobby = this;
        let missiles = lobby.missiles;
        let connections = lobby.connections;
        let serverItems = lobby.serverItems;

        
        //go through all the bullets
        missiles.forEach(missile => {
            //missile.onObtainTarget(lobby.connections);
            //let aiEnemyList = serverItems.filter(item => {return item instanceof FlockAI;});
            //console.log(util.inspect(aiEnemyList));
            //missile.onObtainTarget(aiEnemyList);
   
            //check if its destoryed by calling on update
            //it returns a bool
                let isDestroyed = missile.onUpdate(data => {
                    lobby.connections.forEach(connection => {
                        let socket = connection.socket;
                        //console.log(JSON.stringify(data));
                        socket.emit('UpdateMissileAI', data);                 
                    });
                }, connections, serverItems)

                //if the bullet is destoryed
                if(isDestroyed){
                    //despawn the bullet
                    lobby.despawnMissile(missile);
                }
                else{
                    /*var returnData = {
                    id: bullet.id,
                    position:{
                        x: bullet.position.x,
                        y: bullet.position.y,
                        z: bullet.position.z
                    } 
                }

                connections.forEach(connection =>{
                    connection.socket.emit('updatePosition', returnData);
                });*/
            }
        });

    }

    //update players and server objects like ai
    updateDeadPlayers(){
        let lobby = this;
        let connections = lobby.connections;

        connections.forEach(connection => {
            let player = connection.player;

            if(player.isDead) {
                let isRespawn = player.respawnCounter();
                if(isRespawn) {
                    let socket = connection.socket;

                let returnData = {
                    id: player.id,
                    position: {
                        x: player.position.x,
                        y: player.position.y,
                        z: player.position.z
                    }
                }

                socket.emit('playerRespawn', returnData);
                socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);
            }
        }
        });

        let aiList = lobby.serverItems.filter(item => {return item instanceof /*ServerItem*/AIBase;});
        aiList.forEach(ai => {
            if(ai.isDead) {
  
                    let isRespawn = ai.respawnCounter();
                    if(isRespawn) {
                        let socket = connections[0].socket;
                        let returnData = {
                            id: ai.id,
                            position: {
                                x: ai.position.x,
                                y: ai.position.y,
                                z: ai.position.z
                            }
                        }

                        socket.emit('playerRespawn', returnData);
                        socket.broadcast.to(lobby.id).emit('playerRespawn', returnData);
                    }
                
            }
        });

        // let Asteroid1List = lobby.serverItems.filter(item => {return item instanceof Asteroid1/*AIBase*/;});
        // Asteroid1List.forEach(asteroid => {
        //     if(asteroid.isDead) {
        //         let isRespawn = asteroid.respawnCounter();
        //         if(isRespawn) {
        //             let socket = connections[0].socket;

        //             //Set Position
        //             //item.position = location;
        //             asteroid.position.x = Math.floor(Math.random() * (600 - (-300))) + (-300);
        //             asteroid.position.y = Math.floor(Math.random() * (100 - (-100))) + (-100);
        //             asteroid.position.z = Math.floor(Math.random() * (1000 - 100)) + 200;

        //             asteroid.direction.x = 0;//Math.floor(Math.random() * (1 - 0)) + 0;
        //             asteroid.direction.y = 0;//Math.floor(Math.random() * (1 - 0)) + 0;
        //             asteroid.direction.z = -1;
        //             asteroid.speed = Math.floor(Math.random() * (7 - 3)) + 3;
        //             asteroid.tumble = Math.floor(Math.random() * (7 - .5)) + .5;
        //             asteroid.scale.x = Math.floor(Math.random() * (25 - 10)) + 10;
        //             asteroid.scale.y = Math.floor(Math.random() * (25 - 10)) + 10;
        //             asteroid.scale.z = Math.floor(Math.random() * (15 - 5)) + 5;

        //             asteroid.rotationX = Math.floor(Math.random() * (7 - .5)) + .5;
        //             asteroid.rotationY = Math.floor(Math.random() * (7 - .5)) + .5;
        //             asteroid.rotationZ = Math.floor(Math.random() * (7 - .5)) + .5;

        //             let returnData = {
        //                 id: asteroid.id,
        //                 name: asteroid.username,
        //                 position: {
        //                     //how to random generate values: Math.floor(Math.random() * (max - min)) + min
        //                     x: asteroid.position.x,
        //                     y: asteroid.position.y,
        //                     z: asteroid.position.z
        //                 },
        //                 direction: {
        //                     x: asteroid.direction.x,
        //                     y: asteroid.direction.y,
        //                     z: asteroid.direction.z
        //                 },
        //                 scale: {
        //                     x: asteroid.scale.x,
        //                     y: asteroid.scale.y,
        //                     z: asteroid.scale.z
        //                 },
        //                 speed: asteroid.speed,
        //                 tumble: asteroid.tumble,
        //                 rotationX: asteroid.rotationX,
        //                 rotationY: asteroid.rotationY,
        //                 rotationZ: asteroid.rotationZ
                    
        //             }
        //             //console.log("return data : " + returnData);
        //             socket.emit('AsteroidRespawn', returnData);
        //             socket.broadcast.to(lobby.id).emit('AsteroidRespawn', returnData);
        //         }
        //     }
        // });
    }


    fireBullet(connection = Connection, data, isAI = false){
        let lobby = this;

        var bullet = new Bullet();
        bullet.name  = 'Bullet';
        bullet.activator = data.activator;
        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.position.z = data.position.z;

        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;
        bullet.direction.z = data.direction.z;

        lobby.bullets.push(bullet);

        var returnData = {
            name: bullet.name,
            id: bullet.id,
            activator: bullet.activator,
            position: {
                x: bullet.position.x,
                y: bullet.position.y,
                z: bullet.position.z
            },
            direction: {
                x: bullet.direction.x,
                y: bullet.direction.y,
                z: bullet.direction.z
            },
            speed: bullet.speed
        }

        if(!isAI){
            connection.socket.emit('serverSpawn', returnData);
            //only broadcast out to those in the same lobby as me
            connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
        }
        else if(lobby.connections.length > 0){
          
            lobby.connections[0].socket.emit('serverSpawn', returnData);  //to player 1
            lobby.connections[0].socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);//broadcast to everyone that the ai spawned a bullet
        }
    }


    fireMissile(connection = Connection, data, isAI = false){
        let lobby = this;

        console.log(JSON.stringify(data));
        var missile = new Missile();
        missile.name  = 'Missile';
        missile.activator = data.activator;
        //console.log("activator: " + data.activator);
        missile.position.x = data.position.x;
        missile.position.y = data.position.y;
        missile.position.z = data.position.z;
        missile.target.x = data.target.x;
        missile.target.y = data.target.y;
        missile.target.z = data.target.z;
        missile.targetId = data.targetId;
        console.log("target: " +  missile.target.x);
        missile.hasTarget = true;
        missile.direction.x = data.direction.x;
        missile.direction.y = data.direction.y;
        missile.direction.z = data.direction.z;

        lobby.missiles.push(missile);

        var returnData = {
            name: missile.name,
            id: missile.id,
            activator: missile.activator,
            position: {
                x: missile.position.x,
                y: missile.position.y,
                z: missile.position.z
            },
            direction: {
                x: missile.direction.x,
                y: missile.direction.y,
                z: missile.direction.z
            },
            target: {
                x: missile.target.x,
                y: missile.target.y,
                z: missile.target.z
            },
            speed: missile.speed, 
            targetId: missile.targetId
            
        }
        //console.log("fire Missile from fireMissile() - serverSpawn(): ");
        //console.log(!isAI);
        if(!isAI){
            connection.socket.emit('serverSpawn', returnData);
            //only broadcast out to those in the same lobby as me
            connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
            //console.log("1");
        }
        else if(lobby.connections.length > 0){
          
            lobby.connections[0].socket.emit('serverSpawn', returnData);  //to player 1
            lobby.connections[0].socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);//broadcast to everyone that the ai spawned a bullet
            //console.log("2");
        }
    }





    onAsteroidUpdateDirection(connection = Connection, data){
        let lobby = this;
        //might possibly return more than one item, this way we can avoid building extra data in memory
        let Asteroid1List = lobby.serverItems.filter(item => {return item instanceof Asteroid1/*AIBase*/;});

        Asteroid1List.forEach(asteroid => {
            //console.log(JSON.stringify("data.id: " + data.id + "and asteroid.id: " + asteroid.id))
            if (data.id == asteroid.id) {

                //update the position, direction and rotation
                //console.log('update the direction');
                asteroid.position.x = data.position.x;
                asteroid.position.y = data.position.y;
                asteroid.position.z = data.position.z;
                
                asteroid.direction.x = data.direction.x;
                asteroid.direction.y = data.direction.y;
                asteroid.direction.z = data.direction.z;
                // asteroid.rotationX = data.rotationX;
                // asteroid.rotationY = data.rotationY;
                // asteroid.rotationZ = data.rotationZ;
                //console.log(JSON.stringify(data))
                lobby.connections[0].socket.broadcast.to(lobby.id).emit('updateAsteroid', data);
                return;
            }
        });
        
    }




    onCollisionDestroy(connection = Connection, data){
        let lobby = this;
        //console.log(" in onCollisionDestroy event");
        let returnBullets = lobby.bullets.filter(bullet => {
            return bullet.id == data.id
        });

        returnBullets.forEach(bullet => {
            let playerHit = false;
            //console.log(" in onCollisionDestroy event");
            lobby.connections.forEach(c => {
                let player = c.player;

                if(bullet.activator != player.id) {
                    let distance = bullet.position.Distance(player.position);

                    //if(distance < 30) 
                    if (data.ObjCollidedWith == player.id){
                        let isDead = player.dealDamage(5);
                        if(isDead) {
                            console.log('Player with id: ' + player.id + ' has died at a distance of: ' + distance);
                            let returnData = {
                                id: player.id
                            }
                            c.socket.emit('playerDied', returnData);
                            c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            console.log('Player with id: ' + player.id + ' has (' + player.health + ') health left');
                        }
                        playerHit = true;
                        lobby.despawnBullet(bullet);
                    }
                }
                   //set up explosion data 
                //define the explosion
                var bulletExplosion = new BulletExplosion();
                bulletExplosion.name  = 'Player_Bullet_Explosion1';
                bulletExplosion.activator = bullet.activator;
                bulletExplosion.position.x = bullet.position.x;
                bulletExplosion.position.y = bullet.position.y;
                bulletExplosion.position.z = bullet.position.z;

                lobby.bulletExplosions.push(bulletExplosion);

                var returnExplosionData = {
                    name: bulletExplosion.name,
                    id: bulletExplosion.id,
                    activator: bulletExplosion.activator,
                    position: {
                        x: bulletExplosion.position.x,
                        y: bulletExplosion.position.y,
                        z: bulletExplosion.position.z
                    }
                }
                //console.log('Explosion TIME');
                //emit to yourself and everyone else

            connection.socket.emit('serverSpawnExplosion', returnExplosionData);
                //only broadcast out to those in the same lobby as me
            connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnExplosionData);
        });

        //if AI player is hit
        if (!playerHit) {
        let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase});
        aiList.forEach(ai => {
            if (bullet.activator != ai.id) {
                let distance = bullet.position.Distance(ai.position);
                //console.log('AI distance when hit: ' + distance);
                //console.log('AI ID from client: ' + data.collisionObjectsNetID);
                //console.log('Collided with something: ' + JSON.stringify(data));
                
                //if (data.distance == 0 && ai.id == data.collisionObjectsNetID) {
                    if (data.ObjCollidedWith == ai.id){  
                    // console.log('AI distance when hit from client: ' + data.distance );
                    // console.log('AI ID from server: ' + ai.id);
                    // console.log('AI ID from client: ' + data.collisionObjectsNetID);
                    // console.log('AI Name from client: ' + data.name);
                    //let isDead;
                    //console.log("data.name: " + data.name + ' ' + data.id);
                    // if(data.name == "FLOCK_AI"){
                    //     isDead = ai.dealDamage(50);
                    //     //console.log("LINE- 623 - isDEAD: " + isDead);
                    // }
                    // if(data.name == "Asteroid1"){
                    //     isDead = ai.dealDamage(100);
                    // }
                    // if(data.name == "Enemy_AI(Clone)"){
                    //     isDead = ai.dealDamage(25);
                    // }

                    let isDead = ai.dealDamage(25);
                    if (isDead) {
                        console.log('AI with id: ' + ai.id + ' has died at a distance of: ' + distance);
                        //console.log(data.name + ' has died');
                        let returnData = {
                            id: ai.id
                        }
                        lobby.connections[0].socket.emit('playerDied', returnData);
                        lobby.connections[0].socket.broadcast.to(lobby.id).emit('playerDied', returnData);

                        //set up explosion data 
                        //define the explosion
                        var bulletExplosion = new BulletExplosion();
                        bulletExplosion.name  = 'Object_Destoryed_Explosion';
                        bulletExplosion.activator = ai.activator;
                        //console.log('data.position.x: ' + data.position.x);
                        bulletExplosion.position.x = bullet.position.x;
                        bulletExplosion.position.y = bullet.position.y;
                        bulletExplosion.position.z = bullet.position.z;

                        lobby.bulletExplosions.push(bulletExplosion);

                        var returnExplosionData = {
                            name: bulletExplosion.name,
                            id: bulletExplosion.id,
                            activator: bulletExplosion.activator,
                            position: {
                                x: bulletExplosion.position.x,
                                y: bulletExplosion.position.y,
                                z: bulletExplosion.position.z
                            }
                        }
                        //console.log('Explosion TIME');
                        //emit to yourself and everyone else

                        connection.socket.emit('serverSpawnExplosion', returnExplosionData);
                        //only broadcast out to those in the same lobby as me
                        connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnExplosionData);    

                    } else {
                        console.log(data.name + ' with id: ' + ai.id + ' has (' + ai.health + ') health left');//******************************************
                    }
                }
                playerHit = true;
                lobby.despawnBullet(bullet);
            }});
        
        }

            if(!playerHit) {
                bullet.isDestroyed = true;
            }
            //lobby.despawnBullet(bullet);
        });        
    }

    missileCollisionDestroy(connection = Connection, data){
        let lobby = this;


        console.log(" in missileCollisionDestroy event");
        let returnMissiles = lobby.missiles.filter(missile => {
            return missile.id == data.id
        });

        returnMissiles.forEach(missile => {
            let playerHit = false;
            //console.log(" in onCollisionDestroy event");
            lobby.connections.forEach(c => {
                let player = c.player;

                if(missile.activator != player.id) {
                    let distance = missile.position.Distance(player.position);

                    //if(distance < 30) 
                    if (data.ObjCollidedWith == player.id){
                        let isDead = player.dealDamage(100);
                        if(isDead) {
                            console.log('Player with id: ' + player.id + ' has died at a distance of: ' + distance);
                            let returnData = {
                                id: player.id
                            }
                            c.socket.emit('playerDied', returnData);
                            c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            console.log('Player with id: ' + player.id + ' has (' + player.health + ') health left');
                        }
                        playerHit = true;
                        lobby.despawnMissile(missile);
                    }
                }
                   //set up explosion data 
                //define the explosion
                var bulletExplosion = new BulletExplosion();
                if(this.switchExplosion == 0){
                    bulletExplosion.name  = 'Object_Destoryed_Explosion';
                    this.switchExplosion = 1;
                    console.log("Explosion1");
                }
                else{
                    bulletExplosion.name  = 'Object_Destoryed_Explosion2';
                    this.switchExplosion = 0;
                    console.log("Explosion2");
                }
                bulletExplosion.activator = missile.activator;
                bulletExplosion.position.x = missile.position.x;
                bulletExplosion.position.y = missile.position.y;
                bulletExplosion.position.z = missile.position.z;

                lobby.bulletExplosions.push(bulletExplosion);

                var returnExplosionData = {
                    name: bulletExplosion.name,
                    id: bulletExplosion.id,
                    activator: bulletExplosion.activator,
                    position: {
                        x: bulletExplosion.position.x,
                        y: bulletExplosion.position.y,
                        z: bulletExplosion.position.z
                    }
                }
                //console.log('Explosion TIME');
                //emit to yourself and everyone else

            connection.socket.emit('serverSpawnExplosion', returnExplosionData);
                //only broadcast out to those in the same lobby as me
            connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnExplosionData);
        });

        //if AI player is hit
        if (!playerHit) {
        let aiList = lobby.serverItems.filter(item => {return item instanceof AIBase});
        aiList.forEach(ai => {
            if (missile.activator != ai.id) {
                let distance = missile.position.Distance(ai.position);
                //console.log('AI distance when hit: ' + distance);
                //console.log('AI ID from client: ' + data.collisionObjectsNetID);
                //console.log('Collided with something: ' + JSON.stringify(data));
                
                //if (data.distance == 0 && ai.id == data.collisionObjectsNetID) {
                    if (data.ObjCollidedWith == ai.id){  
                    // console.log('AI distance when hit from client: ' + data.distance );
                    // console.log('AI ID from server: ' + ai.id);
                    // console.log('AI ID from client: ' + data.collisionObjectsNetID);
                    // console.log('AI Name from client: ' + data.name);
                    //let isDead;
                    //console.log("data.name: " + data.name + ' ' + data.id);
                    // if(data.name == "FLOCK_AI"){
                    //     isDead = ai.dealDamage(50);
                    //     //console.log("LINE- 623 - isDEAD: " + isDead);
                    // }
                    // if(data.name == "Asteroid1"){
                    //     isDead = ai.dealDamage(100);
                    // }
                    // if(data.name == "Enemy_AI(Clone)"){
                    //     isDead = ai.dealDamage(25);
                    // }

                    let isDead = ai.dealDamage(100);
                    if (isDead) {
                        //console.log('AI with id: ' + ai.id + ' has died at a distance of: ' + distance);
                        //console.log(data.name + ' has died');
                        let returnData = {
                            id: ai.id
                        }
                        lobby.connections[0].socket.emit('playerDied', returnData);
                        lobby.connections[0].socket.broadcast.to(lobby.id).emit('playerDied', returnData);

                        //set up explosion data 
                        //define the explosion
                        var bulletExplosion = new BulletExplosion();
                        bulletExplosion.name  = 'Object_Destoryed_Explosion';
                        bulletExplosion.activator = ai.activator;
                        //console.log('data.position.x: ' + data.position.x);
                        bulletExplosion.position.x = missile.position.x;
                        bulletExplosion.position.y = missile.position.y;
                        bulletExplosion.position.z = missile.position.z;

                        lobby.bulletExplosions.push(bulletExplosion);

                        var returnExplosionData = {
                            name: bulletExplosion.name,
                            id: bulletExplosion.id,
                            activator: bulletExplosion.activator,
                            position: {
                                x: bulletExplosion.position.x,
                                y: bulletExplosion.position.y,
                                z: bulletExplosion.position.z
                            }
                        }
                        //console.log('Explosion TIME');
                        //emit to yourself and everyone else

                        connection.socket.emit('serverSpawnExplosion', returnExplosionData);
                        //only broadcast out to those in the same lobby as me
                        connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnExplosionData);    

                    } else {
                        //console.log(data.name + ' with id: ' + ai.id + ' has (' + ai.health + ') health left');//******************************************
                    }
                }
                playerHit = true;
                lobby.despawnMissile(missile);
            }});
        
        }

            if(!playerHit) {
                missile.isDestroyed = true;
            }
            //lobby.despawnBullet(bullet);
        });        
    }
         
    

    despawnMissile(missile = Missile) {
        let lobby = this;
        let missiles = lobby.missiles;
        let connections = lobby.connections;

        //console.log('Destroying missile (' + missile.id + ')');
        var index = missiles.indexOf(missile);
        if(index > -1) {
            missiles.splice(index, 1);

            var returnData = {
                id: missiles.id
            }

            //Send remove bullet command to players
            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });
        }
    }

    despawnBullet(bullet = Bullet) {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        //console.log('Destroying bullet (' + bullet.id + ')');
        var index = bullets.indexOf(bullet);
        if(index > -1) {
            bullets.splice(index, 1);

            var returnData = {
                id: bullet.id
            }

            //Send remove bullet command to players
            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });
        }
    }

    
    // despawnMissile(missile = Missile) {
    //     let lobby = this;
    //     let missiles = lobby.missiles;
    //     let connections = lobby.connections;

    //     //console.log('Destroying bullet (' + bullet.id + ')');
    //     var index = missiles.indexOf(missile);
    //     if(index > -1) {
    //         missiles.splice(index, 1);

    //         var returnData = {
    //             id: missile.id
    //         }

    //         //Send remove bullet command to players
    //         connections.forEach(connection => {
    //             connection.socket.emit('serverUnspawn', returnData);
    //         });
    //     }
    // }
        //         //let returns multiple items
        //         //check to see if this object exists on the server
        //         //returns 1 if true and the object it matches with data.id
        //         let returnBullets = bullets.filter(bullet => {
        
        //             return bullet.id == data.id
        //         });
        
        //         //we weill most;y only have one entry but just incase loop through all
        //         //and set to destroy
        
        //         returnBullets.forEach(bullet => {
        //             let playerHit = false;
        
        //             //check if I hit someone that is not me
        //             //for each player id in players
        //             for(var playerID in players)
        //             {
        //                  //if the player that shot the bullet does not have this PlayerID
        //                 if(bullet.activator != playerID)
        //                 {
        //                     //get the instance of this player from the players array
        //                     let player = players[playerID];
        //                     //calculate the distance between the player and the bullet
        //                     let distance = bullet.position.Distance(player.position);
        //                     //print the distance to the screen
        //                     //console.log('distance: ' + distance);
        //                     //if the distance is less than one
        //                     //we hit someone
        //                     if(distance < 20) {
        //                     playerHit = true;
        //                     let isDead = player.dealDamage(50);
        //             //             console.log('dealDamage');
        //                         if(isDead)
        //                         {
        //                             console.log('player with id : ' + player.id + ' has died');
        //                              let returnData = {
        //                                 id: player.id
        //                             }
        //                             sockets[playerID].emit('playerDied', returnData);
        //                             sockets[playerID].broadcast.emit('playerDied', returnData);
        //                         }
        //                         else
        //                         {
        //                             console.log('player with id: ' + player.id + ' has (' + player.health + ') health left');
        //                         }
        //                         despawnBullet(bullet);
        //                      }
        //                 }
        //             }
        //             if(!playerHit)
        //             {
        //                 bullet.isDestoryed = true;
        //             }
        
        //         });
        //     });
        // });
//}
//         let lobby = this;

//         let returnBullets = lobby.bullets.filter(bullet => {
//             //return the bullet with the id that we got from the packet
//             return bullet.id == data.id
//         });
//         //console.log('Collided with something: ' + JSON.stringify(data));

//             returnBullets.forEach(bullet => {
// //             let playerHit = false;

// //             //check if I hit someone that is not me
// //             //for each player id in players
// //             for(var playerID in players)
// //             {
// //                  //if the player that shot the bullet does not have this PlayerID
// //                 if(bullet.activator != playerID)
// //                 {
// //                     //get the instance of this player from the players array
// //                     let player = players[playerID];
// //                     //calculate the distance between the player and the bullet
// //                     let distance = bullet.position.Distance(player.position);
// //                     //print the distance to the screen
// //                     //console.log('distance: ' + distance);
// //                     //if the distance is less than one
// //                     //we hit someone
// //                     if(distance < 20) {
// //                     playerHit = true;
// //                     let isDead = player.dealDamage(50);
// //             //             console.log('dealDamage');
// //                         if(isDead)
// //                         {
// //                             console.log('player with id : ' + player.id + ' has died');
// //                              let returnData = {
// //                                 id: player.id
// //                             }
// //                             sockets[playerID].emit('playerDied', returnData);
// //                             sockets[playerID].broadcast.emit('playerDied', returnData);
// //                         }
// //                         else
// //                         {
// //                             console.log('player with id: ' + player.id + ' has (' + player.health + ') health left');
// //                         }
// //                         despawnBullet(bullet);
// //                      }
// //                 }
// //             }
// //             if(!playerHit)
// //             {
// //                 bullet.isDestoryed = true;
// //             }
//         //we weill most;y only have one entry but just incase loop through all
//         //and set to destroy
//         // lobby.connections.forEach(c => {
//         //     //and get the player info
//         //     let player = c.player;

//         //     //let asteroidList = lobby.serverItems.filter(item => {return item instanceof ServerItem/*AIBase*/;});

//         //     //asteroidList.forEach(asteroid => {      
//         //     //if the player that shot the bullet does not have this PlayerID
//         //         let playerHit = false;

//        /*        check if the asteroid hit the player || the player ran into the asteroid
//         //         if(asteroid.id == data.id)
//         //         {
//         //             //get the instance of this player from the players array
//         //             //calculate the distance between the player and the bullet
//         //             //let distance = bullet.position.Distance(player.position);
//         //             //print the distance to the screen
//         //             //console.log('distance: ' + data.distance);
//         //             //console.log('Object we collided withs id: ' + data.collisionObjectsNetID);
//         //             //console.log('player.id on server: ' + player.id);
//         //             //if the distance is less than one unit between the 
//         //             //bullet and the gameobject that was collided with,
//         //             //we hit someone
//         //             if(data.distance == 0 && player.id == data.collisionObjectsNetID) {
//         //                 //playerHit = true;

//         //                 //deal the health damage to the player
//         //                 let isDead = player.dealDamage(100);
//         //                 //console.log('dealDamage');
//         //                 //console.log('isDead: ' + isDead);
//         //                 //if the player is dead
//         //                 if(isDead) {
//         //                     //console.log('Player with id: ' + player.id + ' has died');
//         //                     let returnData = {
//         //                         id: player.id
//         //                     }
//         //                     c.socket.emit('playerDied', returnData);
//         //                     c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);

//         //                     //set up explosion data 
//         //                     //define the explosion
//         //                     var bulletExplosion = new BulletExplosion();
//         //                     bulletExplosion.name  = 'Explosion1';
//         //                     bulletExplosion.activator = player.activator;
//         //                     bulletExplosion.position.x = player.position.x;
//         //                     bulletExplosion.position.y = player.position.y;
//         //                     bulletExplosion.position.z = player.position.z;

//         //                     lobby.bulletExplosions.push(bulletExplosion);

//         //                     var returnExplosionData = {
//         //                         name: bulletExplosion.name,
//         //                         id: bulletExplosion.id,
//         //                         activator: bulletExplosion.activator,
//         //                         position: {
//         //                             x: bulletExplosion.position.x,
//         //                             y: bulletExplosion.position.y,
//         //                             z: bulletExplosion.position.z
//         //                         }
//         //                     }
//         //                     //console.log('Explosion TIME');
//         //                     //emit to yourself and everyone else

//         //                     connection.socket.emit('serverSpawnExplosion', returnExplosionData);
//         //                     //only broadcast out to those in the same lobby as me
//         //                     connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnExplosionData);    

//         //                 }else{
//         //                     //console.log('player with id: ' + player.id + ' has (' + player.health + ') health left');
//         //                 }
//         //                 playerHit = true;
//         //                 //lobby.despawnBullet(asteroid);
//         //             }
                    
//         //         }

//         //     });

//          });*/

//         returnBullets.forEach(bullet => {
//             let playerHit = false;

//             //check if I hit someone that is not me
//             //for each player id in players

//             //go through the list of connections 
//             lobby.connections.forEach(c => {
//                 //and get the player info
//                 // let player = c.player;
//                 // //console.log('LINE 533 - Collided with something: ' + JSON.stringify(data));
//                 // //if the player that shot the bullet does not have this PlayerID
//                 // //if the player that activated the bullet is not this connections' player
//                 // if(bullet.activator != player.id) {
                    
//                 //     //calculate the distance
//                 //     //let distance = bullet.position.Distance(player.position);

//                 //     //get the instance of this player from the players array
//                 //     //calculate the distance between the player and the bullet
//                 //     //let distance = bullet.position.Distance(player.position);
//                 //     //print the distance to the screen
//                 //     //console.log('distance: ' + data.distance);
//                 //     //console.log('Object we collided withs id: ' + data.collisionObjectsNetID);
//                 //     //console.log('player.id on server: ' + player.id);
//                 //     //if the distance is less than one unit between the 
//                 //     //bullet and the gameobject that was collided with,
//                 //     //we hit someone
//                 //     if(data.distance == 0 && player.id == data.collisionObjectsNetID) {
//                 //         //playerHit = true;

//                 //         //deal the health damage to the player
//                 //         let isDead = player.dealDamage(50);
//                 //         //console.log('dealDamage');
//                 //         //console.log('LINE - 553 - isDead: ' + isDead + ' Health: ' + player.health);
//                 //         //if the player is dead
//                 //         if(isDead) {
//                 //             //console.log('Player with id: ' + player.id + ' has died');
//                 //             let returnData = {
//                 //                 id: player.id
//                 //             }
//                 //             c.socket.emit('playerDied', returnData);
//                 //             c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);

//                 //             //set up explosion data 
//                 //             //define the explosion
//                 //             var bulletExplosion = new BulletExplosion();
//                 //             bulletExplosion.name  = 'Explosion1';
//                 //             bulletExplosion.activator = player.activator;
//                 //             bulletExplosion.position.x = player.position.x;
//                 //             bulletExplosion.position.y = player.position.y;
//                 //             bulletExplosion.position.z = player.position.z;

//                 //             lobby.bulletExplosions.push(bulletExplosion);

//                 //             var returnExplosionData = {
//                 //                 name: bulletExplosion.name,
//                 //                 id: bulletExplosion.id,
//                 //                 activator: bulletExplosion.activator,
//                 //                 position: {
//                 //                     x: bulletExplosion.position.x,
//                 //                     y: bulletExplosion.position.y,
//                 //                     z: bulletExplosion.position.z
//                 //                 }
//                 //             }
//                 //             //console.log('Explosion TIME');
//                 //             //emit to yourself and everyone else

//                 //             connection.socket.emit('serverSpawnExplosion', returnExplosionData);
//                 //             //only broadcast out to those in the same lobby as me
//                 //             connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnExplosionData);    

//                 //         }
//                 //         else
//                 //         {
//                 //             //console.log('player with id: ' + player.id + ' has (' + player.health + ') health left');
//                 //         }
//                 //         playerHit = true;                       
//                 //     }
                    
//                 }
//             //finally destroy the bullet
//             lobby.despawnBullet(bullet);
//             });
//             //if player is hit
//             if (!playerHit) {
//                 let aiList = lobby.serverItems.filter(item => {return item instanceof ServerItem/*AIBase*/;});

//                 aiList.forEach(ai => {
//                     if (bullet.activator != ai.id) {
//                         let distance = bullet.position.Distance(ai.position);
//                         //console.log('AI distance when hit: ' + distance);
//                         //console.log('AI ID from client: ' + data.collisionObjectsNetID);
//                         //console.log('Collided with something: ' + JSON.stringify(data));
                        
//                         if (data.distance == 0 && ai.id == data.collisionObjectsNetID) {
                            
//                             // console.log('AI distance when hit from client: ' + data.distance );
//                             // console.log('AI ID from server: ' + ai.id);
//                             // console.log('AI ID from client: ' + data.collisionObjectsNetID);
//                             // console.log('AI Name from client: ' + data.name);
//                             let isDead;
//                             //console.log("data.name " + data.name + ' ' + data.id);
//                             if(data.name == "FLOCK_AI"){
//                                 isDead = ai.dealDamage(50);
//                                 //console.log("LINE- 623 - isDEAD: " + isDead);
//                             }
//                             if(data.name == "Asteroid1"){
//                                 isDead = ai.dealDamage(100);
//                             }
//                             //let isDead = ai.dealDamage(50);
//                             if (isDead) {
//                                 //console.log(data.name + ' has died');
//                                 let returnData = {
//                                     id: ai.id
//                                 }
//                                 lobby.connections[0].socket.emit('playerDied', returnData);
//                                 lobby.connections[0].socket.broadcast.to(lobby.id).emit('playerDied', returnData);

//                                 //set up explosion data 
//                                 //define the explosion
//                                 var bulletExplosion = new BulletExplosion();
//                                 bulletExplosion.name  = 'Explosion1';
//                                 bulletExplosion.activator = ai.activator;
//                                 //console.log('data.position.x: ' + data.position.x);
//                                 bulletExplosion.position.x = data.position.x;
//                                 bulletExplosion.position.y = data.position.y;
//                                 bulletExplosion.position.z = data.position.z;

//                                 lobby.bulletExplosions.push(bulletExplosion);

//                                 var returnExplosionData = {
//                                     name: bulletExplosion.name,
//                                     id: bulletExplosion.id,
//                                     activator: bulletExplosion.activator,
//                                     position: {
//                                         x: bulletExplosion.position.x,
//                                         y: bulletExplosion.position.y,
//                                         z: bulletExplosion.position.z
//                                     }
//                                 }
//                                 //console.log('Explosion TIME');
//                                 //emit to yourself and everyone else

//                                 connection.socket.emit('serverSpawnExplosion', returnExplosionData);
//                                 //only broadcast out to those in the same lobby as me
//                                 connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnExplosionData);    

//                             } else {
//                                 //console.log(data.name + ' with id: ' + ai.id + ' has (' + ai.health + ') health left');
//                             }
//                         }
//                         playerHit = true;
//                         lobby.despawnBullet(bullet);
//                     }
//                 });
//             }
//             if(!playerHit)
//             {
//                 bullet.isDestoryed = true;
//             }
//                 //if the player that shot the bullet does not have this PlayerID
//         }); 
//     }





    addPlayer(connection = Connection) {
        let lobby = this;
        let connections = lobby.connections;
        let socket = connection.socket;

        var returnData = {
            id: connection.player.id
        }

        socket.emit('spawn', returnData); //tell myself I have spawned
        //socket.broadcast.to(lobby.id).emit('spawn', returnData); // Tell others

        //Tell myself about everyone else already in the lobby
        connections.forEach(c => {
            if(c.player.id != connection.player.id) {
                socket.emit('spawn', {
                    id: c.player.id
                });
            }
        });
    }

    removePlayer(connection = Connection) {
        let lobby = this;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id: connection.player.id
        });
    }


    MissileDestroy(connection = Connection, data){
        let lobby = this;

        let returnMissiles = lobby.missiles.filter(missile => {

            return missile.id == data.activator
        });

       // console.log('Explosion TIME 1');
        //we weill most;y only have one entry but just incase loop through all
        //and set to destroy
                  //we weill most;y only have one entry but just incase loop through all
        //and set to destroy
        returnMissiles.forEach(missile => {
            let playerHit = false;
            lobby.despawnMissile(missile);
        });


        //define the explosion
        var bulletExplosion = new BulletExplosion();
        bulletExplosion.name  = 'Explosion1';
        bulletExplosion.activator = data.activator;
        bulletExplosion.position.x = data.position.x;
        bulletExplosion.position.y = data.position.y;
        bulletExplosion.position.z = data.position.z;

        lobby.bulletExplosions.push(bulletExplosion);

        var returnData = {
            name: bulletExplosion.name,
            id: bulletExplosion.id,
            activator: bulletExplosion.activator,
            position: {
                x: bulletExplosion.position.x,
                y: bulletExplosion.position.y,
                z: bulletExplosion.position.z
            }
        }
                //console.log('Explosion TIME');


        connection.socket.emit('serverSpawnExplosion', returnData);
        //only broadcast out to those in the same lobby as me
        connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnData);
    }

    BulletDestory(connection = Connection, data){
        let lobby = this;

        let returnBullets = lobby.bullets.filter(bullet => {

            return bullet.id == data.activator
        });


        //we weill most;y only have one entry but just incase loop through all
        //and set to destroy
                  //we weill most;y only have one entry but just incase loop through all
        //and set to destroy
        returnBullets.forEach(bullet => {
            let playerHit = false;
            lobby.despawnBullet(bullet);
        });


        //define the explosion
        var bulletExplosion = new BulletExplosion();
        bulletExplosion.name  = 'Explosion1';
        bulletExplosion.activator = data.activator;
        bulletExplosion.position.x = data.position.x;
        bulletExplosion.position.y = data.position.y;
        bulletExplosion.position.z = data.position.z;

        lobby.bulletExplosions.push(bulletExplosion);

        var returnData = {
            name: bulletExplosion.name,
            id: bulletExplosion.id,
            activator: bulletExplosion.activator,
            position: {
                x: bulletExplosion.position.x,
                y: bulletExplosion.position.y,
                z: bulletExplosion.position.z
            }
        }
        //console.log('Explosion TIME');


        connection.socket.emit('serverSpawnExplosion', returnData);
        //only broadcast out to those in the same lobby as me
        connection.socket.broadcast.to(lobby.id).emit('serverSpawnExplosion', returnData);
    }


    DestroyExplosion(connection = Connection, data){
        let lobby = this;

        let returnExplosions = lobby.bulletExplosions.filter(bulletExplosion => {

            return bulletExplosion.id == data.id
        });

        //we weill most;y only have one entry but just incase loop through all
        //and set to destroy
        //hi
        returnExplosions.forEach(bulletExplosion => {
            //let playerHit = false;
            lobby.despawnExplosion(bulletExplosion);
        });
    }

    despawnExplosion(bulletExplosion = BulletExplosion) {
        let lobby = this;
        let bulletExplosions = lobby.bulletExplosions;
        let connections = lobby.connections;

        //console.log('Destroying Explosion (' + bulletExplosion.id + ')');
        var index = bulletExplosions.indexOf(bulletExplosion);
        if(index > -1) {
            bulletExplosions.splice(index, 1);

            var returnData = {
                id: bulletExplosion.id
            }

            //Send remove bullet command to players
            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });
        }
    }

    despawnBullet(bullet = Bullet, Missile) {
        let lobby = this;
        let bullets = lobby.bullets;
        let connections = lobby.connections;

        //console.log('Destroying bullet (' + bullet.id + ')');
        var index = bullets.indexOf(bullet);
        if(index > -1) {
            bullets.splice(index, 1);

            var returnData = {
                id: bullet.id
            }

            //Send remove bullet command to players
            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });
        }
    }



    serverSpawnExplosion(connection = Connection, data){
        let lobby = this;

        var explosion = new BulletExplosion();
        explosion.name  = 'Explosion1';
        explosion.activator = data.activator;
        explosion.position.x = data.position.x;
        explosion.position.y = data.position.y;
        explosion.position.z = data.position.z;

        //
        lobby.bulletExplosions.push(explosion);

        //must send back name, id and position minimum
        var returnData = {
            name: explosion.name,
            id: explosion.id,
            activator: explosion.activator,
            position: {
                x: explosion.position.x,
                y: explosion.position.y,
                z: explosion.position.z
            }
        }
        //console.log('Explosion TIME');
        connection.socket.emit('serverSpawn', returnData);
        //only broadcast out to those in the same lobby as me
        connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);
    }
}