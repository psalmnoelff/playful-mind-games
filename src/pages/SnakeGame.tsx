import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

// Game constants
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// Apple types with different scores
const APPLE_TYPES = [
  { color: "#ff0000", score: 1 }, // Regular apple
  { color: "#ffd700", score: 3 }, // Golden apple (rare)
];

interface Position {
  x: number;
  y: number;
}

interface Apple extends Position {
  type: number;
}

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [apple, setApple] = useState<Apple>({ x: 5, y: 5, type: 0 });
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const { toast } = useToast();

  // Generate new apple position
  const generateApple = () => {
    const newApple: Apple = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
      type: Math.random() < 0.2 ? 1 : 0, // 20% chance for golden apple
    };
    return newApple;
  };

  // Check for collisions
  const checkCollision = (head: Position) => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Self collision
    for (const segment of snake.slice(1)) {
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }

    return false;
  };

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Check for collision
        if (checkCollision(head)) {
          setGameOver(true);
          toast({
            title: "Game Over!",
            description: `Final Score: ${score}`,
            variant: "destructive",
          });
          clearInterval(gameLoop);
          return prevSnake;
        }

        // Check for apple collision
        if (head.x === apple.x && head.y === apple.y) {
          setScore((prev) => prev + APPLE_TYPES[apple.type].score);
          setApple(generateApple());
          return [head, ...prevSnake];
        }

        return [head, ...prevSnake.slice(0, -1)];
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [direction, gameOver, apple, score, toast]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = "#22c55e";
    snake.forEach(({ x, y }) => {
      ctx.fillRect(
        x * CELL_SIZE,
        y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    });

    // Draw apple
    ctx.fillStyle = APPLE_TYPES[apple.type].color;
    ctx.fillRect(
      apple.x * CELL_SIZE,
      apple.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );
  }, [snake, apple]);

  // Reset game
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: 0 });
    setApple(generateApple());
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container py-12">
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 block">
          ← Back to Home
        </Link>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-game-snake">
            Snake Game
          </h1>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="text-2xl mb-4">Score: {score}</div>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="border border-gray-200 mx-auto mb-4"
            />
            {gameOver && (
              <Button onClick={resetGame} className="w-full">
                Play Again
              </Button>
            )}
            <div className="mt-4 text-sm text-gray-600">
              Use arrow keys to control the snake. Golden apples are worth 3 points!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;