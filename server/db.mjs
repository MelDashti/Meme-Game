/** DB access module **/
import sqlite3 from "sqlite3";

// Opening the database
const db = new sqlite3.Database('memegame.db', (err) => {
    if (err) throw err;
    initializeDatabase();
});

const initializeDatabase = () => {
    db.serialize(() => {
        // Creating Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
        `);

        // Creating Memes table
        db.run(`
            CREATE TABLE IF NOT EXISTS Memes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL
            );
        `);

        // Creating Captions table
        db.run(`
            CREATE TABLE IF NOT EXISTS Captions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL
            );
        `);

        // Creating MemeCaptions table (Join Table)
        db.run(`
            CREATE TABLE IF NOT EXISTS MemeCaptions (
                memeId INTEGER,
                captionId INTEGER,
                isBestMatch BOOLEAN DEFAULT 0,
                PRIMARY KEY (memeId, captionId),
                FOREIGN KEY (memeId) REFERENCES Memes(id),
                FOREIGN KEY (captionId) REFERENCES Captions(id)
            );
        `);

        // Creating Games table
        db.run(`
            CREATE TABLE IF NOT EXISTS Games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                totalScore INTEGER DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed BOOLEAN DEFAULT 0,
                FOREIGN KEY (userId) REFERENCES Users(id)
            );
        `);

        // Creating Rounds table
        db.run(`
            CREATE TABLE IF NOT EXISTS Rounds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gameId INTEGER,
                memeId INTEGER,
                selectedCaptionId INTEGER,
                score INTEGER DEFAULT 0,
                FOREIGN KEY (gameId) REFERENCES Games(id),
                FOREIGN KEY (memeId) REFERENCES Memes(id),
                FOREIGN KEY (selectedCaptionId) REFERENCES Captions(id)
            );
        `);
    });
};

export default db;
