import React from 'react';
import { Card, Container, Button, Row, Col } from 'react-bootstrap';

const GameSummary = ({ score, results }) => {
  return (
    <Container className="my-4">
      <Card>
        <Card.Header>Game Summary</Card.Header>
        <Card.Body>
          <h4>Total Score: {score}</h4>
          <Row>
            {results.map((result, index) => (
              <Col key={index} xs={12} md={6} lg={4} className="my-2">
                <Card>
                  <Card.Img variant="top" src={result.meme.url} alt="Meme" />
                  <Card.Body>
                    <Card.Text>Selected Caption: {result.caption}</Card.Text>
                    <Card.Text>Points: {result.points}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Button onClick={() => window.location.reload()} className="mt-3">
            Start New Game
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GameSummary;
