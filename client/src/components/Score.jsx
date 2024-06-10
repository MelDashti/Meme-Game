import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

export default function Score({score, correctAnswers, selectedQuote }) {


    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            <Card className="w-100 mb-3" style={{ maxWidth: '800px' }}>
                <Card.Body className="text-center">
                    <h2>Your Score: {score}</h2>
                    <p>You selected: {selectedQuote}</p>
                    <h3>Correct Answers:</h3>
                    <Row>
                        {correctAnswers.map((answer, index) => (
                            <Col xs={12} md={6} className="mb-2" key={index}>
                                <Card>
                                    <Card.Body>{answer}</Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}