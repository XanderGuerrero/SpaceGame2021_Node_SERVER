module.exports = class Connection{
    constructor(){
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }

    //this method handles all IO events and 
    //where to route the requests
    //ex. pass to joingame
    createEvents(){
        let connection = this;
        let socket = connection.socket;
        let server = connection.server;
        let player = connection.player;

        console.log('IN CREATE EVENTS');

        socket.on('disconnect', function() {
            server.onDisconnected(connection);
        });

        socket.on('createAccount', function(data){
            server.database.CreateAccount(data.username, data.password, results => {
                //results will return a true or false based on if the account exists or not
                console.log(results.valid + ':' + results.reason);
            })
        });

        socket.on('signIn', function(data) {
            server.database.SignIn(data.username, data.password, results => {
                //Results will return a true or false based on if the account already exists or not
                console.log(results.valid + ': ' + results.reason);
                if (results.valid) {
                    //Store the username in the player object
                    socket.emit('signIn');
                }
            });
        });

        socket.on('joinGame', function() {
            server.onAttemptToJoinGame(connection);
        });

        socket.on('fireBullet', function(data) {
            connection.lobby.fireBullet(connection, data);
        });

        socket.on('fireMissile', function(data) {
            connection.lobby.fireMissile(connection, data);
        });

        socket.on('serverSpawnExplosion', function(data) {
            connection.lobby.serverSpawnExplosion(connection, data);
        });

        socket.on('AsteroidUpdateDirection', function(data) {
            connection.lobby.onAsteroidUpdateDirection(connection, data);
        });

        socket.on('asteroidCollisionDestroy', function(data) {
            connection.lobby.onAsteroidCollisionDestroy(connection, data);
        });

        socket.on('missileCollisionDestroy', function(data) {
            //console.log(" in connection.js");
            connection.lobby.missileCollisionDestroy(connection, data);
        });

        socket.on('collisionDestroy', function(data) {
            //console.log(" in connection.js");
            connection.lobby.onCollisionDestroy(connection, data);
        });

        socket.on('BulletDestory', function(data){
            connection.lobby.BulletDestory(connection, data);
        });

        socket.on('MissileDestroy', function(data){
            connection.lobby.MissileDestroy(connection, data);
        });
        socket.on('DestroyExplosion', function(data){
            connection.lobby.DestroyExplosion(connection, data);
        });

        socket.on('updatePosition', function(data){
            //console.log('data receieved: ' + data.position.x);
            player.position.x = data.position.x;
            player.position.y = data.position.y;
            player.position.z = data.position.z;

            socket.broadcast.to(connection.lobby.id).emit('updatePosition', player);
        });

        socket.on('updateRotation', function(data){
            //console.log('updateRotation data receieved shipTiltRotation : ' + data.shipTiltRotation);

            player.barrelRotation = data.barrelRotation;
            player.shipTiltRotation = data.shipTiltRotation;
            player.shipTiltRotationX = data.shipTiltRotationX;
            player.shipTiltRotationY = data.shipTiltRotationY;

            socket.broadcast.to(connection.lobby.id).emit('updateRotation', player);
        });

        socket.on('quitGame', function(data){
            server.onSwitchLobby(connection, server.generalServerID);
        });

        // socket.on('updateShipTilt', function(data){
        //     ///console.log('updateRotation data receieved shipTiltRotation : ' + data.shipTiltRotation);
        //     player.zTiltValue = data.zValueForTilt;
        //     // player.barrelRotation = data.barrelRotation;
        //     // player.shipTiltRotation = data.shipTiltRotation;
        //     // player.shipTiltRotationX = data.shipTiltRotationX;
        //     // player.shipTiltRotationY = data.shipTiltRotationY;

        //     socket.broadcast.to(connection.lobby.id).emit('updateShipTilt', player);
        // });

        console.log('LEAVING CREATE EVENTS');
    }
}