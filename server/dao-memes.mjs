import db from './db.mjs';
import Meme from './meme.mjs';
import Caption from './caption.mjs';
import dayjs from 'dayjs';


export default function MemeDao(){

    // this function will retrieve a random Meme from the db
    // excludeIds is an array of meme ids that should be excluded from the selection
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

    this.getBestMatchCaptions = (memeId) =>{
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

    this.getAllGamesForUser = (userId) =>{
        return new Promise((resolve, reject)=>{
            const query = 'SELECT*FROM Games WHERE userId = ? AND completed = 1 ORDER BY createdAt DESC';
            db.all(query, [userId], (err, rows)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(rows);
                }
            });
        });
    };

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
                    resolve(rows);
                }
            });
        });
    };
    
    
    
    
    this.getAdditionalCaptions = (memeId, excludeIds) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.id, c.text 
                FROM Captions c
                WHERE c.id NOT IN (${excludeIds.map(() => '?').join(',')})
                ORDER BY RANDOM() LIMIT 5
            `;
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

    this.checkCaption = (memeId, captionId) =>{
        return new Promise((resolve, reject)=>{
            const query = 'SELECT*FROM CAPTIONS WHERE id = ? AND memeId = ?';
            db.get(query, [captionId, memeId], (err, row)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(row?true:false);
                }
            })
        })
    }

// this is for creating a game
    this.createGame = (userId) =>{
        return new Promise((resolve,reject)=>{
            const createdAt = dayjs().format();
            db.run('INSERT INTO Games (userId, totalScore, createdAt, completed) VALUES (?, 0, ?, 0)', [userId, createdAt], function(err) {
                if(err){
                    reject(err);
                }else{
                    resolve(this.lastID); // returns the id of the newly created id
                }
            });
        });
    }
    
    this.completeGame = (id, totalScore) =>{
        return new Promise((resolve, reject)=>{
            db.run('UPDATE Games SET totalScore = ?, completed = 1 WHERE id = ?', [totalScore, id], function(err){
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
    }

    
    // this creates a new round
    this.createRound = (gameId, memeId, selectedCaption, score) =>{
        return new Promise((resolve, reject)=>{
            console.log('Creating a new round...');
            console.log(gameId, memeId, selectedCaption, score);
            db.run('INSERT INTO Rounds (gameId, memeId, selectedCaption, score) VALUES (?, ?, ?, ?)', [gameId, memeId, selectedCaption, score], function(err) {
                if (err) reject(err);
                else resolve(this.lastID); // Return the ID of the newly created round
              });
        });
    }
    
    // // get rounds of a game
    // this.getRoundsForGame = (gameId)=>{
    //     return new Promise((resolve, reject)=>{
    //         db.all('SELECT * FROM Rounds WHERE gameId = ?', [gameId], (err, rows) => {
    //             if (err) reject(err);
    //             else resolve(rows);
    //           });
    //     });
    // }
        
        
    // here we delete a game and it's associated rounds. (this is for when the user doesn't complete a game)
    this.deleteGameAndRounds = (gameId)=>{
        return new Promise((resolve, reject)=>{
            db.run('DELETE FROM ROUNDS WHERE gameId = ?', [gameId], (err)=>{
                if(err){
                    reject(err);
                }else{
                    db.run('DELETE FROM Games WHERE id = ?', [gameId], (err)=>{
                        if(err){
                            reject(err);
                        }else{
                            resolve();
                        }
                    })
                }
            })
        })
    }
    
    
    
    }





