const SERVER_URL = 'http://localhost:3000';

// here we define the API functions for getting game related info

const getRandomMeme = async (excludeIds=[]) => {
    const response = await fetch(SERVER_URL + `/api/meme?excludeIds=${excludeIds.join(',')}`);
    if (response.ok) {
        const memeData = await response.json();
        return memeData;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

const checkCaption = async (memeId, captionId) => {
    const response = await fetch(SERVER_URL + '/api/check-caption', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memeId, captionId }),
    });
    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

const getBestCaption = async (memeId) => {
    const response = await fetch(SERVER_URL + `/api/best-caption?id=${memeId}`);
    if (response.ok) {
        const bestCaption = await response.json();
        return bestCaption;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

// {gameId} is returned by the server
const createGame = async (userId) => {
    const response = await fetch(SERVER_URL + '/api/games', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    if (response.ok) {
        const game = await response.json();
        return game;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};


const completeGame = async (id, totalScore) => {
    const response = await fetch(SERVER_URL + `/api/games/${id}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalScore }),
    });
    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

// delete game and its rounds
const deleteGame = async (gameId) => {
    const response = await fetch(SERVER_URL + `/api/games/${gameId}`, {
        method: 'DELETE',
    });
    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};



const createRound = async (gameId, memeId, selectedCaption, score) => {
    try {
        const response = await fetch(SERVER_URL + '/api/rounds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gameId, memeId, selectedCaption, score }),
        });
        if (response.ok) {
            console.log('Round created', await response.json());
        } else {
            const errDetails = await response.text();
            console.log('Round creation failed:', errDetails);
            throw new Error(errDetails);
        }
    } catch (error) {
        console.error('Error in createRound:', error);
    }
};

const getRoundsForGame = async (gameId) => {
    const response = await fetch(SERVER_URL + `/api/games/${gameId}/rounds`);
    if (response.ok) {
        const rounds = await response.json();
        return rounds;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

const getAllGamesForUser = async (userId) => {
    const response = await fetch(SERVER_URL + `/api/users/${userId}/games`);
    if (response.ok) {
      const games = await response.json();
      return games;
    } else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };

// authentication related
const login = async(credentials)=>{
    const response = await fetch(SERVER_URL + '/api/sessions',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
    });
    if(response.ok){
        const user = await response.json();
        return user;
    } else{
        const errDetails = await response.text();
        throw errDetails;
    }
};

const getUserInfo = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };


  
  const logOut = async() => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok)
      return null;
  }

  export default {
    login,
    getUserInfo,
    logOut,
    getRandomMeme,
    checkCaption,
    getBestCaption,
    createGame,
    completeGame,
    createRound,
    getRoundsForGame,
    deleteGame,
    getAllGamesForUser,
};