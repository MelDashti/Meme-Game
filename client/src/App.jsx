import React from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Profile from './Components/Profile.jsx';
import Game from './Components/Game.jsx';

function App() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Container fluid className="flex-grow-1 d-flex flex-column">
                <Routes>
                    <Route path="/" element={<Game/>} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Container>
        </div>
    );
}

export default App;