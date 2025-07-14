
import React from 'react';
import { Player, PlayerStatus } from '../types.ts';

interface PlayerCircleProps {
  player: Player;
  position: { top: string; left: string };
  isActive: boolean;
  isSelectedTarget: boolean;
  onSelect: (id: string) => void;
  isTargetable: boolean;
  showRole: boolean;
  isCurrentUser?: boolean;
}

const PlayerCircle: React.FC<PlayerCircleProps> = ({ player, position, isActive, isSelectedTarget, onSelect, isTargetable, showRole, isCurrentUser = false }) => {
  const isDead = player.status === PlayerStatus.DEAD;

  const getStatusColor = () => {
    if (isDead) return 'bg-red-800 border-red-600';
    if (isActive) return 'bg-yellow-500 border-yellow-300 animate-pulse';
    return 'bg-green-700 border-green-500';
  };
  
  const baseClasses = 'absolute flex flex-col items-center justify-center transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2';
  const deadClasses = isDead ? 'opacity-40 filter grayscale' : 'opacity-100';
  const targetableClasses = isTargetable ? 'cursor-pointer hover:scale-110' : 'cursor-default';
  
  return (
    <div
      style={position}
      className={`${baseClasses} ${deadClasses} ${targetableClasses}`}
      onClick={() => isTargetable && onSelect(player.id)}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${getStatusColor()} ${isSelectedTarget ? 'ring-4 ring-offset-4 ring-offset-gray-900 ring-cyan-400' : ''} transition-all`}>
      </div>
      <div className="mt-2 text-center">
        <span className="font-bold text-sm bg-gray-900/70 px-2 py-1 rounded">{player.name}{isCurrentUser && ' (Tú)'}</span>
        {showRole && (
          <span className="block text-xs text-red-400 font-semibold mt-1">{player.role}</span>
        )}
      </div>
    </div>
  );
};

export default PlayerCircle;