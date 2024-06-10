// Importing modules
import express from 'express';
import morgan from 'morgan'; // loggin middleware
import cors from 'cors'; // cors middleware
import {Result, check, validationResult} from 'express-validator'; // validation middleware
import db from './db.mjs';

// here we intitialize and setup the middlewares
const app = express();
app.use(morgan('dev'));
app.use(express.json());

// Here we setup and enable Cross-Origin Resource Sharing (CORS) **/
const corsOption = {
    origin: 'http://localhost:3000',
}  
app.use(cors(corsOption));


// Here we add the routes for the game 

// Get a random meme with captions. In this we have to return everything that is required by the game
app.get('/api/meme', async(req, res)=>{
    try{
        // Here a random meme is fetched
        const result = await memeDao.getRandomMeme();
        // Here best captions of that meme(result) is fetched
        const bestMatchCaptions = await memeDao.getBestMatchCaptions(result.id);
        // The id of the best match captions is passed so that 5 random captions that are not these 2 captions are returned
        const additionalCaptions = await memeDao.getAdditionalCaptions(result.id, bestMatchCaptions.map(c=>c.id));
        // All the captions are placed in one array 
        const allCaptions = [...bestMatchCaptions, ...additionalCaptions];
        // We shuffle the caption array
        allCaptions.sort(()=> 0.5 - Math.random());

        res.json({
            meme: result,
            captions: allCaptions
        });
    }catch(err){
        res.status(500).json({error: 'An error occured while fetching the meme'});
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
    const { memeId } = req.query;
    try {
      const bestCaption = await memeDao.getBestMatchCaptions(memeId);
      res.json({ bestCaption });
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while getting the best caption.' });
    }
  });



// activating the server
const PORT = 3008;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

