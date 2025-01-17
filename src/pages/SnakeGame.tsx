import { Link } from "react-router-dom";

const SnakeGame = () => {
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
            <div className="text-center text-2xl">
              Coming soon: Classic snake game!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;