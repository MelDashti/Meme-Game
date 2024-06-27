// Importing modules
import express from 'express';
import morgan from 'morgan'; // loggin middleware
import cors from 'cors'; // cors middleware
// Passport related imports
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import {getUser} from './user-dao.mjs';
import MemeDao from './dao-memes.mjs';

const memeDao = new MemeDao();

// here we intitialize and setup the middlewares
const app = express();
app.use(morgan('dev'));
app.use(express.json());

// Here we setup and enable Cross-Origin Resource Sharing (CORS) **/
const corsOption = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
}
app.use(cors(corsOption));


// Here we setup the session
app.use(session({
    // This is the secret key that will be used to sign the session ID
    secret: "randomfhkajlfdhurq24stringw",
    resave: false,
    saveUninitialized: false,
}));

// Here we initialize the passport with the session
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const user = await getUser(username, password);
    if (!user)
        return cb(null, false, {message: 'Incorrect username or password'});
    return cb(null, user);
}));


passport.serializeUser(function (user, cb) {
    cb(null, user);
})


passport.deserializeUser(function (user, cb) {
    return cb(null, user);
})


const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({message: 'Unauthorized'});
}


// login
app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).send(info);
        }
        // If it is successful, perform login
        req.login(user, (err) => {
            if (err)
                return next(err);
            // If it is successful, send the user to the home page
            return res.json(req.user);
        });
    })(req, res, next);
});



// This is the logout
// user should be logged in to logout
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
    req.logout(() => {
        res.end();
    });
});

// GET /api/sessions/current
app.get('/api/sessions/current', isLoggedIn, (req, res) => {
    res.json(req.user);
});


// Here we add the routes for game

app.post('/api/newgame', async (req, res) => {
    const {userId} = req.body;
    const {excludeIds} = req.query;
    const excludeIdsArray = excludeIds ? excludeIds.split(',').map(Number) : [];
    try {
        const rounds = [];
        const usedMemeIds = new Set(excludeIdsArray);

        for (let i = 0; i < 3; i++) {
            const result = await memeDao.getRandomMeme(Array.from(usedMemeIds));
            if (!result) {
                throw new Error('No meme found');
            }
            usedMemeIds.add(result.id);

            const bestMatchCaptions = await memeDao.getBestMatchCaptions(result.id);
            if (!bestMatchCaptions.length) {
                throw new Error('No best match captions found');
            }

            const additionalCaptions = await memeDao.getAdditionalCaptions(result.id, bestMatchCaptions.map(c => c.id));

            // Ensure unique captions
            const uniqueCaptions = Array.from(new Set([...bestMatchCaptions, ...additionalCaptions]));

            // If there are fewer than 7 unique captions, fetch more until we have 7
            while (uniqueCaptions.length < 7) {
                const moreCaptions = await memeDao.getRandomCaptions();
                moreCaptions.forEach(caption => {
                    if (!uniqueCaptions.includes(caption.text) && uniqueCaptions.length < 7) {
                        uniqueCaptions.push(caption);
                    }
                });
            }

            uniqueCaptions.sort(() => 0.5 - Math.random()); // Shuffle the captions

            rounds.push({
                meme: result,
                captions: uniqueCaptions
            });
        }

        // Create a game
        const gameId = await memeDao.createGame(userId || null);

        // Create rounds with selectedCaption as null
        const roundIds = [];
        for (const round of rounds) {
            const roundId = await memeDao.createRound(gameId, round.meme.id, null, 0);
            roundIds.push({
                roundId,
                meme: round.meme,
                captions: round.captions
            });
        }

        res.json({
            gameId,
            rounds: roundIds
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});


// endpoint to get the best caption
app.get('/api/best-caption', async (req, res) => {
    const {id} = req.query;
    try {
        const bestCaption = await memeDao.getBestMatchCaptions(id);
        res.json({bestCaption});
    } catch (err) {
        res.status(500).json({error: 'An error occurred while getting the best caption.'});
    }
});


// Endpoint to complete a game
app.post('/api/games/:id/complete', async (req, res) => {
    const {id} = req.params;
    const {totalScore} = req.body;
    try {
        await memeDao.completeGame(id, totalScore);
        res.json({message: 'Game completed successfully'});
    } catch (err) {
        res.status(500).json({error: 'An error occurred while completing a game.'});
    }
})



// Endpoint for deleting a game with all its rounds
app.delete('/api/games/:gameId', async (req, res) => {
    const {gameId} = req.params;
    try {
        await memeDao.deleteGameAndRounds(gameId);
        res.status(200).json({message: 'Game and associated rounds deleted successfully'});
    } catch (err) {
        res.status(500).json({error: 'An error occurred while deleting the game.'});
    }
});


// Endpoint to complete a round
app.post('/api/rounds/:roundId/complete', async (req, res) => {
    const {roundId} = req.params;
    const {selectedQuote, roundScore} = req.body;
    try {
        await memeDao.completeRound(roundId, selectedQuote, roundScore);
        res.json({message: 'Round completed successfully'});
    } catch (err) {
        res.status(500).json({error: 'An error occurred while completing the round.'});
    }
});


// Endpoint to get rounds for a game
app.get('/api/games/:gameId/rounds', async (req, res) => {
    const {gameId} = req.params;
    try {
        const rounds = await memeDao.getRoundsForGame(gameId);
        res.json(rounds);
    } catch (err) {
        res.status(500).json({error: 'An error occurred while fetching rounds for the game.'});
    }
});

// endpoint to get all games for a user
// we use isLoggedIn middleware to check if the user is logged in
app.get('/api/users/:userId/games', isLoggedIn, async (req, res) => {
    const {userId} = req.params;
    try {
        const games = await memeDao.getAllGamesForUser(userId);
        res.json(games);
    } catch (err) {
        res.status(500).json({error: 'An error occurred while fetching games for the user.'});
    }
})


// activating the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


