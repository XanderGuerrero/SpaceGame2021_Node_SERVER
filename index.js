var io = require('socket.io')(process.env.PORT || 52300);//use socket.io and use the defined port otherwise use 52300
let Server = require('./Classes/Server');

console.log('Server has started');

let server = new Server();

setInterval(() => {
    server.onUpdate();
}, 100,0);



//feed into the server and give back a connection saying someone has connected
//this connection will create all the events ("firebullt, disconnect, this.connection etc....")
//then emit back to the client the register event to sign back into the game
io.on('connection', function(socket) {
    let connection = server.onConnected(socket);
    connection.createEvents();
    console.log('Emit register');
    connection.socket.emit('register', {'id': connection.player.id});
});


//custom classes
// var Player = require('./Classes/Player.js');
// var Bullet = require('./Classes/Bullet.js');
// //will be storing players and sockets into arrays here
// var players = [];
// var sockets = [];
// var bullets = [];

// //updates
// setInterval(() => {
//     bullets.forEach(bullet => {
//         var isDestoryed = bullet.onUpdate();
   
//         if(isDestoryed){
//             despawnBullet(bullet);
//        }
//        else
//        {
//            var returnData = {
//                id: bullet.id,
//                position:{
//                    x: bullet.position.x,
//                    y: bullet.position.y,
//                    z: bullet.position.z
//                }     
//            }
//            //console.log('Hi ---  ReturnData x, y, z position: !' + bullet.position.z);
//            for(var playerID in players)
//            {
//                sockets[playerID].emit('updatePosition', returnData);
//            }
//        }
//     });
    
//         //handle dead players
//     for(var playerID in players)
//     {
//         let player =  players[playerID];
        
//         if(player.isDead){
//             let isRespawn = player.respawnCounter();

//             if(isRespawn){
//                 let returnData = {
//                     id: player.id,
//                     position: {
//                         x: player.position.x,
//                         y: player.position.y,
//                         z: player.position.z
//                     }
//                 }

//                 sockets[playerID].emit('playerRespawn', returnData);
//                 sockets[playerID].broadcast.emit('playerRespawn', returnData);
//             }
//         }
        
//     }
//    }, 100,0);


// function despawnBullet(bullet = Bullet){
//     console.log('Destroying Bullet : ' + bullet.id);
//     var index = bullets.indexOf(bullet);
//     if(index > -1){
//         bullets.splice(index, 1);

//         var returnData = {
//            id: bullet.id     
//         }

//        for(var playerID in players)
//        {
//            sockets[playerID].emit('serverUnspawn', returnData);
//        }

//     }
// }
   

// console.log('The Server has started');


// //connection event - .on means its coming from our client to the server
// io.on('connection', function(socket) {//connection socket that returns a socket
//     console.log('Connection Made!!');//let me know a connection has been made

//     //this is our player class
//     //create a new player and assign to var player
//     var player = new Player();
//     //use the player id and assign to thisPlayerID
//     var thisPlayerID = player.id;
//     //assign the player now to the dictionary using its id as 
//     //a unique identifier
//     players[thisPlayerID] = player;
//     //do the same for the sockets using the player id
//     //the socket referenced here is returned from the function above
//     sockets[thisPlayerID] = socket;

//     //tell the client that this is our id for the server
//     //emit means its going from the server to the client
//     //register is used for setting base things up
//     // register on client and pass in some data, in this case,
//     //pass the player id
//     //tell client this is our id for the server
//     socket.emit('register', {id: thisPlayerID});
//     socket.emit('spawn', player); //this tells the specific client that it has spawned on the server

//     //still need to tell the other clients that this specific player has spawned as well
//     //for this you use broadcasst
//     socket.broadcast.emit('spawn', player); //tell the other players that this player has spawned

//     //now tell myself about every other client in the game
//     for(var playerID in players){
//         if(playerID != thisPlayerID){
//             socket.emit('spawn', players[playerID]);
//         }
//     } 

//     //positional data from client app
//     socket.on('updatePosition', function(data){
//         //console.log('data receieved: ' + data.position.x);
//         player.position.x = data.position.x;
//         player.position.y = data.position.y;
//         //player.position.z = data.position.z;

//         socket.broadcast.emit('updatePosition', player);
//     });


//     //rotational data from client app
//     socket.on('updateShipTilt', function(data){

//         player.zTiltValue = data.zValueForTilt;

//         //console.log("send tilt data back to client: " + player.zTiltValue);
//         socket.broadcast.emit('updateShipTilt', player);
//     });


//     //when disconnect is sent back, disconnect the player
//     socket.on('disconnect', function(){
//         console.log('A player has disconnected');
//         //delete the key and value in the array when disconnecting
//         delete players[thisPlayerID];
//         delete sockets[thisPlayerID];
//         socket.broadcast.emit('disconnected', player)
//     });


//     socket.on('fireBullet', function(data) {
//         var bullet = new Bullet();
//         bullet.name  = 'Bullet';
//         bullet.activator = data.activator;
//         bullet.position.x = data.position.x;
//         bullet.position.y = data.position.y;
//         bullet.position.z = data.position.z;

//         bullet.direction.x = data.direction.x;
//         bullet.direction.y = data.direction.y;
//         bullet.direction.z = data.direction.z;
//         //console.log('data receieved: ' + JSON.stringify(bullet, null, 2));
//         bullets.push(bullet);

//         var returnData = {
//             name: bullet.name,
//             id: bullet.id,
//             activator: bullet.activator,
//             position: {
//                 x: bullet.position.x,
//                 y: bullet.position.y,
//                 z: bullet.position.z
//             },
//             direction: {
//                 x: bullet.direction.x,
//                 y: bullet.direction.y,
//                 z: bullet.direction.z
//             },
//             speed: bullet.speed

//         }

//         socket.emit('serverSpawn', returnData);
//         socket.broadcast.emit('serverSpawn', returnData);
//     });

//     socket.on('CollisionDestory', function(data){
//         console.log('collision with bullet - id: ', data.id);
                
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

function interval(func, wait, times) {
    var interv = function(w, t){
        return function(){
            if(typeof t === "undefined" || t-- > 0){
                setTimeout(interv, w);
                try{
                    func.call(null);
                }
                catch(e){
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
}