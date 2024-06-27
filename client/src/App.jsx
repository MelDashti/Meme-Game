import React, {useEffect, useState} from 'react';
import {Container} from 'react-bootstrap';
import {Route, Routes, useNavigate} from 'react-router-dom';
import Game from './components/Game.jsx';
import NavComp from './components/NavComp.jsx';
import NewGame from './components/NewGame.jsx';
import {LoginComp} from './components/LoginComp.jsx';
import API from './API.mjs';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [newGameData, setNewGameData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await API.getUserInfo();
                setLoggedIn(true);
                setUser(user);
            } catch (err) {
            }
        };
        checkAuth();
    }, []);

    // this will handle the logout
    const handleLogout = async () => {
        await API.logOut();
        setLoggedIn(false);
        setUser(null);
        navigate("/");
    };

    const loggedInSuccess = (user) => {
        setLoggedIn(true);
        setUser(user);
    }

// function for creating a new game.
    const createNewGame = async () => {
        try {
            const {gameId, rounds} = await API.createGameWithRound(user?.id || null);
            const newGameData = {
                gameId,
                rounds: rounds.map(round => ({
                    roundId: round.roundId,
                    memeUrl: round.meme.url,
                    memeId: round.meme.id,
                    captions: round.captions,
                })),
            };
            setNewGameData(newGameData);
            navigate("/newgame");
        } catch (error) {
            console.error("Error in createNewGame:", error);
        }
    }

    return (
        <div className="min-vh-100 d-flex flex-column">
            <NavComp loggedIn={loggedIn} handleLogout={handleLogout}/>
            <Container fluid className="flex-grow-1 d-flex flex-column">
                <Routes>
                    <Route path="/" element={<Game userId={user?.id} setNewGameData={setNewGameData}
                                                   createNewGame={createNewGame}/>}/>
                    <Route path='/newgame' element={<NewGame loggedIn={loggedIn} newGameData={newGameData}
                                                             createNewGame={createNewGame}/>}/>
                    <Route path='/login' element={
                        <LoginComp loggedInSuccess={loggedInSuccess}/>
                    }/>
                </Routes>
            </Container>
        </div>
    );
}

export default App;