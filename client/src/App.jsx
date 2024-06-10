import React from 'react';
import {Container} from 'react-bootstrap';
import {Routes, Route} from 'react-router-dom';
import Profile from './Components/Profile.jsx';
import Game from './Components/Game.jsx';
import NavComp from './Components/NavComp.jsx';
import NewGame from './Components/NewGame.jsx';


function App() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <NavComp/>
                <Container fluid className="flex-grow-1 d-flex flex-column">
                    <Routes>
                        <Route path="/" element={<Game/>}/>
                        <Route path='/newgame' element={<NewGame/>}/>
                        <Route path="/profile" element={<Profile/>}/>
                    </Routes>
                </Container>
        </div>
);
}

export default App;