import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Score from './Score'; // Import the Score component
import API from '../API.mjs';

export default function NewGame({ loggedIn, userId }) {
    const [usedMemes, setUsedMemes] = useState([]);
    const [imgUrl, setImgUrl] = useState('');
    const [quotes, setQuotes] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [totalRound, setTotalRound] = useState(loggedIn ? 3 : 1);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [timeLeft, setTimeLeft] = useState(6);
    const [showScore, setShowScore] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const [message, setMessage] = useState('');
    const [gameId, setGameId] = useState(null);
    const [memeId, setMemeId] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);

    const gameCreated = useRef(false); // Track if game is created
    const roundCreated = useRef(false); // Track if round is created

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        if (!gameCreated.current) {
            gameCreated.current = true;
            createNewGame();
        }
    }, [loggedIn]);

    const createNewGame = async () => {
        try {
            const game = await API.createGame(userId||null);
            setGameId(game.gameId);
            if (game.gameId) {
                startNewRound();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const startNewRound = async () => {
        setCurrentRound((prevRound) => prevRound + 1);
        setTimeLeft(6);
        setSelectedQuote(null);
        setMessage('');
        roundCreated.current = false;

        try {
            const { meme, captions } = await API.getRandomMeme(usedMemes);
            setImgUrl(meme.url);
            setQuotes(captions.map((caption) => caption.text));
            setMemeId(meme.id);
            setUsedMemes((prevUsedMemes) => [...prevUsedMemes, meme.id]);

            const bestCaptionResponse = await API.getBestCaption(meme.id);
            const bestCaptions = bestCaptionResponse.bestCaption.map((caption) => caption.text);
            setCorrectAnswers(bestCaptions);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else if (timeLeft === 0 && !roundCreated.current) {
            roundCreated.current = true;
            handleRoundEnd();
        }
    }, [timeLeft]);

    const handleRoundEnd = () => {
        let roundScore = 0;
        if (correctAnswers.includes(selectedQuote)) {
            setTotalScore((prevScore) => prevScore + 5);
            roundScore = 5;
            setMessage(`Round ${currentRound} finished! 5 points added to your score.`);
        } else {
            setMessage(`Round ${currentRound} finished! Incorrect answer. The correct answers were: ${correctAnswers.join(' and ')}`);
        }

        createRound(roundScore);

        setTimeout(() => {
            if (currentRound < totalRound) {
                startNewRound();
            } else {
                completeGame();
                setGameFinished(true);
            }
        }, 4000);
    };

    const completeGame = async () => {
        try {
            await API.completeGame(gameId, totalScore);
            setShowScore(true);
        } catch (error) {
            console.log(error);
        }
    };

    const createRound = async (roundScore) => {
        try {
            await API.createRound(gameId, memeId, selectedQuote, roundScore);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSelect = (quote) => {
        setSelectedQuote(quote);
    };

    const handleExitGame = async () => {
        try{
            if(!loggedIn || !gameFinished){
                console.log("deleting game");
                await API.deleteGame(gameId);
            }
        navigate('/'); // Navigate to the home page 
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            {showScore ? (
                <Score gameId={gameId} />
            ) : (
                <Card className="w-100 mb-3" style={{ maxWidth: '800px', position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px'
                    }}>
                        Round {currentRound}
                    </div>
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px'
                    }}>
                        {timeLeft} seconds left
                    </div>
                    <Card.Img variant="top" src={imgUrl} className="d-block mx-auto" style={{ maxWidth: '400px' }} />
                    <Card.Body className="text-center">
                        <p>Guess the caption that best fits the meme</p>
                        <Row>
                            {quotes.map((quote, index) => (
                                <Col xs={12} md={6} className="mb-2" key={index}>
                                    <Button
                                        variant="outline-secondary"
                                        className={`w-100 ${selectedQuote === quote ? 'active' : ''}`}
                                        onClick={() => handleSelect(quote)}
                                    >
                                        {quote}
                                    </Button>
                                </Col>
                            ))}
                        </Row>
                        {message && (
                            <Alert variant={correctAnswers.includes(selectedQuote) ? 'success' : 'danger'} className="mt-3">
                                {message}
                            </Alert>
                        )}
                    </Card.Body>
                </Card>
            )}
            <Button variant="danger" onClick={handleExitGame} className="mt-3">
                Exit Game
            </Button>
        </Container>
    );
}