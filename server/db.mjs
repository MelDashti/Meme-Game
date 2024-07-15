/** DB access module **/
import sqlite3 from "sqlite3";

// Opening the database
const db = new sqlite3.Database('memegame.db', (err) => {
    if (err) throw err;
});

export default db;
