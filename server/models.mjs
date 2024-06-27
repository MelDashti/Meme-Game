class Caption {
    constructor(id, text) {
        this.id = id;
        this.text = text;
    }
}

class Meme {
    constructor(id, url) {
        this.id = id;
        this.url = url;
    }
}

class Round {
    constructor(id, gameId, memeId, selectedCaption, score, memeUrl) {
        this.id = id;
        this.gameId = gameId;
        this.memeId = memeId;
        this.selectedCaption = selectedCaption;
        this.score = score;
        this.memeUrl = memeUrl; 
    }
}

class Game {
    constructor(id, userId, totalScore, createdAt, completed) {
        this.id = id;
        this.userId = userId;
        this.totalScore = totalScore;
        this.createdAt = createdAt;
        this.completed = completed;
    }
}

export { Caption, Meme, Round, Game };