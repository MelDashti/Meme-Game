// Importing modules
import express from 'express';
import morgan from 'morgan'; // loggin middleware
import cors from 'cors'; // cors middleware
import {check, validationResult} from 'express-validator'; // validation middleware
import db from './db.mjs';

// here we intitialize and setup the middlewares
const app = express();
app.use(morgan('dev'));
app.use(express.json());

// activating the server
const PORT = 3008;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// Here we setup and enable Cross-Origin Resource Sharing (CORS) **/
const corsOption = {
    origin: 'http://localhost:3000',
}  
app.use(cors(corsOption));

// Add a new game state
app.post('/api/game', async (req, res) => {
    const { user_id, state, score } = req.body;
    await db.run('INSERT INTO games (user_id, state, score) VALUES (?, ?, ?)', [user_id, state, score]);
    res.json({ message: 'Game state saved' });
});

// Get game state
app.get('/api/game/:id', async (req, res) => {
    const game = await db.get('SELECT * FROM games WHERE id = ?', [req.params.id]);
    res.json(game);
});
