import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import memeImage from './meme.jpg';
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

    const correctAnswers = [
        "When someone explains something to you and you still don't get it.",
        "When you hear someone say something completely ridiculous."
    ];

    const [selectedQuote, setSelectedQuote] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showScore, setShowScore] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else {
            setShowScore(true);
        }
    }, [timeLeft]);

    const handleSelect = (quote) => {
        setSelectedQuote(quote);
    };

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            {showScore ? (
                <Score correctAnswers={correctAnswers} selectedQuote={selectedQuote} />
            ) : (
                <Card className="w-100 mb-3" style={{ maxWidth: '800px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '5px 10px', borderRadius: '5px' }}>
                        {timeLeft} seconds left
                    </div>
                    <Card.Img variant="top" src={memeImage} className="d-block mx-auto" style={{ maxWidth: '400px' }} />
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
            )}
        </Container>
    );
}