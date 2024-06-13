import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Score from './Score'; // Import the Score component
import API from '../API.mjs';

export default function NewGame({ loggedIn, userId }) {
    const [imgUrl, setImgUrl] = useState('');
    const [quotes, setQuotes] = useState([]);
    const [currentRound, setCurrentRound] = useState();
    const [totalRound, setTotalRound] = useState(loggedIn ? 3 : 1);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [message, setMessage] = useState('');
    const [gameId, setGameId] = useState(null);
    const [memeId, setMemeId] = useState(null);

    
    useEffect(() => {
        const createNewGame = async () => {
            if (loggedIn) {
                try {
                    const game = await API.createGame(userId);
                    setGameId(game.gameId);
                    if (game.gameId) {
                        setCurrentRound(1);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };
        createNewGame();
    }, []); 

    
    useEffect(() => {
        const fetchMeme = async () => {
            try {
                // fetches a meme url and the quotes
                const { meme, captions } = await API.getRandomMeme();
                setImgUrl(meme.url);
                setQuotes(captions.map((caption) => caption.text));
                setMemeId(meme.id);
                // Fetch the best caption for the meme
                const bestCaptionResponse = await API.getBestCaption(meme.id);
                const bestCaptions = bestCaptionResponse.bestCaption.map((caption) => caption.text);
                setCorrectAnswers(bestCaptions);
            } catch (error) {
                console.log(error);
            }
        };
    
        const createRound = async () => {
            try {
                console.log(gameId, memeId, selectedQuote, totalScore);
                await API.createRound(gameId, memeId, selectedQuote, totalScore);
            } catch (error) {
                console.log(error);
            }
        };
    
        if(gameId && memeId){
            fetchMeme().then(createRound);
        }
    }, [currentRound]); // every time the round changes, fetch a new meme

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000); // 1 second interval. 
            return () => clearInterval(timerId); // clean up the interval when the component unmounts
        }
    }, [timeLeft]);

    const completeGame = async () => {
         try {
            await API.completeGame(gameId, totalScore);
            setShowScore(true);
        } catch (error) {
            console.log(error);
        }
    };


    // here we check if the time is up and if the answer is correct. 
    useEffect(() => { // handling timer expiry.
        if (timeLeft === 0) {
            if (currentRound <= totalRound) {
                if (correctAnswers.includes(selectedQuote)) {
                    setTotalScore((prevScore) => prevScore + 5);
                    setScore(5);
                    setMessage(`Round ${currentRound} finished! 5 points added to your score.`);
                } else {
                    setMessage(`Round ${currentRound} finished! Incorrect answer. The correct answers were: ${correctAnswers.join(' and ')}`);
                    setScore(0);
                }
                // setTimeout used to introduce delay before starting the next round.
                setTimeout(() => { // so that user can see the message before the next round starts.
                    // here we create a new round, and reset the time left to 30.
                    setCurrentRound((prevRound) => prevRound + 1);
                    setScore(0);
                    setTimeLeft(30);
                    setSelectedQuote(null);
                    setMessage('');
                }, 4000); // Show the message for 4 seconds before moving to the next round
            } else {
                completeGame(); // if all the rounds are finished we complete the game and set the score.
            }
        }
    }, [timeLeft, correctAnswers, selectedQuote, currentRound, totalRound]);

    const handleSelect = (quote) => {
        setSelectedQuote(quote);
    };

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            {showScore ? (
                <Score score={totalScore} correctAnswers={correctAnswers} selectedQuote={selectedQuote} />
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
        </Container>
    );
}
