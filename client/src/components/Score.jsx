import React, {useEffect, useState} from 'react';
import {Button, Card, Col, Container, Row} from 'react-bootstrap';
import API from '../API'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';

export default function Score({gameId}) {
    const [score, setScore] = useState(0);
    const [summary, setSummary] = useState([]);
    const navigate = useNavigate();

    // function for fetching the rounds for a game and calculating the total score
    useEffect(() => {
        const fetchRounds = async () => {
            try {
                const roundsData = await API.getRoundsForGame(gameId);
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
            <Card className="w-100 mb-3" style={{maxWidth: '800px'}}>
                <Card.Body className="text-center">
                    <h2>Your Total Score: {score}</h2>
                    <Row className="g-4">
                        {summary.map((round, index) => (
                            <Col xs={12} md={6} key={index}>
                                <Card>
                                    <Card.Img variant="top" src={round.memeUrl} alt="Meme"
                                              style={{width: '100%', height: 'auto', objectFit: 'contain'}}/>
                                    <Card.Body>
                                        <Card.Title>Selected Caption</Card.Title>
                                        <Card.Text>{round.selectedCaption}</Card.Text>
                                        <Card.Text><strong>Score:</strong> {round.score}</Card.Text>
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