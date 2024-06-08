import { useState } from "react";
import MemeRound from "./MemeRound";
import GameSummary from "./GameSummary";

export default function Game() {
    const [score, setScore] = useState(0);
    const[round, setRound] = useState(0);
    const[results, setResults] = useState([]);
    
    const handleRoundEnd = (points, meme, caption) =>{
        setScore(score + points);
        setResults([...results, {meme, caption, points}]);
        setRound(round + 1);
        if(round<3){
            setRound(round+1);
        }
        else {
            setRound(0); // game ends after 3 rounds
        }
    }

    return (
        <div className="game-container">
          {round > 0 ? (
            <MemeRound round={round} onRoundEnd={handleRoundEnd} />
          ) : (
            <GameSummary score={score} results={results} />
          )}
        </div>
    );
}

