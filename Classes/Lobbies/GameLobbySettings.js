module.exports = class GameLobbySettings {
    constructor(gameMode, maxPlayers, leveData) {
        this.gameMode = 'No Gamemode Defined';
        this.maxPlayers = maxPlayers;

        this.levelData = leveData;
    }
}