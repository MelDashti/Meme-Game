import React, {useState} from "react";
import GameSummary from "./GameSummary";
import {Link} from "react-router-dom";
import {Button, Container, Row, Col, Card} from "react-bootstrap";

export default function Game() {
    // we also need a state to track if the user is logged in or anonymous
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [score, setScore] = useState(0);
    // if user is logged in we set the round to 3 else we set it to 0
    const [round, setRound] = useState(isLoggedIn ? 3 : 1);
    const [results, setResults] = useState([]);

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
                <Col md={{span: 8, offset: 2}}>
                    <Card>
                        <Card.Header className="text-center">
                            Game Summary
                        </Card.Header>
                        <Card.Body>
                            <GameSummary score={score} results={results}/>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}