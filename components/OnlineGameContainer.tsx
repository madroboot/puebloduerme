
import React, { useState, useEffect, useCallback } from 'react';
import { GameRoom, Role, LobbyPlayer, GamePhase, Player, PlayerStatus, NightAction } from '../types.ts';
import OnlineLobby, { OnlineMenu } from './OnlineLobby.tsx';
import GameScreen from './GameScreen.tsx';
import * as onlineService from '../services/onlineService.ts';
import { NIGHT_ACTION_ORDER } from '../constants.ts';
import { resolveNightActions, checkWinConditions, processPlayerDeaths } from '../services/gameLogic.ts';

interface OnlineGameContainerProps {
  onGoToHome: () => void;
}

const OnlineGameContainer: React.FC<OnlineGameContainerProps> = ({ onGoToHome }) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [sheriffResult, setSheriffResult] = useState<string | null>(null);

  useEffect(() => {
    if (!room || !userId) return;

    const unsubscribe = onlineService.listenToRoom(room.id, setRoom);
    return () => unsubscribe();
  }, [room?.id, userId]);
  
  // This effect will run only for the host to manage the game state progression
   useEffect(() => {
    if (!room || !room.gameState || room.hostId !== userId) return;

    const { phase, turnStartTime } = room.gameState;

    if (phase === GamePhase.NIGHT && turnStartTime && Date.now() > turnStartTime + 20000) {
        // Time is up, advance the turn
        // This is a simplified logic. A real implementation would be more complex.
        // For now, let's assume players act quickly. The host will manually advance day.
    }

  }, [room, userId]);


  const handleJoinRoom = (joinedRoom: GameRoom, uid: string, name: string) => {
    setRoom(joinedRoom);
    setUserId(uid);
    setUserName(name);
  };
  
  const handleStartGame = (roles: Role[]) => {
      if (room && userId === room.hostId) {
          onlineService.startGame(room.id, roles);
      }
  }

  const handlePlayerSelect = (targetId: string) => {
    setSelectedTargetId(targetId);
    if (!room?.gameState || !userId) return;
    const actor = room.gameState.players.find(p => p.id === userId);
    if (actor?.role === Role.SHERIFF) {
        const target = room.gameState.players.find(p => p.id === targetId);
        setSheriffResult(target?.hasGun ? `${target.name} TIENE arma.` : `${target.name} NO tiene arma.`);
    }
  };

  const handleConfirmNightAction = () => {
     if (!room || !room.gameState || !userId || !selectedTargetId) return;
     const actor = room.gameState.players.find(p => p.id === userId);
     if (!actor) return;
     
     // Simplified action creation
     // A real version would have more logic based on role
     const type = 'KILL'; // Placeholder
     const action: NightAction = { actorId: userId, targetId: selectedTargetId, role: actor.role, type: 'KILL' };
     onlineService.submitNightAction(room.id, action);
  };
  
  const handleSendChatMessage = (text: string) => {
      if(room && userName) {
          onlineService.sendChatMessage(room.id, userName, text);
      }
  }

  const handleVoteSubmit = (targetId: string) => {
    if(room && userId) {
        onlineService.submitDayVote(room.id, userId, targetId);
    }
  }


  if (!room || !userId || !userName) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
             <OnlineMenu onJoinRoom={handleJoinRoom} onBack={onGoToHome} />
        </div>
    );
  }

  if (room.status === 'lobby') {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <OnlineLobby room={room} userId={userId} onStartGame={handleStartGame}/>
        </div>
    );
  }
  
  if (room.status === 'in-game' && room.gameState) {
      return <GameScreen 
                players={room.gameState.players}
                phase={room.gameState.phase}
                activePlayerId={room.gameState.activePlayerId}
                selectedTargetId={selectedTargetId}
                dayNumber={room.gameState.dayNumber}
                announcement={room.gameState.announcement}
                onPlayerSelect={handlePlayerSelect}
                onGoToHome={onGoToHome}
                vampireAction={room.gameState.vampireAction}
                jesterWasLynched={room.gameState.jesterWasLynched}
                sheriffResult={sheriffResult}
                onConfirmNightAction={handleConfirmNightAction}
                // Dummy props for now
                onVoteDecision={() => {}}
                onConfirmLynch={() => {}}
                onSkipNightAction={() => {}}
                onEndDay={() => {}}
                // Online props
                isOnline={true}
                currentUserId={userId}
                chatMessages={Object.values(room.chat || {})}
                onSendChatMessage={handleSendChatMessage}
                turnStartTime={room.gameState.turnStartTime}
                onVoteSubmit={handleVoteSubmit}
             />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <p>Cargando sala...</p>
    </div>
  );
};

export default OnlineGameContainer;