import { useState, useCallback } from "react";

export default function useRunnerState() {
  const [playerY, setPlayerY] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = useCallback(() => setGameStarted(true), []);
  const resetGame = useCallback(() => {
    setIsGameOver(false);
    setScore(0);
    setObstacles([]);
    setGameStarted(false);
  }, []);
  const handleJump = useCallback(() => {}, []);

  return { playerY, obstacles, score, isGameOver, gameStarted, startGame, resetGame, handleJump };
}