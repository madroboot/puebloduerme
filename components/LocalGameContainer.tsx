
import React, { useState, useEffect } from 'react';
import { Player, GamePhase, Role, NightAction, PlayerStatus, Screen } from '../types.ts';
import { NIGHT_ACTION_ORDER } from '../constants.ts';
import { assignRoles, resolveNightActions, checkWinConditions, processPlayerDeaths } from '../services/gameLogic.ts';
import GameScreen from './GameScreen.tsx';
import RoleSelectionScreen from './RoleSelectionScreen.tsx';

interface LocalGameContainerProps {
  playerNames: string[];
  roles: Role[];
  onGoToHome: () => void;
}

const LocalGameContainer: React.FC<LocalGameContainerProps> = ({ playerNames, roles, onGoToHome }) => {
    const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
    const [players, setPlayers] = useState<Player[]>([]);
    const [dayNumber, setDayNumber] = useState(1);
    const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [nightActions, setNightActions] = useState<NightAction[]>([]);
    const [nightRoleIndex, setNightRoleIndex] = useState(-1);
    const [announcement, setAnnouncement] = useState('');
    const [vampireAction, setVampireAction] = useState<'KILL' | 'CONVERT'>('CONVERT');
    const [sheriffResult, setSheriffResult] = useState<string | null>(null);
    const [jesterWasLynched, setJesterWasLynched] = useState(false);
    const [jesterKillTargetId, setJesterKillTargetId] = useState<string | null>(null);
    
    useEffect(() => {
        const newPlayers = assignRoles(playerNames, roles);
        setPlayers(newPlayers);
        setPhase(GamePhase.NIGHT);
        setNightRoleIndex(0);
    }, [playerNames, roles]);

    useEffect(() => {
        if (phase !== GamePhase.NIGHT || nightRoleIndex === -1) return;

        setSheriffResult(null);
        setSelectedTargetId(null);
        
        const activeRolesInGame = new Set(players.filter(p => p.status === PlayerStatus.ALIVE).map(p => p.role));
        let foundNextPlayer = false;

        for (let i = nightRoleIndex; i < NIGHT_ACTION_ORDER.length; i++) {
            const role = NIGHT_ACTION_ORDER[i];

            if (role === Role.JESTER && jesterWasLynched) {
                 const jester = players.find(p => p.role === Role.JESTER);
                 if (jester) {
                    setNightRoleIndex(i);
                    setActivePlayerId(jester.id);
                    foundNextPlayer = true;
                    break;
                }
            } else if (role === Role.WITCH) {
                 const witch = players.find(p => p.role === Role.WITCH && p.status === PlayerStatus.ALIVE);
                 const canWitchAct = witch && witch.abilityUses.revive > 0 && players.some(p => p.status === PlayerStatus.DEAD && p.canBeRevived);
                 if(canWitchAct) {
                    setNightRoleIndex(i);
                    setActivePlayerId(witch.id);
                    foundNextPlayer = true;
                    break;
                 }
            }
            
            else if (role === Role.VAMPIRE_VIEJO) {
                let responsibleVampire: Player | undefined;
                if (vampireAction === 'KILL') {
                    responsibleVampire = players.find(p => p.role === Role.VAMPIRE_VIEJO && p.status === PlayerStatus.ALIVE);
                } else {
                    responsibleVampire = players.find(p => p.role === Role.VAMPIRE_JOVEN && p.status === PlayerStatus.ALIVE);
                }

                if (responsibleVampire) {
                    setNightRoleIndex(i);
                    setActivePlayerId(responsibleVampire.id);
                    foundNextPlayer = true;
                    break;
                }
            } else if (activeRolesInGame.has(role)) {
                const potentialPlayers = players.filter(p => p.role === role && p.status === PlayerStatus.ALIVE);
                if (potentialPlayers.length > 0) {
                    setNightRoleIndex(i);
                    setActivePlayerId(potentialPlayers[0].id);
                    foundNextPlayer = true;
                    break;
                }
            }
        }

        if (!foundNextPlayer) {
            setActivePlayerId(null);
            
            const { updatedPlayers, announcement: nightAnnouncement } = resolveNightActions(nightActions, players, vampireAction, jesterKillTargetId, dayNumber);
            setPlayers(updatedPlayers);
            setAnnouncement(nightAnnouncement);

            setJesterWasLynched(false);
            setJesterKillTargetId(null);
            
            const winCheck = checkWinConditions(updatedPlayers);
            if(winCheck) {
                setAnnouncement(`${winCheck.message} ¡Gana ${winCheck.winner}!`);
                setPhase(GamePhase.GAME_OVER);
            } else {
                setPhase(GamePhase.DAY_ANNOUNCEMENT);
            }
        }
    }, [nightRoleIndex, phase, players, jesterWasLynched, vampireAction, nightActions, jesterKillTargetId, dayNumber]);


    const handlePlayerSelect = (targetId: string) => {
        setSelectedTargetId(targetId);
        const actor = players.find(p => p.id === activePlayerId);
        if (!actor) return;
        
        if (actor.role === Role.SHERIFF) {
            const target = players.find(p => p.id === targetId);
            setSheriffResult(target?.hasGun ? `${target.name} TIENE arma.` : `${target.name} NO tiene arma.`);
        }
    };
    
    const handleConfirmNightAction = () => {
        const actor = players.find(p => p.id === activePlayerId);
        if (!actor) return;

        let actionType: NightAction['type'] | null = null;
        let requiresTarget = true;
        
        switch(actor.role) {
            case Role.MAFIA: actionType = 'KILL'; break;
            case Role.VAMPIRE_JOVEN:
            case Role.VAMPIRE_VIEJO: 
                actionType = vampireAction === 'KILL' ? 'KILL' : 'CONVERT'; 
                break;
            case Role.DOCTOR: actionType = 'PROTECT'; break;
            case Role.BODYGUARD: actionType = 'GUARD'; break;
            case Role.ESCORT: actionType = 'BLOCK'; break;
            case Role.SHERIFF: actionType = 'INVESTIGATE'; break;
            case Role.VETERAN: actionType = 'ALERT'; requiresTarget = false; break;
            case Role.WITCH: actionType = 'REVIVE'; break;
            case Role.JESTER: if(jesterWasLynched) actionType = 'KILL'; break;
        }

        if(requiresTarget && !selectedTargetId) return;

        if(actionType) {
            const currentTargetId = (actor.role === Role.VETERAN || !requiresTarget) ? actor.id : selectedTargetId;

            if (actor.role === Role.JESTER && jesterWasLynched) {
                setJesterKillTargetId(currentTargetId);
            } else {
                setNightActions(prev => [...prev, { actorId: actor.id, targetId: currentTargetId, role: actor.role, type: actionType as NightAction['type']}]);
            }
            
            const newPlayers = [...players];
            const pIndex = newPlayers.findIndex(p => p.id === actor.id);
            if(pIndex !== -1) {
                if(actor.role === Role.VETERAN && newPlayers[pIndex].abilityUses.alerts > 0) newPlayers[pIndex].abilityUses.alerts--;
                if(actor.role === Role.DOCTOR && actor.id === currentTargetId && newPlayers[pIndex].abilityUses.selfHeals > 0) newPlayers[pIndex].abilityUses.selfHeals--;
                if(actor.role === Role.BODYGUARD && actor.id === currentTargetId && newPlayers[pIndex].abilityUses.selfGuards > 0) newPlayers[pIndex].abilityUses.selfGuards--;
                if(actor.role === Role.WITCH && newPlayers[pIndex].abilityUses.revive > 0) newPlayers[pIndex].abilityUses.revive--;
                setPlayers(newPlayers);
            }
        }
        setNightRoleIndex(i => i + 1);
    };
    
    const handleSkipNightAction = () => {
        setNightRoleIndex(i => i + 1);
    };

    const handleVoteDecision = (decision: boolean) => {
        if(decision) {
            setPhase(GamePhase.DAY_VOTE);
            setSelectedTargetId(null);
        } else {
            handleEndDay();
        }
    };

    const handleLynch = () => {
        if (!selectedTargetId) return;

        const lynchTarget = players.find(p => p.id === selectedTargetId);
        if (!lynchTarget) return;

        let finalAnnouncement = `${lynchTarget.name} (${lynchTarget.role}) ha sido linchado por el pueblo.`;

        if (lynchTarget.role === Role.JESTER) {
            setJesterWasLynched(true);
            finalAnnouncement += ` ¡Ha cumplido su objetivo!`;
            
            setAnnouncement(finalAnnouncement);

            const updatedPlayers = players.map(p =>
                p.id === selectedTargetId
                    ? { ...p, status: PlayerStatus.DEAD, canBeRevived: true }
                    : p
            );
            setPlayers(updatedPlayers);
            setTimeout(handleEndDay, 3000); 
            return;
        }

        const { updatedPlayers, promotionAnnouncements } = processPlayerDeaths(new Set([selectedTargetId]), players);
        
        if(promotionAnnouncements.length > 0) {
            finalAnnouncement += ` ${promotionAnnouncements.join(' ')}`;
        }

        setPlayers(updatedPlayers);
        
        const winCheck = checkWinConditions(updatedPlayers);
        if (winCheck) {
            setAnnouncement(`${finalAnnouncement} ${winCheck.message} ¡Gana ${winCheck.winner}!`);
            setPhase(GamePhase.GAME_OVER);
        } else {
            setAnnouncement(finalAnnouncement);
            setTimeout(handleEndDay, 3000);
        }
    };
    
    const handleEndDay = () => {
        setDayNumber(d => d + 1);
        setPhase(GamePhase.NIGHT);
        setNightActions([]);
        setActivePlayerId(null);
        setSelectedTargetId(null);
        setSheriffResult(null);
        setVampireAction(prev => prev === 'KILL' ? 'CONVERT' : 'KILL');
        setNightRoleIndex(0);
    };
    
    if (players.length === 0) {
        return <div>Cargando partida...</div>
    }

    return (
        <GameScreen
            players={players}
            phase={phase}
            activePlayerId={activePlayerId}
            selectedTargetId={selectedTargetId}
            dayNumber={dayNumber}
            announcement={announcement}
            onPlayerSelect={phase === GamePhase.DAY_VOTE ? setSelectedTargetId : handlePlayerSelect}
            onVoteDecision={handleVoteDecision}
            onConfirmLynch={handleLynch}
            onConfirmNightAction={handleConfirmNightAction}
            onSkipNightAction={handleSkipNightAction}
            onGoToHome={onGoToHome}
            onEndDay={handleEndDay}
            vampireAction={vampireAction}
            sheriffResult={sheriffResult}
            jesterWasLynched={jesterWasLynched}
        />
    );
};

export default LocalGameContainer;