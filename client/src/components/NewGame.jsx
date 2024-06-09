import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Score from './Score'; // Import the Score component

export default function NewGame() {
    const quotes = [
        "When someone explains something to you and you still don't get it.",
        "When you hear someone say something completely ridiculous.",
        "When you realize you’ve been doing something wrong your whole life.",
        "When you see the price of something you thought was on sale.",
        "When someone says they don’t like pizza.",
        "When you walk into a room and forget why you went in there.",
        "When you hear a conspiracy theory that actually makes sense."
    ];

    const images = [
        "/images/meme1.jpg",
        "/images/meme2.jpg",
        "/images/meme3.jpg",
        "/images/meme4.jpg",
        "/images/meme5.jpg",
        "/images/meme6.jpg",
        "/images/meme7.jpg",
        "/images/meme8.jpg",
        "/images/meme9.jpg"
    ];

    const correctAnswers = [
        "When someone explains something to you and you still don't get it.",
        "When you hear someone say something completely ridiculous."
    ];

    const [imgUrl, setImgUrl] = useState(images[0]);
    const [isLogged, setIsLogged] = useState(true);
    const [round, setRound] = useState(isLogged ? 1 : 3);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else {
            if (round < 3) {
                if (correctAnswers.includes(selectedQuote)) {
                    setScore(score + 5);
                    setMessage(`Round ${round} finished! 5 points added to your score.`);
                } else {
                    setMessage(`Round ${round} finished! Incorrect answer. The correct answers were: ${correctAnswers.join(' and ')}`);
                }
                setTimeout(() => {
                    setRound(round + 1);
                    setTimeLeft(30);
                    setImgUrl(images[round]);
                    setSelectedQuote(null);
                    setMessage('');
                }, 3000); // Show the message for 3 seconds before moving to the next round
            } else {
                setShowScore(true);
            }
        }
    }, [timeLeft, round, images, correctAnswers, selectedQuote, score]);

    const handleSelect = (quote) => {
        setSelectedQuote(quote);
    };

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            {showScore ? (
                <Score score = {score} correctAnswers={correctAnswers} selectedQuote={selectedQuote} />
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
                        Round {round}
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