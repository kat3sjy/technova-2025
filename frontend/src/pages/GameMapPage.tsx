import { useLocation } from "react-router-dom";
import GameMap from "../components/gamemap";

export default function GameMapPage() {
  const location = useLocation();
  const player = location.state || { username: "Guest", avatar: "🎮" };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-center mb-4">
        🌍 Welcome, {player.avatar} {player.username}!
      </h1>
      <GameMap player={player} />
    </div>
  );
}
import { useLocation } from "react-router-dom";
import GameMap from "../components/gamemap";

export default function GameMapPage() {
  const location = useLocation();
  const player = location.state || { username: "Guest", avatar: "🎮" };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-center mb-4">
        🌍 Welcome, {player.avatar} {player.username}!
      </h1>
      <GameMap player={player} />
    </div>
  );
}
