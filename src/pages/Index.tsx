import { Calculator, Grid, Play } from "lucide-react";
import { GameCard } from "@/components/GameCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const isLoggedIn = true; // Changed to true to skip authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 animate-bounce-subtle">
            Welcome to KidsLearnCode
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fun educational games to learn math and programming!
          </p>
          {!isLoggedIn && (
            <Button size="lg" variant="outline" className="animate-bounce-subtle">
              Login with Google
            </Button>
          )}
        </div>

        {isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GameCard
              title="Math Challenge"
              description="Practice your math skills with fun exercises!"
              color="border-game-math text-game-math"
              to="/math"
              icon={<Calculator className="animate-bounce-subtle" />}
            />
            <GameCard
              title="Logic Programming"
              description="Learn programming basics with a fun grid game!"
              color="border-game-logic text-game-logic"
              to="/logic"
              icon={<Grid className="animate-bounce-subtle" />}
            />
            <GameCard
              title="Snake Game"
              description="Classic snake game for fun and relaxation!"
              color="border-game-snake text-game-snake"
              to="/snake"
              icon={<Play className="animate-bounce-subtle" />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;