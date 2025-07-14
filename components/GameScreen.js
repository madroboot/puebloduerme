import React, { useState } from 'react';
import { Player, GamePhase, Role, PlayerStatus, ChatMessage } from '../types.js';
import PlayerCircle from './PlayerCircle.js';
import CentralInfoPanel from './CentralInfoPanel.js';
import { EyeOpenIcon, EyeClosedIcon } from './icons.js';
import ChatBox from './ChatBox.js';
import Timer from './Timer.js';

interface GameScreenProps {
  players: Player[];
  phase: GamePhase;
  activePlayerId: string | null;
  selectedTargetId: string | null;
  dayNumber: number;
  announcement: string;
  onPlayerSelect: (id: string) => void;
  onVoteDecision: (decision: boolean) => void;
  onConfirmLynch: () => void;
  onConfirmNightAction: () => void;
  onSkipNightAction: () => void;
  onGoToHome: () => void;
  onEndDay: () => void;
  vampireAction: 'KILL' | 'CONVERT';
  sheriffResult: string | null;
  jesterWasLynched: boolean;
  // Online-specific props
  isOnline?: boolean;
  currentUserId?: string | null;
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (message: string) => void;
  turnStartTime?: number;
  onVoteSubmit?: (targetId: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  players,
  phase,
  activePlayerId,
  selectedTargetId,
  dayNumber,
  announcement,
  onPlayerSelect,
  onVoteDecision,
  onConfirmLynch,
  onConfirmNightAction,
  onSkipNightAction,
  onGoToHome,
  onEndDay,
  vampireAction,
  sheriffResult,
  jesterWasLynched,
  isOnline = false,
  currentUserId = null,
  chatMessages = [],
  onSendChatMessage = () => {},
  turnStartTime,
  onVoteSubmit,
}) => {
  const [showRoles, setShowRoles] = useState(!isOnline);
  const containerSize = 450;
  const radius = containerSize * 0.8;
  const numPlayers = players.length;

  const activePlayer = players.find(p => p.id === activePlayerId) || null;
  const currentUserPlayer = players.find(p => p.id === currentUserId) || null;

  const isTargetingPhase = phase === GamePhase.NIGHT || (phase === GamePhase.DAY_VOTE && !isOnline);
  const isOnlineVotingPhase = isOnline && phase === GamePhase.DAY_VOTE && currentUserPlayer?.status === PlayerStatus.ALIVE;
  
  const getTargetablePlayers = () => {
    if(!activePlayer) return players.map(p => p.id);
    if(activePlayer.role === Role.WITCH) {
        return players.filter(p => p.status === PlayerStatus.DEAD && p.canBeRevived).map(p => p.id);
    }
    if (activePlayer.role === Role.JESTER && jesterWasLynched) {
        return players.filter(p => p.status === PlayerStatus.ALIVE).map(p => p.id);
    }
    return players.filter(p => p.status === PlayerStatus.ALIVE).map(p => p.id);
  }
  const targetablePlayerIds = new Set(getTargetablePlayers());

  const witchCanRevive = activePlayer?.role === Role.WITCH && players.some(p => p.status === PlayerStatus.DEAD && p.canBeRevived);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative p-4">
        <div className="absolute top-4 left-4 flex items-center gap-4 z-10">
            <button onClick={onGoToHome} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                {isOnline ? 'Salir de la Sala' : 'Volver al Inicio'}
            </button>
            {!isOnline && (
                <button
                    onClick={() => setShowRoles(prev => !prev)}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                    aria-label={showRoles ? 'Ocultar roles' : 'Mostrar roles'}
                >
                    {showRoles ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
            )}
            {isOnline && turnStartTime && activePlayerId && (
                <Timer startTime={turnStartTime} duration={20} />
            )}
        </div>
        
        <div className="relative" style={{ width: `${containerSize * 2}px`, height: `${containerSize * 2}px` }}>
            {players.map((player, index) => {
              const angle = (index / numPlayers) * 2 * Math.PI - Math.PI / 2;
              const x = containerSize + radius * Math.cos(angle);
              const y = containerSize + radius * Math.sin(angle);
              
              return (
                <PlayerCircle
                  key={player.id}
                  player={player}
                  position={{ top: `${y}px`, left: `${x}px` }}
                  isActive={player.id === activePlayerId}
                  isSelectedTarget={player.id === selectedTargetId}
                  onSelect={onPlayerSelect}
                  isTargetable={(isTargetingPhase && targetablePlayerIds.has(player.id) && (!isOnline || activePlayerId === currentUserId)) || (isOnlineVotingPhase && player.status === PlayerStatus.ALIVE)}
                  showRole={showRoles || (isOnline && player.id === currentUserId)}
                  isCurrentUser={isOnline && player.id === currentUserId}
                />
              );
            })}
            <CentralInfoPanel
              phase={phase}
              activePlayer={activePlayer}
              dayNumber={dayNumber}
              announcement={announcement}
              onVoteDecision={onVoteDecision}
              onConfirmLynch={onConfirmLynch}
              onConfirmNightAction={onConfirmNightAction}
              onSkipNightAction={onSkipNightAction}
              isTargetSelected={selectedTargetId !== null}
              onEndDay={onEndDay}
              vampireAction={vampireAction}
              sheriffResult={sheriffResult}
              witchCanRevive={witchCanRevive}
              jesterWasLynched={jesterWasLynched}
              isOnline={isOnline}
              currentUserId={currentUserId}
              onVoteSubmit={onVoteSubmit}
            />
        </div>
        {isOnline && (
            <div className="absolute bottom-4 right-4 w-full max-w-sm z-10">
                <ChatBox 
                    messages={chatMessages}
                    onSendMessage={onSendChatMessage}
                    currentUserId={currentUserId}
                    players={players}
                    disabled={phase !== GamePhase.DAY_VOTE || currentUserPlayer?.status === PlayerStatus.DEAD}
                />
            </div>
        )}
    </div>
  );
};

export default GameScreen;