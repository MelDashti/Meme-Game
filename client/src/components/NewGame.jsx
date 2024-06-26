import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Card, Col, Container, Modal, Row} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'; // Import useNavigate
import Score from './Score'; // Import the Score component
import API from '../API.mjs';

export default function NewGame({loggedIn, userId}) {

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
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [gameId, setGameId] = useState(null);
    const [memeId, setMemeId] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);
    const [timerId, setTimerId] = useState(null);

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
            const game = await API.createGame(userId || null);
            setGameId(game.gameId);
            if (game.gameId) {
                startNewRound();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const startNewRound = async () => {
        setSelectedQuote(null);
        setQuotes([]);
        setCurrentRound((prevRound) => prevRound + 1);
        setTimeLeft(5);
        setMessage('');
        roundCreated.current = false;

        try {
            const {meme, captions} = await API.getRandomMeme(usedMemes);
            setImgUrl(meme.url);
            setQuotes(captions.map(caption => caption.text)); // Directly set captions
            setMemeId(meme.id);
            setUsedMemes((prevUsedMemes) => [...prevUsedMemes, meme.id]);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            setTimerId(timerId);
            return () => clearInterval(timerId);
        } else if (timeLeft === 0 && !roundCreated.current) {
            roundCreated.current = true;
            handleRoundEnd(selectedQuote); // Pass selectedQuote to handleRoundEnd
        }
    }, [timeLeft]);

    const handleRoundEnd = async (selectedQuote) => {
        let roundScore = 0;
        try {
            const bestCaptionResponse = await API.getBestCaption(memeId);
            const bestCaptions = bestCaptionResponse.bestCaption.map((caption) => caption.text);
            setCorrectAnswers(bestCaptions);
            if (bestCaptions.includes(selectedQuote)) {
                setTotalScore((prevScore) => prevScore + 5);
                roundScore = 5;
                setMessage(`Round ${currentRound} finished!`);
            } else {
                setMessage(`Round ${currentRound} finished! Incorrect answer. The correct answers were: ${bestCaptions.join(' and ')}`);
            }
            setShowModal(true); // Show the modal when message is set
            await completeRound(roundScore, selectedQuote); // Pass selectedQuote to createRound
        } catch (error) {
            console.log(error);
        }
    };

    const completeGame = async () => {
        try {
            await API.completeGame(gameId, totalScore);
            setShowScore(true);
        } catch (error) {
            console.log(error);
        }
    };

    const completeRound = async (roundScore, selectedQuote) => {
        try {
            await API.createRound(gameId, memeId, selectedQuote, roundScore);
        } catch (error) {
            console.log(error);
        }
    };

    // this is for handling the caption selected! Where the caption selected is passed
    const handleSelect = (quote) => {
        setSelectedQuote(quote);
        if (!roundCreated.current) {
            roundCreated.current = true;
            clearInterval(timerId); // Clear the timer
            handleRoundEnd(quote); // Pass the selected quote to handleRoundEnd
        }
    };

    // this is for handling the exit game button!
    // this is for handling the exit game button!
    const handleExitGame = async () => {
        console.log("handleExitGame triggered"); // Debugging line
    
        try {
            if (gameId && (!loggedIn || !gameFinished)) {
                console.log("Deleting game with ID:", gameId); // Debugging line
                await API.deleteGame(gameId);
                console.log("Game deleted successfully"); // Debugging line
            }
        } catch (error) {
            console.log("Error in handleExitGame:", error); // Debugging line
        } finally {
            if (timerId) {
                clearInterval(timerId); // Clear the timer
                console.log("Timer cleared"); // Debugging line
            }
            console.log("Navigating to home page"); // Debugging line
            navigate('/'); // Navigate to the home page
        }
    };
    // this is for handling the close modal button!
    const handleCloseModal = () => {
        setShowModal(false); // Close the modal
        if (currentRound < totalRound) {
            startNewRound(); // Start the next round
        } else {
            completeGame();
            setGameFinished(true);
        }
    };

    return (
        <Container className="d-flex flex-column align-items-center mt-3">
            {showScore ? (
                <Score gameId={gameId}/>
            ) : (
                <>
                    <Card className="w-100 mb-3" style={{maxWidth: '800px', position: 'relative'}}>
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
                        <Card.Img variant="top" src={imgUrl} className="d-block mx-auto" style={{maxWidth: '400px'}}/>
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
                        </Card.Body>
                    </Card>
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Round Result</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Alert
                                variant={correctAnswers.includes(selectedQuote) ? 'success' : 'danger'}
                                className="text-center p-4 shadow rounded"
                                style={{
                                    background: correctAnswers.includes(selectedQuote) ? 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)' : 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                                    color: 'white',
                                }}
                            >
                                <h4 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{message.split('.')[0]}</h4>
                                <div style={{fontSize: '1.2rem', marginTop: '1rem'}}>
                                    {correctAnswers.includes(selectedQuote) ? (
                                        <span>5 points have been added to your score!</span>
                                    ) : (
                                        <>
                                            <span>The correct answers were:</span>
                                            <ul style={{textAlign: 'left', margin: '1rem 0', paddingLeft: '1.5rem'}}>
                                                {correctAnswers.map((answer, index) => (
                                                    <li key={index}>{answer}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </Alert>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
            <Button variant="danger" onClick={handleExitGame} className="mt-3 mb-5">
                Exit Game
            </Button>
        </Container>
    );
}
                           