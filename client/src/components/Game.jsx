import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import API from '../API.mjs';

export default function Game({ userId }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [score, setScore] = useState(0);
    const [games, setGames] = useState([]);

    useEffect(() => {
        const fetchGameSummary = async () => {
            try {
                const games = await API.getAllGamesForUser(userId);
                console.log("Fetched games:", games); // Log fetched games
                const gamesWithRounds = await Promise.all(games.map(async (game) => {
                    const rounds = await API.getRoundsForGame(game.id);
                    console.log(`Fetched rounds for game ${game.id}:`, rounds); // Log fetched rounds
                    return { ...game, rounds };
                }));
                setGames(gamesWithRounds);
            } catch (error) {
                console.log(error);
            }
        };
        fetchGameSummary();
    }, [userId]);

    
    
    

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            <Row className="mb-4">
                <Col className="text-center">
                    <Link to="/newGame">
                        <Button variant="primary" size="lg">
                            Start New Game
                        </Button>
                    </Link>
                </Col>
            </Row>
            <Row className="w-100">
                <Col md={{ span: 8, offset: 2 }}>
                    <Card className="mb-4">
                        <Card.Header className="text-center">
                            Game Summary
                        </Card.Header>
                        <Card.Body>
                            <Container className="my-4">
                                {games.map((game, gameIndex) => (
                                    <Card key={gameIndex} className="mb-4">
                                        <Card.Header className="text-center">
                                            Total Score: {game.totalScore}
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                {game.rounds.map((round, roundIndex) => (
                                                    <Col key={roundIndex} xs={12} md={6} lg={4} className="my-2">
                                                        <Card className="h-100">
                                                            <Card.Img 
                                                                variant="top" 
                                                                src={round.memeUrl || 'default-image-url.jpg'} 
                                                                alt="Meme" 
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'default-image-url.jpg'; }}
                                                            />
                                                            <Card.Body>
                                                                <Card.Text><strong>Selected Caption:</strong> {round.selectedCaption}</Card.Text>
                                                                <Card.Text><strong>Points:</strong> {round.score}</Card.Text>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </Container>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}