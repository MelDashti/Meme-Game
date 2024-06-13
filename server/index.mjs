// Importing modules
import express from 'express';
import morgan from 'morgan'; // loggin middleware
import cors from 'cors'; // cors middleware
import {Result, check, validationResult} from 'express-validator'; // validation middleware
import db from './db.mjs';
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

// Here we setup passport with local strategy
// cb is a callback function that is called when the authentication is done
passport.use(new LocalStrategy(async function verify(username, password, cb){
    // Here we check if the user exists in the database
    const user = await getUser(username,password);
    // If the user does not exist, we return an error message
    if(!user)
        return cb(null, false, {message: 'Incorrect username or password'});
    return cb(null, user);
}));

// Here we serialize the user and save it to the session
passport.serializeUser(function(user, cb){
    cb(null, user);
})

// here we deserialize the user and retrieve it from the session
passport.deserializeUser(function(user,cb){
    return cb(null, user);
})

// this is a middleware that checks if the user is logged in 
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    res.status(401).json({message: 'Unauthorized'});
}


// api/sessions. This is the endpoint for the login
app.post('/api/sessions', function(req,res,next){
    // here we use the previously defined local strategy to authenticate the user
    passport.authenticate('local', (err, user, info)=>{
        if(err)
            return next(err);
        if(!user){
            // Here we display the incorrect login message
            return res.status(401).send(info);
        }
        // If it is successful, perform login
        req.login(user, (err)=>{
            if(err)
                return next(err);
            // If it is successful, send the user to the home page
            return res.json(req.user);
        });
  })(req, res, next);
});

// This is the logout
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.end();
    });
  });

  // GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.json(req.user);}
    else
      res.status(401).json({error: 'Not authenticated'});
  });


// Here we add the routes for game

app.get('/api/meme', async (req, res) => {
  try {
      console.log('Fetching a random meme...');
      const result = await memeDao.getRandomMeme();
      if (!result) {
          throw new Error('No meme found');
      }
      console.log('Random meme fetched:', result);

      console.log('Fetching best match captions for meme id:', result.id);
      const bestMatchCaptions = await memeDao.getBestMatchCaptions(result.id);
      if (!bestMatchCaptions.length) {
          throw new Error('No best match captions found');
      }
      console.log('Best match captions fetched:', bestMatchCaptions);

      console.log('Fetching additional captions...');
      const additionalCaptions = await memeDao.getAdditionalCaptions(result.id, bestMatchCaptions.map(c => c.id));
      console.log('Additional captions fetched:', additionalCaptions);

      const allCaptions = [...bestMatchCaptions, ...additionalCaptions];
      allCaptions.sort(() => 0.5 - Math.random());

      res.json({
          meme: result,
          captions: allCaptions
      });
  } catch (err) {
      console.error('Error occurred while fetching the meme:', err.message);
      res.status(500).json({ error: err.message });
  }
});

// Endpoint to check the selected caption
app.post('/api/check-caption', async (req, res) => {
    const { memeId, captionId } = req.body;
    try {
      const isBestMatch = await memeDao.checkCaption(memeId, captionId);
      res.json({ isBestMatch });
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while checking the caption.' });
    }
  });

// endpoint to get the best caption
app.get('/api/best-caption', async (req, res) => {
    const { id } = req.query;
    try {
      const bestCaption = await memeDao.getBestMatchCaptions(id);
      res.json({ bestCaption });
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while getting the best caption.' });
    }
  });


// Endpoint for creating a new game
app.post('/api/games', async(req, res)=>{
    const{userId} = req.body;
    try{
      console.log('Creating a new game...');
      console.log(userId);
        const gameId = await memeDao.createGame(userId);
        res.json({gameId});
    }catch(err){
        res.status(500).json({error: 'An error occurred while creating a game.'});
    }
})

// Endpoint to complete a game
app.post('/api/games/:id/complete', async(req,res)=>{
    const{id} = req.params;
    const{totalScore} = req.body;
    try{
        await memeDao.completeGame(id, totalScore);
        res.json({message: 'Game completed successfully'});
    }catch(err){
        res.status(500).json({error: 'An error occurred while completing a game.'});
    }
})


// Endpoint for deleting a game with all its rounds
app.delete('/api/games/:gameId', async(req, res)=>{
  const{gameId} = req.params;
  try{
    await memeDao.deleteGameAndRounds(gameId);
    res.json({message: 'Game and all its rounds deleted successfully'});
  }catch(err){
    res.status(500).json({error: 'An error occurred while deleting a game.'});
  }
})


// Endpoint to create a new round
app.post('/api/rounds', async (req, res) => {
    const { gameId, memeId, selectedCaption, score } = req.body;
    console.log('Received data:', { gameId, memeId, selectedCaption, score });
    try {
        console.log('Creating a new round...');
        const roundId = await memeDao.createRound(gameId, memeId, selectedCaption, score);
        res.json({ roundId });
    } catch (err) {
        console.error('Error creating round:', err.message);
        res.status(500).json({ error: 'An error occurred while creating the round.' });
    }
});

  
  // Endpoint to get rounds for a game
  app.get('/api/games/:gameId/rounds', async (req, res) => {
    const { gameId } = req.params;
    try {
      const rounds = await gameDao.getRoundsForGame(gameId);
      res.json(rounds);
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while fetching rounds for the game.' });
    }
  });







// activating the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


