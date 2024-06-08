import React, { useState, useEffect } from 'react';
import { Button, Card, Container, Row, Col, ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const MemeRound = ({ round, onRoundEnd }) => {
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    fetchMemeAndCaptions();
    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(countdown);
  }, [round]);

  useEffect(() => {
    if (timer === 0) {
      onRoundEnd(0, meme, null);
    }
  }, [timer, onRoundEnd, meme]);

  const fetchMemeAndCaptions = async () => {
    const response = await fetchMemeAPI();
    setMeme(response.meme);
    setCaptions(response.captions);
  };

  const handleCaptionSelect = (caption) => {
    const isCorrect = checkCorrectCaption(caption);
    onRoundEnd(isCorrect ? 5 : 0, meme, caption);
  };

  const checkCorrectCaption = (caption) => {
    // Placeholder logic to check if the caption is correct
    return meme.correctCaptions.includes(caption);
  };

  return (
    <Container className="my-4">
      {meme && (
        <Card className="text-center">
          <Card.Header>Round {round}</Card.Header>
          <Card.Body>
            <Card.Img variant="top" src={meme.url} alt="Meme" />
            <ProgressBar now={(timer / 30) * 100} className="my-3" />
            <Row>
              {captions.map((caption, index) => (
                <Col key={index} xs={12} md={6} lg={4} className="my-2">
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => handleCaptionSelect(caption)}
                  >
                    {caption}
                  </Button>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MemeRound;
