import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Card, Col, Container, Modal, Row} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'; // Import useNavigate
import Score from './Score'; // Import the Score component
import API from '../API.mjs';

export default function NewGame({loggedIn, newGameData}) {

    const [imgUrl, setImgUrl] = useState('');
    const [quotes, setQuotes] = useState([]);
    const [currentRound, setCurrentRound] = useState(1);
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
    const [roundId, setRoundId] = useState(null);

    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        startNewRound();
    }, [currentRound]); // Add currentRound as a dependency

    // Function to start a new round
    const startNewRound = async () => {
        setSelectedQuote(null);
        setCorrectAnswers([]);
        setTimeLeft(5);
        setMessage('');
        const roundData = newGameData.rounds[currentRound - 1]; // Adjust index for 0-based array
        setRoundId(roundData.roundId);
        setGameId(newGameData.gameId);
        setImgUrl(roundData.memeUrl);
        setQuotes(roundData.captions.map(caption => caption.text)); // Directly set captions
        setMemeId(roundData.memeId);
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            setTimerId(timerId);
            return () => clearInterval(timerId);
        } else if (timeLeft === 0) {
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
            await API.completeRound(roundId, selectedQuote, roundScore);
        } catch (error) {
            console.log("Error in completeRound:", error);
        }
    };

    // Function to handle caption selection
    const handleSelect = (quote) => {
        setSelectedQuote(quote);
        clearInterval(timerId); // Clear the timer
        handleRoundEnd(quote); // Pass the selected quote to handleRoundEnd
    };

    // Function to handle exit game
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

    // Function to handle modal close
    const handleCloseModal = () => {
        setShowModal(false); // Close the modal
        if (currentRound < totalRound) {
            setCurrentRound((prevRound) => prevRound + 1);
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
                           