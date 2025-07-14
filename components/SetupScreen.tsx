
import React, { useState } from 'react';
import { TrashIcon } from './icons.tsx';

interface SetupScreenProps {
  onContinue: (players: string[]) => void;
  initialPlayers: string[];
  onBack: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onContinue, initialPlayers, onBack }) => {
  const [players, setPlayers] = useState<string[]>(initialPlayers);
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (playerName.trim() && players.length < 10) {
      setPlayers([...players, playerName.trim()]);
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleAddPlayer();
    }
  };

  const isGameStartable = players.length >= 1 && players.length <= 10;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="relative text-center mb-4">
           <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-sm">
                &larr; Volver
            </button>
            <h1 className="text-4xl font-bold text-red-500 inline-block">Juego Local</h1>
        </div>
        
        <p className="text-center text-gray-400 mb-8">Añade de 1 a 10 jugadores para comenzar la partida.</p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del jugador"
            className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button
            onClick={handleAddPlayer}
            disabled={!playerName.trim() || players.length >= 10}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            Añadir
          </button>
        </div>

        <div className="space-y-2 mb-8 h-48 overflow-y-auto pr-2">
          {players.map((player, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg animate-fade-in">
              <span className="font-semibold">{index + 1}. {player}</span>
              <button onClick={() => handleRemovePlayer(index)} className="text-gray-400 hover:text-white transition-colors">
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => onContinue(players)}
          disabled={!isGameStartable}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
          Seleccionar Roles ({players.length})
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;