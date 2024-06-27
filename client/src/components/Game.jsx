import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Card, Col, Container, Row} from "react-bootstrap";
import API from '../API.mjs';

export default function Game(props) {
    const {userId, setNewGameData} = props;
    const [games, setGames] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchGameSummary = async () => {
            try {
                const games = await API.getAllGamesForUser(userId);
                const gamesWithRounds = await Promise.all(games.map(async (game) => {
                    const rounds = await API.getRoundsForGame(game.id);
                    const totalScore = rounds.reduce((acc, round) => acc + round.score, 0);
                    return {...game, rounds, totalScore};
                }));
                setGames(gamesWithRounds);
            } catch (error) {
                console.log(error);
            }
        };
        if (userId) {
            fetchGameSummary();
        }
    }, [userId]);

    const createNewGame = async () => {
        try {
            const {gameId, rounds} = await API.createGameWithRound(userId || null);
            const newGameData = {
                gameId,
                rounds: rounds.map(round => ({
                    roundId: round.roundId,
                    memeUrl: round.meme.url,
                    memeId: round.meme.id,
                    captions: round.captions,
                })),
            };
            setNewGameData(newGameData);
            navigate("/newgame");
        } catch (error) {
            console.error("Error in createNewGame:", error);
        }
    }


    return (
        <Container className="mt-5">
            <Row className="mb-4 justify-content-center">
                <Col xs={12} md={8} className="text-center">
                    <Button variant="success" size="lg" onClick={createNewGame}>Start New Game</Button>
                </Col>
            </Row>
            {userId && <Row className="mb-4 justify-content-center">
                <Col xs={12} md={8} className="text-center">
                    <h2 className="text-dark">Total Score: {games.reduce((acc, game) => acc + game.totalScore, 0)}</h2>
                </Col>
            </Row>}
            {userId && games.map((game, gameIndex) => (
                <Row key={gameIndex} className="mb-4 justify-content-center">
                    <Col xs={12} md={8}>
                        <Card className="mb-3 shadow">
                            <Card.Header
                                className="bg-secondary text-white text-center">  {/* Changed to bg-dark for a navy-like blue */}
                                <h5>Game {gameIndex + 1} - Total Score: {game.totalScore}</h5>
                            </Card.Header>
                            <Card.Body className="bg-light">
                                <Row>
                                    {game.rounds.map((round, roundIndex) => (
                                        <Col key={roundIndex} xs={12} sm={6} md={4} className="mb-3">
                                            <Card className="h-100 bg-light">
                                                <Card.Img variant="top" src={round.memeUrl || 'default-image-url.jpg'}
                                                          alt="Meme" onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'default-image-url.jpg';
                                                }}/>
                                                <Card.Body>
                                                    <Card.Title
                                                        className="text-secondary">Round {roundIndex + 1}</Card.Title>
                                                    <Card.Text><strong>Selected
                                                        Caption:</strong> {round.selectedCaption}</Card.Text>
                                                    <Card.Text><strong>Points:</strong> {round.score}</Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ))}
        </Container>
    );
}