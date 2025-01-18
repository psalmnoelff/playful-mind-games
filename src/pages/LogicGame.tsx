import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Direction = "up" | "down" | "left" | "right";
type Position = { x: number; y: number };
type Difficulty = "easy" | "medium" | "hard";

const CELL_SIZE = 32; // Fixed cell size

const getDifficultySettings = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "easy":
      return { cols: 10, rows: 10 };
    case "medium":
      return { cols: 15, rows: 15 };
    case "hard":
      return { cols: 30, rows: 30 };
    default:
      return { cols: 10, rows: 10 };
  }
};

const LogicGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [instructions, setInstructions] = useState<Direction[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const { cols: GRID_COLS, rows: GRID_ROWS } = getDifficultySettings(difficulty);

  // Game state
  const gameState = useRef({
    startPos: { x: 0, y: 0 },
    endPos: { x: 0, y: 0 },
    walls: [] as Position[],
    currentLevel: 1,
  });

  // Draw the map grid
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#D3E4FD";
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= GRID_COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, GRID_ROWS * CELL_SIZE);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= GRID_ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(GRID_COLS * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  };

  // Draw the game elements
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas with a map-like background
    ctx.fillStyle = "#F2FCE2";
    ctx.fillRect(0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);

    // Draw grid
    drawGrid(ctx);

    // Draw walls
    ctx.fillStyle = "#4A5568";
    gameState.current.walls.forEach(wall => {
      ctx.fillRect(
        wall.x * CELL_SIZE,
        wall.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

    // Draw start position
    ctx.fillStyle = "#8B5CF6";
    ctx.beginPath();
    ctx.arc(
      gameState.current.startPos.x * CELL_SIZE + CELL_SIZE / 2,
      gameState.current.startPos.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw end position
    ctx.fillStyle = "#D946EF";
    ctx.beginPath();
    ctx.arc(
      gameState.current.endPos.x * CELL_SIZE + CELL_SIZE / 2,
      gameState.current.endPos.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  // Check if position collides with a wall
  const checkWallCollision = (pos: Position) => {
    return gameState.current.walls.some(wall => 
      wall.x === pos.x && wall.y === pos.y
    );
  };

  // Execute the instructions
  const executeInstructions = async () => {
    if (isExecuting) return;
    setIsExecuting(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let currentPos: Position = { ...gameState.current.startPos };
    let path: Position[] = [{ ...currentPos }];
    let success = true;

    // Draw the path
    for (const instruction of instructions) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Animation delay

      // Update position based on instruction
      switch (instruction) {
        case "up":
          currentPos.y--;
          break;
        case "down":
          currentPos.y++;
          break;
        case "left":
          currentPos.x--;
          break;
        case "right":
          currentPos.x++;
          break;
      }

      // Check for collisions with walls and boundaries
      if (
        currentPos.x < 0 ||
        currentPos.x >= GRID_COLS ||
        currentPos.y < 0 ||
        currentPos.y >= GRID_ROWS ||
        checkWallCollision(currentPos)
      ) {
        success = false;
        toast({
          title: "Game Over",
          description: "You hit a wall! Try again.",
          variant: "destructive",
        });
        break;
      }

      path.push({ ...currentPos });

      // Redraw everything
      drawGame(ctx);

      // Draw path
      ctx.strokeStyle = "#33C3F0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(
        path[0].x * CELL_SIZE + CELL_SIZE / 2,
        path[0].y * CELL_SIZE + CELL_SIZE / 2
      );
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(
          path[i].x * CELL_SIZE + CELL_SIZE / 2,
          path[i].y * CELL_SIZE + CELL_SIZE / 2
        );
      }
      ctx.stroke();
    }

    // Check if reached the end
    if (
      currentPos.x === gameState.current.endPos.x &&
      currentPos.y === gameState.current.endPos.y
    ) {
      toast({
        title: "Success!",
        description: "Path completed successfully!",
      });
      setScore((prev) => prev + 100 * gameState.current.currentLevel);
      gameState.current.currentLevel++;
      generateNewLevel();
    } else if (success) {
      toast({
        title: "Game Over",
        description: "Wrong path! Try again.",
        variant: "destructive",
      });
      setGameOver(true);
    }

    setIsExecuting(false);
    setInstructions([]);
  };

  // Generate a new level with walls and random start/end positions
  const generateNewLevel = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear existing walls
    gameState.current.walls = [];

    // Generate random start position (on the left side)
    gameState.current.startPos = {
      x: 0,
      y: Math.floor(Math.random() * (GRID_ROWS - 2)) + 1,
    };

    // Generate random end position (on the right side)
    gameState.current.endPos = {
      x: GRID_COLS - 1,
      y: Math.floor(Math.random() * (GRID_ROWS - 2)) + 1,
    };

    // Generate random walls based on level and difficulty
    const baseWalls = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6;
    const numWalls = Math.min(baseWalls + gameState.current.currentLevel, GRID_COLS);
    
    for (let i = 0; i < numWalls; i++) {
      const wall = {
        x: Math.floor(Math.random() * (GRID_COLS - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_ROWS - 2)) + 1,
      };

      if (
        (wall.x !== gameState.current.startPos.x ||
          wall.y !== gameState.current.startPos.y) &&
        (wall.x !== gameState.current.endPos.x ||
          wall.y !== gameState.current.endPos.y)
      ) {
        gameState.current.walls.push(wall);
      }
    }

    drawGame(ctx);
  };

  // Reset game
  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    setInstructions([]);
    gameState.current.currentLevel = 1;
    generateNewLevel();
  };

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Set canvas size based on difficulty
    canvas.width = GRID_COLS * CELL_SIZE;
    canvas.height = GRID_ROWS * CELL_SIZE;

    generateNewLevel();
  }, [difficulty]); // Re-initialize when difficulty changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              ← Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-game-logic">
              Logic Programming
            </h1>
          </div>
          <div className="text-xl font-semibold">Score: {score}</div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Difficulty:</label>
            <ToggleGroup type="single" value={difficulty} onValueChange={(value: Difficulty) => {
              if (value) {
                setDifficulty(value);
                resetGame();
              }
            }}>
              <ToggleGroupItem value="easy" aria-label="Easy">
                Easy
              </ToggleGroupItem>
              <ToggleGroupItem value="medium" aria-label="Medium">
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem value="hard" aria-label="Hard">
                Hard
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded-lg mb-6"
          />

          {!gameOver ? (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setInstructions([...instructions, "up"])}
                  disabled={isExecuting}
                >
                  Up ↑
                </Button>
                <Button
                  onClick={() => setInstructions([...instructions, "down"])}
                  disabled={isExecuting}
                >
                  Down ↓
                </Button>
                <Button
                  onClick={() => setInstructions([...instructions, "left"])}
                  disabled={isExecuting}
                >
                  Left ←
                </Button>
                <Button
                  onClick={() => setInstructions([...instructions, "right"])}
                  disabled={isExecuting}
                >
                  Right →
                </Button>
                <Button
                  onClick={() => setInstructions([])}
                  variant="outline"
                  disabled={isExecuting}
                >
                  Clear
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-gray-600">
                  Instructions: {instructions.join(" → ")}
                </div>
                <Button
                  onClick={executeInstructions}
                  disabled={isExecuting || instructions.length === 0}
                  className="bg-game-logic hover:bg-game-logic/90"
                >
                  Run Program
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over! Final Score: {score}</p>
              <Button onClick={resetGame}>Play Again</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogicGame;
