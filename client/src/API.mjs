const SERVER_URL = 'http://localhost:3000';


// Api call for creating a game with 3 rounds,and fetching a random meme with 7 unique captions for each round
const createGameWithRound = async (userId, excludeIds = []) => {
    const response = await fetch(SERVER_URL + `/api/newgame?excludeIds=${excludeIds.join(',')}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId}),
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};


// Api call for getting the best captions for a meme
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


// Api call for completing a game
const completeGame = async (id, totalScore) => {
    const response = await fetch(SERVER_URL + `/api/games/${id}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({totalScore}),
    });
    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

// Api call for deleting a game and its rounds
const deleteGame = async (gameId) => {
    try {
        const response = await fetch(SERVER_URL + `/api/games/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to delete game: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

// Api call for completing a round
const completeRound = async (roundId, selectedQuote, roundScore) => {
    const response = await fetch(SERVER_URL + `/api/rounds/${roundId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({selectedQuote, roundScore}),
    });
    if (response.ok) {
        const result = await response.json();
        return result;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

// Api call for getting the rounds for a game
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

// Api call for getting all games for a user
const getAllGamesForUser = async (userId) => {
    const response = await fetch(SERVER_URL + `/api/users/${userId}/games`, {
        credentials: 'include',
    });
    if (response.ok) {
        const games = await response.json();
        return games;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

// api call for logging in
const login = async (credentials) => {
    const response = await fetch(SERVER_URL + '/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    } else {
        const errDetails = await response.text();
        throw errDetails;
    }
};

// api call for getting the user info
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


// Api call for logging out
const logOut = async () => {
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
    getBestCaption,
    completeGame,
    completeRound,
    getRoundsForGame,
    deleteGame,
    getAllGamesForUser,
    createGameWithRound,
};