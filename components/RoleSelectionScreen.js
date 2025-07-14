import React, { useState } from 'react';
import { Role } from '../types.js';
import { ROLE_DETAILS } from '../constants.js';

interface RoleSelectionScreenProps {
  playerCount: number;
  onStartGame: (roles: Role[]) => void;
  onBack: () => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ 
    playerCount, 
    onStartGame, 
    onBack
}) => {
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set());

  const handleRoleToggle = (role: Role) => {
    const newSelection = new Set(selectedRoles);
    if (newSelection.has(role)) {
      newSelection.delete(role);
    } else {
      if (newSelection.size < playerCount) {
        newSelection.add(role);
      }
    }
    setSelectedRoles(newSelection);
  };

  const isReady = selectedRoles.size === playerCount;
  const allRoles = Object.values(Role).filter(role => role !== Role.TOWNSPEOPLE && role !== Role.VAMPIRE);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-red-500 mb-2">Seleccionar Roles</h1>
        <p className="text-center text-gray-400 mb-6">
          Elige exactamente <span className="font-bold text-white">{playerCount}</span> roles para la partida.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 mb-6">
          {allRoles.map(role => (
            <div key={role} className={`p-4 rounded-lg border-2 transition-colors ${selectedRoles.has(role) ? 'bg-red-900/50 border-red-500' : 'bg-gray-700/50 border-gray-600'}`}>
              <label className="flex items-center space-x-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoles.has(role)}
                  onChange={() => handleRoleToggle(role)}
                  className="w-6 h-6 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <div className="flex-grow">
                  <p className="font-bold text-lg">{role}</p>
                  <p className="text-sm text-gray-400">{ROLE_DETAILS[role].description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
            <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Volver
            </button>
            <div className="text-center text-lg">
                Seleccionados: <span className={`font-bold ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>{selectedRoles.size} / {playerCount}</span>
            </div>
            <button
                onClick={() => onStartGame(Array.from(selectedRoles))}
                disabled={!isReady}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
            >
                Iniciar Partida
            </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;