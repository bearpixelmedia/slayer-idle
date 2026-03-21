import { useState, useEffect, useCallback, useRef } from "react";

const GRAVITY = 0.5;
const JUMP_STRENGTH = -12;
const GROUND_Y = 70;
const PLAYER_SIZE = 20;
const OBSTACLE_WIDTH = 15;
const OBSTACLE_HEIGHT = 25;
const OBSTACLE_SPEED = 8;
const OBSTACLE_SPAWN_RATE = 2000; // ms

export default function useRunnerState() {
  const [playerY, setPlayerY] = useState(GROUND_Y);
  const [playerVelocity, setPlayerVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameStateRef = useRef({ playerY, playerVelocity, isJumping, obstacles, score, isGameOver });
  gameStateRef.current = { playerY, playerVelocity, isJumping, obstacles, score, isGameOver };

  // Physics tick
  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const interval = setInterval(() => {
      setPlayerY((prevY) => {
        let newVel = gameStateRef.current.playerVelocity + GRAVITY;
        let newY = gameStateRef.current.playerY + newVel;

        // Ground collision
        if (newY >= GROUND_Y) {
          newY = GROUND_Y;
          newVel = 0;
          setIsJumping(false);
        }

        setPlayerVelocity(newVel);
        return newY;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [gameStarted, isGameOver]);

  // Obstacle spawning
  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const interval = setInterval(() => {
      setObstacles((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: 100,
          scored: false,
        },
      ]);
    }, OBSTACLE_SPAWN_RATE);

    return () => clearInterval(interval);
  }, [gameStarted, isGameOver]);

  // Obstacle movement and collision detection
  useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const interval = setInterval(() => {
      setObstacles((prev) => {
        let updated = prev
          .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
          .filter((obs) => obs.x > -OBSTACLE_WIDTH);

        // Collision detection and blocking
        const playerX = 20;
        let blockedByObstacle = false;

        updated.forEach((obs) => {
          const collidingX = playerX < obs.x + OBSTACLE_WIDTH && playerX + PLAYER_SIZE > obs.x;
          const collidingY =
            gameStateRef.current.playerY < GROUND_Y - OBSTACLE_HEIGHT + 5 &&
            gameStateRef.current.playerY + PLAYER_SIZE > GROUND_Y - OBSTACLE_HEIGHT;

          // If player hits obstacle at ground level, block forward movement
          if (collidingX && collidingY) {
            setIsGameOver(true);
            blockedByObstacle = true;
          }
          
          // If obstacle is right in front of player at ground level, stop it from moving past
          const obstacleApproaching = obs.x > playerX && obs.x < playerX + 40;
          const atGroundLevel = gameStateRef.current.playerY >= GROUND_Y - 2;
          
          if (obstacleApproaching && atGroundLevel && collidingX) {
            // Push obstacle back to maintain collision boundary
            obs.x = playerX + PLAYER_SIZE + 2;
          }
        });

        // Scoring: +1 point per obstacle passed
        const newScored = [];
        updated.forEach((obs) => {
          if (!obs.scored && obs.x < 20) {
            newScored.push(obs.id);
            setScore((s) => s + 1);
          }
        });

        return newScored.length > 0
          ? updated.map(obs => newScored.includes(obs.id) ? { ...obs, scored: true } : obs)
          : updated;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [gameStarted, isGameOver]);

  // Jump input handling
  const handleJump = useCallback(() => {
    if (isGameOver || !gameStarted) return;
    if (gameStateRef.current.playerY >= GROUND_Y - 2) {
      setPlayerVelocity(JUMP_STRENGTH);
      setIsJumping(true);
    }
  }, [isGameOver, gameStarted]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleJump]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setPlayerY(GROUND_Y);
    setPlayerVelocity(0);
    setObstacles([]);
    setScore(0);
    setIsGameOver(false);
  }, []);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setPlayerY(GROUND_Y);
    setPlayerVelocity(0);
    setObstacles([]);
    setScore(0);
    setIsGameOver(false);
  }, []);

  return {
    playerY,
    obstacles,
    score,
    isGameOver,
    gameStarted,
    handleJump,
    startGame,
    resetGame,
  };
}