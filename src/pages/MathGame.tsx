import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const MathGame = () => {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("easy");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container py-12">
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 block">
          ← Back to Home
        </Link>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-game-math">
            Math Challenge
          </h1>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex gap-4 mb-8 justify-center">
              {(["easy", "normal", "hard"] as const).map((d) => (
                <Button
                  key={d}
                  variant={difficulty === d ? "default" : "outline"}
                  onClick={() => setDifficulty(d)}
                  className="capitalize"
                >
                  {d}
                </Button>
              ))}
            </div>
            <div className="text-center text-2xl mb-8">
              Coming soon: Math problems will appear here!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathGame;