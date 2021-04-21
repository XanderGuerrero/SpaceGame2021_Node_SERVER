let Connection = require('./Connection');
let Player = require('./Player');
let Database = require('./Database');

let LobbyBase = require('./Lobbies/LobbyBase');
let GameLobby = require('./Lobbies/GameLobby');
let GameLobbySettings  = require('./Lobbies/GameLobbySettings');

//LevelData
let levelData1  = require('../Files/LevelData/Level1.json');
module.exports = class Server{
    constructor(isLocal = false){
        let server = this;
        this.database = new Database(isLocal);
        this.connections = [];
        this.lobbys = [];


        this.generalServerID = 'General Server';
        this.startLobby = new LobbyBase();
        this.startLobby.id = this.generalServerID;
        this.lobbys[this.generalServerID] = this.startLobby;

        //sample testing
        // this.database.GetSampleData(results => {
        //     console.log(results);
        // });

        // this.database.GetSampleDataByUserName('James', results => {
        //     console.log(results);
        // });

        // this.database.GetSampleData(results => {
        //     console.log(results);

        //     server.database.GetSampleDataByUserName('James', r => {
        //         console.log(r);
        //     });
        // });

        
    }

    //interval update every 100 milliseconds
    onUpdate() {
        let server = this;

        //Update each lobby
        for(let id in server.lobbys) {
            server.lobbys[id].onUpdate();
        }
    }


    //Handle a new connection to the server
    onConnected(socket) {
        let server = this;
        let connection = new Connection();
        connection.socket = socket;
        connection.player = new Player();
        connection.player.lobby = server.startLobby.id;
        connection.server = server;

        let player = connection.player;
        let lobbys = server.lobbys;

        console.log('Added new player to the server (' + player.id + ')');
        server.connections[player.id] = connection;

        socket.join(player.lobby);
        connection.lobby = lobbys[player.lobby];
        connection.lobby.onEnterLobby(connection);

        return connection;
    }

    //data type required for this method is of type Connection
    onDisconnected(connection = Connection) {
        let server = this;
        let id = connection.player.id;

        delete server.connections[id];
        console.log('Player ' + connection.player.displayPlayerInformation() + ' has disconnected');

        //Tell Other players currently in the lobby that we have disconnected from the game
        connection.socket.broadcast.to(connection.player.lobby).emit('disconnected', {
            id: id
        });

        //Preform lobby clean up
        let currentLobbyIndex = connection.player.lobby;
        server.lobbys[currentLobbyIndex].onLeaveLobby(connection);

        if (currentLobbyIndex != server.generalServerID  && server.lobbys[currentLobbyIndex] != undefined && server.lobbys[currentLobbyIndex].connections.length == 0) {
            console.log('Closing down lobby (' + currentLobbyIndex + ')');
            server.closeDownLobby(currentLobbyIndex);
        }
    }


    closeDownLobby(index) {
        let server = this;
        console.log('Closing down lobby (' + index + ')');
        delete server.lobbys[index];
    }

    onAttemptToJoinGame(connection = Connection) {

        //console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        //Look through lobbies for a gamelobby
        //check if joinable
        //if not make a new game
        let server = this;
        let lobbyFound = false;

        let gameLobbies = [];
        for (var id in server.lobbys) {
            if (server.lobbys[id] instanceof GameLobby) {
                gameLobbies.push(server.lobbys[id]);
            }
        }
        console.log('Found (' + gameLobbies.length + ') lobbies on the server');

        gameLobbies.forEach(lobby => {
            if(!lobbyFound) {
                //call gamelobby canEnterLobby()
                let canJoin = lobby.canEnterLobby(connection);
console.log("hi");
                if(canJoin) {
                    lobbyFound = true;
                    server.onSwitchLobby(connection, lobby.id);
                }
            }
        });

        //All game lobbies full or we have never created one
        if(!lobbyFound) {
            console.log('Making a new game lobby');
            //change the gamelobby settings second parameter to add more players to the game
            //1person lobby with 1 player needed for game to work
            let gamelobby = new GameLobby( new GameLobbySettings('FFA', 1, 1, levelData1));
            gamelobby.endGameLobby = function() {server.closeDownLobby(gamelobby.id)};
            server.lobbys[gamelobby.id] = gamelobby;
            server.onSwitchLobby(connection, gamelobby.id);
        }
    }

    onSwitchLobby(connection = Connection, lobbyID) {
        let server = this;
        let lobbys = server.lobbys;

        connection.socket.join(lobbyID); // Join the new lobby's socket channel
        connection.lobby = lobbys[lobbyID];//assign reference to the new lobby

        lobbys[connection.player.lobby].onLeaveLobby(connection);
        lobbys[lobbyID].onEnterLobby(connection);
    }
}