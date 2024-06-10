import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Score from './Score'; // Import the Score component
import API from '../API.mjs';



export default function NewGame() {

    const [imgUrl, setImgUrl] = useState('');
    const [quotes, setQuotes] = useState([]);
    const [isLogged, setIsLogged] = useState(true);
    const [round, setRound] = useState(isLogged ? 1 : 3);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(()=>{
        const fetchMeme = async() =>{
            try{
                // fetches a meme url and the quotes
                const {meme,captions} = await API.getRandomMeme();
                setImgUrl(meme.url);   
                setQuotes(captions.map((caption)=>caption.text));

                // Fetch the best caption for the meme
                const bestCaptionResponse = await API.getBestCaption(meme.id);
                console.log(bestCaptionResponse);
                // we get the best caption from the response
                console.log('hello');
                console.log(bestCaptionResponse.bestCaption);
                const bestCaptions = bestCaptionResponse.bestCaption.map(caption => caption.text);
                setCorrectAnswers(bestCaptions); 
            } catch(error){
                console.log(error);
            }
        };
        fetchMeme();
    }, [round]); // every time the round changes, fetch a new meme
    

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
                    setSelectedQuote(null);
                    setMessage('');
                }, 3000); // Show the message for 3 seconds before moving to the next round
            } else {
                setShowScore(true);
            }
        }
    }, [timeLeft, round, correctAnswers, selectedQuote, score]);

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