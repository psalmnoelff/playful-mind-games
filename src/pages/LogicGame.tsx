import { Link } from "react-router-dom";

const LogicGame = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container py-12">
        <Link to="/" className="text-gray-600 hover:text-gray-900 mb-8 block">
          ← Back to Home
        </Link>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-game-logic">
            Logic Programming
          </h1>
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="text-center text-2xl">
              Coming soon: Grid-based programming game!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicGame;