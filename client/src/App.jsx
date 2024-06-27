import React, {useEffect, useState} from 'react';
import {Container} from 'react-bootstrap';
import {Route, Routes} from 'react-router-dom';
import Game from './components/Game.jsx';
import NavComp from './components/NavComp.jsx';
import NewGame from './components/NewGame.jsx';
import {LoginComp} from './components/LoginComp.jsx';
import API from './API.mjs';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [newGameData, setNewGameData] = useState({});

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
        // here we call the logout function from the API
        await API.logOut();
        // here we set the logged in state to false
        setLoggedIn(false);
        setUser(null);
    };

    const loggedInSuccess = (user) => {
        setLoggedIn(true);
        setUser(user);
    }

    return (
        <div className="min-vh-100 d-flex flex-column">
            <NavComp loggedIn={loggedIn} handleLogout={handleLogout}/>
            <Container fluid className="flex-grow-1 d-flex flex-column">
                <Routes>
                    <Route path="/" element={<Game userId={user?.id} setNewGameData={setNewGameData}/>}/>
                    <Route path='/newgame' element={<NewGame loggedIn={loggedIn} newGameData={newGameData}/>}/>
                    <Route path='/login' element={
                        <LoginComp loggedInSuccess={loggedInSuccess}/>
                    }/>
                </Routes>
            </Container>
        </div>
    );
}

export default App;