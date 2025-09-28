import { useState } from "react";

function Map() {
  const [tile, setTile] = useState(null);

  const rows = 6;
  const cols = 6;

  const hotspots = {
    6: "🌳 You found the magic forest!",
    8: "📦 A treasure chest appears!",
    9: "🏛️ Welcome to the Temple of Gamers!",
    10: "👤 A mysterious NPC awaits you!",
    15: "💬 A signpost: 'Find your gaming buddy here!'",
    22: "😈 A monster challenges you to co-op!",
    28: "💀 Danger zone! Block toxic players!",
  };

  return (
    <div className="relative w-[600px] h-[400px] mx-auto">
      {/* background */}
      <img src="/map.png" alt="map" className="absolute inset-0 w-full h-full rounded-lg" />

      {/* overlay grid */}
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div
            key={i}
            className="cursor-pointer hover:bg-purple-400/20"
            onClick={() => setTile(i)}
          />
        ))}
      </div>

      {/* modal */}
      {tile !== null && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-bold mb-2">Tile {tile}</h2>
            <p>{hotspots[tile] || "🤔 Nothing interesting here..."}</p>
            <button
              onClick={() => setTile(null)}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;
