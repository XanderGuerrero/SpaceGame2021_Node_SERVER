module.exports = class GameLobbySettings {
    constructor(gameMode, maxPlayers, minPlayers, leveData) {
        this.gameMode = 'No Gamemode Defined';
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.levelData = leveData;
    }
}