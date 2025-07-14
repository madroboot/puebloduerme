import React from 'react';
import { Player, GamePhase, Role } from '../types.js';
import { ROLE_DETAILS, VAMPIRE_ROLES } from '../constants.js';

interface CentralInfoPanelProps {
  phase: GamePhase;
  activePlayer: Player | null;
  dayNumber: number;
  announcement: string;
  onVoteDecision: (decision: boolean) => void;
  onConfirmLynch: () => void;
  onEndDay: () => void;
  vampireAction: 'KILL' | 'CONVERT';
  sheriffResult: string | null;
  witchCanRevive: boolean;
  jesterWasLynched: boolean;
  onConfirmNightAction?: () => void;
  onSkipNightAction?: () => void;
  isTargetSelected?: boolean;
  isOnline?: boolean;
  currentUserId?: string | null;
  onVoteSubmit?: (targetId: string) => void;
}

const CentralInfoPanel: React.FC<CentralInfoPanelProps> = ({
  phase,
  activePlayer,
  dayNumber,
  announcement,
  onVoteDecision,
  onConfirmLynch,
  onEndDay,
  vampireAction,
  sheriffResult,
  witchCanRevive,
  jesterWasLynched,
  onConfirmNightAction,
  onSkipNightAction,
  isTargetSelected,
  isOnline = false,
  currentUserId = null,
  onVoteSubmit
}) => {
  const renderContent = () => {
    switch (phase) {
      case GamePhase.NIGHT:
        if (activePlayer) {
           if(isOnline && activePlayer.id !== currentUserId) {
              return (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-yellow-400">Es el turno de...</h2>
                  <p className="text-4xl font-extrabold my-2">{activePlayer.name}</p>
                   <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-500 mx-auto mt-4"></div>
                </div>
              );
           }
          
          const roleDetails = ROLE_DETAILS[activePlayer.role];
          let actionText = roleDetails.description;
          if(VAMPIRE_ROLES.includes(activePlayer.role)) {
              actionText = vampireAction === 'KILL' ? "Elige a quién matar." : "Elige a quién convertir.";
          }
          if(activePlayer.role === Role.JESTER && jesterWasLynched){
              actionText = "Has sido linchado. Elige a quién matar esta noche."
          }

          return (
            <div className="text-center flex flex-col justify-center items-center h-full">
              <div className="flex-grow flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-yellow-400">Tu Turno, {activePlayer.name}</h2>
                <p className="text-4xl font-extrabold my-2">{activePlayer.role}</p>
                <p className="text-lg text-gray-300 mb-3">{actionText}</p>
                {activePlayer.role === Role.VETERAN && <p>Alertas restantes: <span className="font-bold text-xl">{activePlayer.abilityUses.alerts}</span></p>}
                {activePlayer.role === Role.DOCTOR && <p>Autocuraciones restantes: <span className="font-bold text-xl">{activePlayer.abilityUses.selfHeals}</span></p>}
                {activePlayer.role === Role.BODYGUARD && <p>Autoprotecciones restantes: <span className="font-bold text-xl">{activePlayer.abilityUses.selfGuards}</span></p>}
                {activePlayer.role === Role.SHERIFF && sheriffResult && <p className="mt-2 text-2xl text-cyan-400 animate-pulse">{sheriffResult}</p>}
              </div>
              
              <div className="w-full">
                 {/* Action Buttons */}
              </div>
            </div>
          );
        }
        return <div className="text-center text-2xl font-bold">Noche {dayNumber}</div>;
      
      case GamePhase.DAY_ANNOUNCEMENT:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Amanecer - Día {dayNumber}</h2>
            <p className="text-xl text-gray-300 mb-6">{announcement}</p>
             {!isOnline && (
                <button onClick={() => onVoteDecision(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                Ir a Votación
                </button>
            )}
          </div>
        );

      case GamePhase.DAY_VOTE:
        return (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Votación</h2>
                <p className="text-xl text-gray-300 mb-6">Selecciona un jugador para linchar.</p>
                {isOnline ? (
                    <button onClick={() => onVoteSubmit && isTargetSelected && onVoteSubmit(isTargetSelected as any)} disabled={!isTargetSelected} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                        Votar para Linchar
                    </button>
                ) : (
                    <div className="flex justify-center gap-4">
                        <button onClick={onConfirmLynch} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                            Confirmar Linchamiento
                        </button>
                        <button onClick={onEndDay} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                            Terminar Día sin linchamiento
                        </button>
                    </div>
                )}
            </div>
        );
      
      case GamePhase.GAME_OVER:
        return (
          <div className="text-center">
            <h2 className="text-5xl font-bold text-yellow-500 mb-4">¡Partida Terminada!</h2>
            <p className="text-2xl text-gray-200">{announcement}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 max-w-lg max-h-lg bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center p-6 border-4 border-gray-700">
      <div className="w-full h-full flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default CentralInfoPanel;