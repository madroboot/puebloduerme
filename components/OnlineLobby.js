import React, { useState, useEffect } from 'react';
import { GameRoom, LobbyPlayer, Role } from '../types.js';
import { ROLES_BY_PLAYER_COUNT } from '../constants.js';
import * as onlineService from '../services/onlineService.js';

interface OnlineLobbyProps {
  room: GameRoom;
  userId: string;
  onStartGame: (roles: Role[]) => void;
}

const OnlineLobby: React.FC<OnlineLobbyProps> = ({ room, userId, onStartGame }) => {
  const isHost = room.hostId === userId;
  const playerCount = Object.keys(room.lobbyPlayers).length;
  const canStart = playerCount >= 7 && playerCount <= 10;
  
  const handleStartGame = () => {
    if (isHost && canStart) {
      const roles = ROLES_BY_PLAYER_COUNT[playerCount] || []; // Using default role list for now
      onStartGame(roles);
    }
  };

  return (
    <div className="w-full max-w-xl bg-gray-800 rounded-lg shadow-xl p-8">
      <h1 className="text-3xl font-bold text-center text-red-500 mb-4">Sala de Espera</h1>
      {!room.isPublic && (
        <div className="text-center mb-4">
          <p className="text-gray-400">Código de la sala:</p>
          <p className="text-4xl font-bold text-yellow-400 tracking-widest bg-gray-900 rounded-lg py-2 mt-1">{room.id}</p>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-4 text-center">Jugadores ({playerCount}/10)</h2>
      <div className="space-y-3 mb-8 h-48 overflow-y-auto pr-2">
        {Object.values(room.lobbyPlayers).map((player) => (
          <div key={player.uid} className={`font-semibold ${player.uid === userId ? 'text-green-400' : ''}`}>{player.name}</span>
            {player.isHost && <span className="text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full">HOST</span>}
          </div>
        ))}
      </div>
      
      {isHost ? (
        <button
          onClick={handleStartGame}
          disabled={!canStart}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
          {canStart ? 'Iniciar Partida' : `Se necesitan de 7 a 10 jugadores`}
        </button>
      ) : (
        <p className="text-center text-gray-400">Esperando a que el host inicie la partida...</p>
      )}
    </div>
  );
};


export const OnlineMenu: React.FC<{onJoinRoom: (room: GameRoom, uid: string, name: string) => void, onBack: () => void}> = ({ onJoinRoom, onBack }) => {
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '');
    const [roomCode, setRoomCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getUserId = () => {
        let uid = localStorage.getItem('userId');
        if (!uid) {
            uid = crypto.randomUUID();
            localStorage.setItem('userId', uid);
        }
        return uid;
    };

    const handleAction = async (action: 'public' | 'create' | 'join') => {
        if (!playerName.trim()) {
            setError('Por favor, introduce un nombre.');
            return;
        }
        localStorage.setItem('playerName', playerName.trim());
        setIsLoading(true);
        setError('');

        const user: LobbyPlayer = { uid: getUserId(), name: playerName.trim(), isHost: action === 'create' || action === 'public'};

        try {
            let code = roomCode;
            if (action === 'create') {
                user.isHost = true;
                code = await onlineService.createPrivateRoom(user);
            } else if (action === 'public') {
                code = await onlineService.findPublicRoom(user);
            } else if (action === 'join' && !code) {
                setError('Por favor, introduce un código de sala.');
                setIsLoading(false);
                return;
            }

            const room = await onlineService.joinRoom(code, user);
            if (room) {
                onJoinRoom(room, user.uid, user.name);
            } else {
                throw new Error("No se pudo unir a la sala.");
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="relative text-center mb-6">
                <button onClick={onBack} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-sm">
                    &larr; Volver
                </button>
                <h1 className="text-4xl font-bold text-red-500 inline-block">Juego Online</h1>
            </div>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center mb-4">{error}</p>}
             <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-red-500 transition-colors"
             />

            <div className="space-y-4">
                <button onClick={() => handleAction('public')} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500">
                    {isLoading ? 'Buscando...' : 'Buscar Partida Pública'}
                </button>
                <div className="border-t border-gray-600 my-4"></div>
                <button onClick={() => handleAction('create')} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500">
                    {isLoading ? 'Creando...' : 'Crear Sala Privada'}
                </button>
                <div className="flex gap-2">
                    <input
                        type="text"
                        maxLength={3}
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="Código"
                        className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <button onClick={() => handleAction('join')} disabled={isLoading || !roomCode} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
                        {isLoading ? '...' : 'Unirse'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnlineLobby;