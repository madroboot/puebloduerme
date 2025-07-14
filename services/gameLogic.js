import { Player, Role, PlayerStatus, NightAction, Faction } from '../types.js';
import { ROLE_DETAILS, VAMPIRE_ROLES } from '../constants.js';

// Helper to shuffle arrays
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const assignRoles = (playerNames: string[], roles: Role[]): Player[] => {
  const shuffledRoles = shuffleArray(roles);
  const shuffledNames = shuffleArray(playerNames);

  return shuffledNames.map((name, index) => {
    const role = shuffledRoles[index] || Role.TOWNSPEOPLE; // Fallback, though should not happen with proper validation
    const details = ROLE_DETAILS[role];
    let abilityUses: { [key: string]: number } = {};
    if(role === Role.VETERAN) abilityUses = { alerts: 3 };
    if(role === Role.DOCTOR) abilityUses = { selfHeals: 2 };
    if(role === Role.BODYGUARD) abilityUses = { selfGuards: 2 };
    if(role === Role.WITCH) abilityUses = { revive: 1 };
    
    return {
      id: crypto.randomUUID(),
      name,
      role,
      status: PlayerStatus.ALIVE,
      faction: details.faction,
      isProtected: false,
      isBlocked: false,
      isAlerting: false,
      markedForLynch: false,
      abilityUses,
      hasGun: details.hasGun || false,
      canBeRevived: false,
      convertedOnDay: null,
    };
  });
};

export const processPlayerDeaths = (
  deadPlayerIds: Set<string>,
  players: Player[]
): { updatedPlayers: Player[], promotionAnnouncements: string[] } => {
  if (deadPlayerIds.size === 0) {
    return { updatedPlayers: [...players], promotionAnnouncements: [] };
  }

  let updatedPlayers = JSON.parse(JSON.stringify(players)) as Player[];
  let promotionAnnouncements: string[] = [];

  // Mark players as dead and revivable
  updatedPlayers.forEach(p => {
    if (deadPlayerIds.has(p.id)) {
      p.status = PlayerStatus.DEAD;
      p.canBeRevived = true;
    }
  });

  // Vampire Inheritance Logic
  const deadVampireLeaders = players.filter(p =>
    deadPlayerIds.has(p.id) &&
    (p.role === Role.VAMPIRE_VIEJO || p.role === Role.VAMPIRE_JOVEN)
  );

  if (deadVampireLeaders.length > 0) {
    const livingConvertedVampires = updatedPlayers.filter(p =>
      p.role === Role.VAMPIRE && p.status === PlayerStatus.ALIVE
    ).sort((a, b) => {
      // Oldest converted vampire first
      if (a.convertedOnDay !== null && b.convertedOnDay !== null) {
        if (a.convertedOnDay !== b.convertedOnDay) {
          return a.convertedOnDay - b.convertedOnDay;
        }
      }
      return a.name.localeCompare(b.name); // Fallback for determinism
    });

    for (const deadLeader of deadVampireLeaders) {
      const promotedVampire = livingConvertedVampires.shift();
      if (promotedVampire) {
        const pIndex = updatedPlayers.findIndex(p => p.id === promotedVampire.id);
        if (pIndex !== -1) {
          updatedPlayers[pIndex].role = deadLeader.role;
          updatedPlayers[pIndex].convertedOnDay = null; // No longer a generic vampire
          promotionAnnouncements.push(`${promotedVampire.name} has inherited the title of ${deadLeader.role}!`);
        }
      }
    }
  }

  return { updatedPlayers, promotionAnnouncements };
};


export const resolveNightActions = (
  initialActions: NightAction[],
  players: Player[],
  vampireAction: 'KILL' | 'CONVERT',
  jesterKillTargetId: string | null,
  dayNumber: number
): { updatedPlayers: Player[], announcement: string } => {

  let updatedPlayers = JSON.parse(JSON.stringify(players)) as Player[];
  const getPlayer = (id: string | null): Player | undefined => updatedPlayers.find(p => p.id === id);
  const previouslyRevivableIds = new Set(updatedPlayers.filter(p => p.canBeRevived && p.status === PlayerStatus.DEAD).map(p => p.id));

  // --- STAGE 0: INITIALIZE & PREPARE ---
  let deaths: { player: Player, cause: string }[] = [];
  let announcements: string[] = [];

  // Reset transient night states for all players, and expire revival chances
  updatedPlayers.forEach(p => {
    p.isBlocked = false;
    p.isProtected = false;
    p.isAlerting = false;
    p.canBeRevived = false;
  });

  let actions = [...initialActions];

  // --- STAGE 1: BLOCKING ---
  actions.filter(a => a.type === 'BLOCK').forEach(action => {
    const target = getPlayer(action.targetId);
    if (target) target.isBlocked = true;
  });

  // --- STAGE 2: BODYGUARD REDIRECTION ---
  const guardMap = new Map<string, string>();
  actions.filter(a => a.type === 'GUARD').forEach(guardAction => {
    const bodyguard = getPlayer(guardAction.actorId);
    if (bodyguard && !bodyguard.isBlocked && guardAction.targetId && guardAction.actorId !== guardAction.targetId) {
      guardMap.set(guardAction.targetId, guardAction.actorId);
    }
  });
  actions.forEach(action => {
    if (action.targetId && guardMap.has(action.targetId)) {
      action.targetId = guardMap.get(action.targetId)!;
    }
  });

  // --- STAGE 3: APPLY PROTECTIVE & NEUTRAL STATES ---
  actions.filter(a => a.type === 'ALERT').forEach(action => {
    const veteran = getPlayer(action.actorId);
    if (veteran && !veteran.isBlocked) veteran.isAlerting = true;
  });
  actions.filter(a => a.type === 'PROTECT').forEach(action => {
    const doctor = getPlayer(action.actorId);
    const target = getPlayer(action.targetId);
    if (doctor && !doctor.isBlocked && target) target.isProtected = true;
  });
   // Bodyguard Self-Protection
  actions.filter(a => a.type === 'GUARD').forEach(action => {
    const bodyguard = getPlayer(action.actorId);
    if (bodyguard && !bodyguard.isBlocked && action.targetId === action.actorId) {
        bodyguard.isProtected = true;
    }
  });


  // Witch Revive - The witch's action is resolved here.
  const reviveAction = actions.find(a => a.type === 'REVIVE');
  if (reviveAction) {
      const actor = getPlayer(reviveAction.actorId);
      const target = getPlayer(reviveAction.targetId);
      if (actor && !actor.isBlocked && target && previouslyRevivableIds.has(target.id)) {
          target.status = PlayerStatus.ALIVE;
          announcements.push(`${target.name} was brought back from the dead!`);
      }
  }

  // --- STAGE 4: RESOLVE HOSTILE & NEUTRAL ACTIONS ---
  const addDeath = (player: Player, cause: string) => {
      if (!deaths.some(d => d.player.id === player.id)) {
          deaths.push({ player, cause });
      }
  };

  // --- STAGE 4.1: JESTER'S UNSTOPPABLE REVENGE ---
  if (jesterKillTargetId) {
      const jesterTarget = getPlayer(jesterKillTargetId);
      if (jesterTarget) {
          addDeath(jesterTarget, 'cursed by a vengeful Jester');
      }
  }

  const veteranOnAlert = updatedPlayers.find(p => p.isAlerting);
  if (veteranOnAlert) {
    actions.forEach(action => {
      if (action.targetId === veteranOnAlert.id && action.actorId !== veteranOnAlert.id) {
        const visitor = getPlayer(action.actorId);
        if (visitor && !visitor.isBlocked) {
          addDeath(visitor, 'visited a Veteran on alert');
        }
      }
    });
  }

  actions.filter(a => a.type === 'KILL').forEach(action => {
    const actor = getPlayer(action.actorId);
    const target = getPlayer(action.targetId);
    if (actor && actor.isBlocked) return; 
    if (!target || deaths.some(d => d.player.id === target.id) || target.status === PlayerStatus.DEAD) return;
    if (target.isAlerting || target.isProtected) return;
    const cause = `killed by the ${VAMPIRE_ROLES.includes(action.role) ? 'Vampires' : action.role}`;
    addDeath(target, cause);
  });

  // --- STAGE 5: RESOLVE OTHER ACTIONS & FINALIZE ---
  if (vampireAction === 'CONVERT') {
    const convertAction = actions.find(a => VAMPIRE_ROLES.includes(a.role) && a.type === 'CONVERT');
    if (convertAction) {
      const actor = getPlayer(convertAction.actorId);
      const target = getPlayer(convertAction.targetId);
      const targetIsDying = deaths.some(d => d.player.id === target?.id);
      const canBeConverted = target && (target.faction === Faction.TOWN || target.faction === Faction.NEUTRAL);

      if (canBeConverted && actor && !actor.isBlocked && !target.isProtected && !target.isAlerting && !targetIsDying) {
        target.role = Role.VAMPIRE; // Assign generic Vampire role
        target.faction = Faction.VAMPIRE;
        target.convertedOnDay = dayNumber;
        announcements.push(`${target.name} was turned into a Vampire!`);
      }
    }
  }

  // --- STAGE 6: REPORTING & FINAL STATE UPDATE ---
  const deadPlayerIdsThisNight = new Set<string>(deaths.map(d => d.player.id));
  
  const { updatedPlayers: playersAfterDeaths, promotionAnnouncements } = processPlayerDeaths(deadPlayerIdsThisNight, updatedPlayers);
  updatedPlayers = playersAfterDeaths;
  announcements.push(...promotionAnnouncements);


  let nightReport = "";
  if (deaths.length > 0) {
    nightReport = `Anoche murieron: ${deaths.map(d => `${d.player.name} (${d.player.role})`).join(', ')}.`;
  } else {
    nightReport = 'Nadie murió anoche.';
  }

  announcements.push(nightReport);
  const finalAnnouncement = announcements.filter(Boolean).join(' ');

  return { updatedPlayers, announcement: finalAnnouncement };
};


export const checkWinConditions = (players: Player[]): { winner: string, message: string } | null => {
  const alivePlayers = players.filter(p => p.status === PlayerStatus.ALIVE);
  const totalAlive = alivePlayers.length;

  if (totalAlive === 0) {
    return { winner: "Nadie", message: "Todos han muerto. No hay ganadores." };
  }

  const mafiaCount = alivePlayers.filter(p => p.faction === Faction.MAFIA).length;
  const vampireCount = alivePlayers.filter(p => p.faction === Faction.VAMPIRE).length;
  const townCount = alivePlayers.filter(p => p.faction === Faction.TOWN).length;

  // Mafia win condition: they are >= half the living population
  if (mafiaCount > 0 && mafiaCount >= totalAlive / 2) {
    return { winner: "Mafia", message: "La Mafia ha igualado o superado en número al resto y toma el control." };
  }

  // Vampire win condition
  if (vampireCount > 0 && vampireCount > totalAlive / 2) {
    // Strict majority wins outright
    return { winner: "Vampiros", message: "Los Vampiros son mayoría y dominan la noche." };
  }
  if (vampireCount > 0 && totalAlive > 0 && vampireCount === totalAlive / 2) {
    // Exactly half: check for threats
    const hasMafiaThreat = mafiaCount > 0;
    const hasVeteranThreat = alivePlayers.some(p => p.role === Role.VETERAN && p.abilityUses.alerts > 0);
    if (!hasMafiaThreat && !hasVeteranThreat) {
      return { winner: "Vampiros", message: "Los Vampiros han alcanzado la mitad del pueblo sin amenazas restantes y dominan." };
    }
  }

  // Town win condition: all evil factions are eliminated
  if (mafiaCount === 0 && vampireCount === 0 && townCount > 0) {
    return { winner: "Pueblo", message: "Todas las amenazas han sido eliminadas. ¡El pueblo gana!" };
  }
  
  return null;
};