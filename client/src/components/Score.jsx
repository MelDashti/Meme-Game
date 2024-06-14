import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import API from '../API'; // Adjust the import path as necessary

export default function Score({ gameId }) {
    const [score, setScore] = useState(0);
    const [rounds, setRounds] = useState([]);
    const [summary, setSummary] = useState([]);

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                console.log("fetching rounds")
                console.log(gameId)
                const roundsData = await API.getRoundsForGame(gameId);
                setRounds(roundsData);
                const totalScore = roundsData.reduce((acc, round) => acc + round.score, 0);
                setScore(totalScore);
                setSummary(roundsData.filter(round => round.score > 0));
            } catch (error) {
                console.error('Error fetching rounds:', error);
            }
        };

        fetchRounds();
    }, [gameId]);

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            <Card className="w-100 mb-3" style={{ maxWidth: '800px' }}>
                <Card.Body className="text-center">
                    <h2>Your Total Score: {score}</h2>
                    <h3>Game Summary:</h3>
                    <Row>
                        {summary.map((round, index) => (
                            <Col xs={12} md={6} className="mb-2" key={index}>
                                <Card>
                                    <Card.Body>
                                        <p>Meme: <img src={round.memeUrl} alt="Meme" style={{ maxWidth: '100%' }} /></p>
                                        <p>Selected Caption: {round.selectedCaption}</p>
                                        <p>Score: {round.score}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}