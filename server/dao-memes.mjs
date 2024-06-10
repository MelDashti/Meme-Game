import db from './db.mjs';
import Meme from './meme.mjs';
import Caption from './caption.mjs';
import dayjs from 'dayjs';


export default function MemeDao(){

    // this function will retrieve a random Meme from the db
    this.getRandomMeme = () =>{
        return new Promise((resolve, reject)=>{
            const query = 'SELECT*FROM MEMES ORDER BY RANDOM() LIMIT 1';
            db.all(query, (err, rows)=>{
                if(err){
                    reject(err);
                }else{
                    const meme = new Meme(rows[0].id, rows[0].url);
                    resolve(meme);
                }
            })

        })
    }

    this.getBestMatchCaptions = (memeId) =>{
        return new Promise((resolve, reject)=>{
            const query = 'SELECT*FROM CAPTIONS WHERE memeId = ? ORDER BY RANDOM() LIMIT 1';
            db.all(query, [memeId], (err, rows)=>{
                if(err){
                    reject(err);
                }else{
                    const caption = new Caption(rows[0].id, rows[0].text);
                    resolve(caption);
                }
            })
        })
    }

    this.getAdditionalCaptions = (memeId, excludeIds) =>{
        return new Promise((resolve, reject)=>{
            db.all(`SELECT * FROM Captions WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 5`, excludeIds, (err, rows) => {
                if (err) reject(err);
                else
                 resolve(rows.map(row => new Caption(row.id, row.text)));
              });
            })
        }

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
    
    this.completeGame = (gameId, totalScore) =>{
        return new Promise((resolve, reject)=>{
            db.run('UPDATE Games SET totalScore = ?, completed = 1 WHERE id = ?', [totalScore, gameId], function(err){
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
    }

    
    // this creates a new round
    this.createRound = (gameId, memeId, selectedCaptionId, score) =>{
        return new Promise((resolve, reject)=>{
            db.run('INSERT INTO Rounds (gameId, memeId, selectedCaptionId, score) VALUES (?, ?, ?, ?)', [gameId, memeId, selectedCaptionId, score], function(err) {
                if (err) reject(err);
                else resolve(this.lastID); // Return the ID of the newly created round
              });
        });
    }
    
    // get rounds of a game
    this.getRoundsForGame = (gameId)=>{
        return new Promise((resolve, reject)=>{
            db.all('SELECT * FROM Rounds WHERE gameId = ?', [gameId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
              });
        });
    }
        
        
    }





