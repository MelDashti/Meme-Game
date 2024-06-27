import db from './db.mjs';
import {Meme, Caption, Round, Game} from './models.mjs'
import dayjs from 'dayjs';


export default function MemeDao() {

    // this function will retrieve a random Meme from the db
    // excludeIds is an array of meme ids that should be excluded from the selection, we do this in order to get unique memes for a game
    this.getRandomMeme = (excludeIds = []) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM MEMES 
                WHERE id NOT IN (${excludeIds.map(() => '?').join(',')})
                ORDER BY RANDOM() LIMIT 1
            `;
            db.all(query, excludeIds, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const meme = new Meme(rows[0].id, rows[0].url);
                    resolve(meme);
                }
            });
        });
    };

    // this function will update the selected caption and score for a round
    this.completeRound = (roundId, selectedQuote, roundScore) => {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE Rounds
                SET selectedCaption = ?, score = ?
                WHERE id = ?
            `;
            db.run(query, [selectedQuote, roundScore, roundId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    // this function will get the best match captions for a meme
    this.getBestMatchCaptions = (memeId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.id, c.text 
                FROM MemeCaptions mc
                JOIN Captions c ON mc.captionId = c.id
                WHERE mc.memeId = ? 
                ORDER BY RANDOM() LIMIT 2
            `;
            db.all(query, [memeId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const captions = rows.map(row => new Caption(row.id, row.text));
                    resolve(captions);
                }
            });
        });
    }

    // this function will get all the games for a user
    this.getAllGamesForUser = (userId) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT*FROM Games WHERE userId = ? AND completed = 1 ORDER BY createdAt DESC';
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const games = rows.map(row => new Game(row.id, row.userId, row.totalScore, row.createdAt, row.completed));
                    resolve(games);
                }
            });
        });
    };

    // this function will get all the rounds for a game
    this.getRoundsForGame = (gameId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT r.id, r.gameId, r.memeId, r.selectedCaption, r.score, m.url as memeUrl
                FROM Rounds r
                JOIN Memes m ON r.memeId = m.id
                WHERE r.gameId = ?
            `;
            db.all(query, [gameId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const rounds = rows.map(row => new Round(row.id, row.gameId, row.memeId, row.selectedCaption, row.score, row.memeUrl)); // Pass memeUrl here
                    resolve(rounds);
                }
            });
        });
    };

    // this function will get the additional captions for a meme
    this.getAdditionalCaptions = (excludeIds) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.id, c.text 
                FROM Captions c
                WHERE c.id NOT IN (${excludeIds.map(() => '?').join(',')})
                ORDER BY RANDOM() LIMIT 5
            `;
            // The query will fetch 5 random captions that are not in the excludeIds array
            db.all(query, excludeIds, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const captions = rows.map(row => new Caption(row.id, row.text));
                    resolve(captions);
                }
            });
        });
    };


    // this function will create a game
    this.createGame = (userId) => {
        return new Promise((resolve, reject) => {
            const createdAt = dayjs().format();
            db.run('INSERT INTO Games (userId, totalScore, createdAt, completed) VALUES (?, 0, ?, 0)', [userId, createdAt], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID); // returns the id of the newly created id
                }
            });
        });
    }

    // this function will complete a game
    this.completeGame = (id, totalScore) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE Games SET totalScore = ?, completed = 1 WHERE id = ?', [totalScore, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }


    // this function will create a new round
    this.createRound = (gameId, memeId, selectedCaption, score) => {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO Rounds (gameId, memeId, selectedCaption, score) VALUES (?, ?, ?, ?)', [gameId, memeId, selectedCaption, score], function (err) {
                if (err) reject(err);
                else resolve(this.lastID); // Return the ID of the newly created round
            });
        });
    }


    // this function will delete a game and it's associated rounds
    this.deleteGameAndRounds = (gameId) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM ROUNDS WHERE gameId = ?', [gameId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    db.run('DELETE FROM Games WHERE id = ?', [gameId], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    };


}





