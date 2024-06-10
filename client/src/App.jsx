import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, Navigate } from 'react-router-dom';
import Profile from './components/Profile.jsx';
import Game from './components/Game.jsx';
import NavComp from './components/NavComp.jsx';
import NewGame from './components/NewGame.jsx';
import { LoginComp, LogoutButton } from './components/LoginComp.jsx';
import API from './API.mjs';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const user = await API.getUserInfo(); // we have the user info here
            setLoggedIn(true);
            setUser(user);
        };
        checkAuth();
    }, []);

    // here we handle the login 
    const handleLogin = async (credentials) => {
        try {
            const user = await API.login(credentials);
            setLoggedIn(true);
            setMessage({ msg: `Welcome, ${user.name}!`, type: 'success' });
            setUser(user);
        } catch (error) {
            setMessage({ msg: error.message, type: 'danger' });
        }
    };

    // this will handle the logout
    const handleLogout = async () => {
        // here we call the logout function from the API
        await API.logOut();
        // here we set the logged in state to false
        setLoggedIn(false);
        setMessage('');
    };

    return (
        <div className="min-vh-100 d-flex flex-column">
            <NavComp loggedIn={loggedIn} handleLogout={handleLogout} />
            <Container fluid className="flex-grow-1 d-flex flex-column">
                <Routes>
                    <Route path="/" element={<Game />} />
                    <Route path='/newgame' element={<NewGame />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path='/login' element={
                        loggedIn ? <Navigate replace to='/' /> : <LoginComp login={handleLogin} />
                    } />
                </Routes>
            </Container>
        </div>
    );
}

export default App;