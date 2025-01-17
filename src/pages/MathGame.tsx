import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Problem {
  question: string;
  answer: number;
  options: number[];
}

const MathGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPaused, setIsPaused] = useState(false);

  // Game state
  const gameState = useRef({
    backgroundX: 0,
    characterX: 200, // Fixed position
    characterY: 300,
    isRunning: true,
    animationFrame: 0,
  });

  // Generate a random math problem
  const generateProblem = (difficulty: "easy" | "normal" | "hard") => {
    let num1, num2;
    switch (difficulty) {
      case "easy":
        num1 = Math.floor(Math.random() * 10);
        num2 = Math.floor(Math.random() * 10);
        break;
      case "normal":
        num1 = Math.floor(Math.random() * 50);
        num2 = Math.floor(Math.random() * 50);
        break;
      case "hard":
        num1 = Math.floor(Math.random() * 100);
        num2 = Math.floor(Math.random() * 100);
        break;
    }

    const answer = num1 + num2;
    const options = [
      answer,
      answer + Math.floor(Math.random() * 10) + 1,
      answer - Math.floor(Math.random() * 10) - 1,
      answer * 2,
    ].sort(() => Math.random() - 0.5);

    return {
      question: `${num1} + ${num2} = ?`,
      answer,
      options,
    };
  };

  // Draw the stick figure character
  const drawCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    
    // Head
    ctx.beginPath();
    ctx.arc(x, y - 30, 10, 0, Math.PI * 2);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Arms (animated based on running)
    const armAngle = Math.sin(gameState.current.animationFrame * 0.2) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x + Math.cos(armAngle) * 15, y - 5);
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x - Math.cos(armAngle) * 15, y - 5);
    ctx.stroke();
    
    // Legs (animated based on running)
    const legAngle = Math.sin(gameState.current.animationFrame * 0.2) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(legAngle) * 20, y + 20);
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(legAngle) * 20, y + 20);
    ctx.stroke();
  };

  // Draw the background
  const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Paper-like background
    ctx.fillStyle = "#FEF7CD";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines for paper effect
    ctx.strokeStyle = "#E5E5E5";
    ctx.lineWidth = 0.5;

    // Vertical lines that move
    for (let i = gameState.current.backgroundX % 30; i < canvas.width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines (static)
    for (let i = 0; i < canvas.height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
  };

  // Main game loop
  const gameLoop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    
    if (!canvas || !ctx) return;

    // Move background
    if (!isPaused) {
      gameState.current.backgroundX -= 2;
      gameState.current.animationFrame++;
    }

    // Draw background
    drawBackground(ctx, canvas);

    // Draw character at fixed position
    drawCharacter(ctx, gameState.current.characterX, gameState.current.characterY);

    // Draw current problem if exists
    if (currentProblem) {
      ctx.font = "24px Arial";
      ctx.fillStyle = "#000";
      ctx.fillText(currentProblem.question, canvas.width / 2 - 50, 50);
      
      // Draw answer options
      currentProblem.options.forEach((option, index) => {
        const x = 100 + (index * 200);
        const y = 200;
        
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = "#4CAF50";
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.fillText(option.toString(), x - 15, y + 10);
      });
    }

    // Draw score
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(`Score: ${score}`, 20, 30);

    // Draw timer when paused
    if (isPaused) {
      ctx.font = "24px Arial";
      ctx.fillStyle = "#FF0000";
      ctx.fillText(`Time: ${timeLeft}s`, canvas.width - 120, 30);
    }

    if (!gameOver) {
      requestAnimationFrame(gameLoop);
    }
  };

  // Start a new problem
  const startNewProblem = () => {
    setIsPaused(true);
    setTimeLeft(10);
    setCurrentProblem(generateProblem("easy"));
  };

  // Handle answer selection
  const handleAnswer = (selectedAnswer: number) => {
    if (!currentProblem) return;

    if (selectedAnswer === currentProblem.answer) {
      setScore(prev => prev + 10);
      toast({
        title: "Correct!",
        description: "+10 points",
        duration: 1500,
      });
      setIsPaused(false);
      setCurrentProblem(null);
    } else {
      setGameOver(true);
      toast({
        title: "Game Over!",
        description: `Final score: ${score}`,
        variant: "destructive",
      });
    }
  };

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 400;

    gameLoop();
    
    // Start first problem after a delay
    const timeout = setTimeout(() => {
      startNewProblem();
    }, 2000);

    // Set up problem interval
    const problemInterval = setInterval(() => {
      if (!isPaused && !gameOver) {
        startNewProblem();
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      clearInterval(problemInterval);
    };
  }, [isPaused, gameOver]);

  // Timer effect
  useEffect(() => {
    if (!isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          clearInterval(timer);
          toast({
            title: "Time's up!",
            description: `Final score: ${score}`,
            variant: "destructive",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle click events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      if (!currentProblem || !isPaused) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if click is on any answer option
      currentProblem.options.forEach((option, index) => {
        const optionX = 100 + (index * 200);
        const optionY = 200;
        
        const distance = Math.sqrt(
          Math.pow(x - optionX, 2) + Math.pow(y - optionY, 2)
        );

        if (distance < 30) {
          handleAnswer(option);
        }
      });
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [currentProblem, isPaused]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 block">
        ← Back to Home
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg shadow-lg bg-white mb-4"
        />
        
        {gameOver && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="mb-4">Final Score: {score}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-game-math hover:bg-game-math/90"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathGame;