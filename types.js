export enum Role {
  MAFIA = "Mafia",
  VETERAN = "Veterano",
  DOCTOR = "Médico",
  JESTER = "Payaso",
  VAMPIRE = "Vampiro",
  VAMPIRE_JOVEN = "Vampiro Joven",
  VAMPIRE_VIEJO = "Vampiro Viejo",
  WITCH = "Bruja",
  ESCORT = "Escort",
  BODYGUARD = "Guardaespaldas",
  SHERIFF = "Sheriff",
  TOWNSPEOPLE = "Pueblo"
}

export enum PlayerStatus {
  ALIVE = "Vivo",
  DEAD = "Muerto",
}

export enum GamePhase {
  SETUP = "SETUP",
  NIGHT = "NIGHT",
  DAY_ANNOUNCEMENT = "DAY_ANNOUNCEMENT",
  DAY_VOTE = "DAY_VOTE",
  GAME_OVER = "GAME_OVER",
}

export enum Faction {
  TOWN = "Pueblo",
  MAFIA = "Mafia",
  VAMPIRE = "Vampiros",
  NEUTRAL = "Neutral"
}

export type Screen = 'welcome' | 'main-menu' | 'setup' | 'roles' | 'game' | 'tutorial' | 'online-lobby' | 'online-game';

export interface Player {
  id: string; // Corresponds to LobbyPlayer uid
  name: string;
  role: Role;
  status: PlayerStatus;
  faction: Faction;
  isProtected: boolean;
  isBlocked: boolean;
  isAlerting: boolean;
  markedForLynch: boolean;
  abilityUses: { [key: string]: number };
  hasGun?: boolean; // For Sheriff check
  canBeRevived: boolean;
  convertedOnDay: number | null;
}

export interface NightAction {
    actorId: string;
    targetId: string | null;
    role: Role;
    type: 'KILL' | 'PROTECT' | 'BLOCK' | 'INVESTIGATE' | 'ALERT' | 'GUARD' | 'REVIVE' | 'CONVERT';
}

// --- Online Multiplayer Types ---

export interface LobbyPlayer {
    uid: string;
    name: string;
    isHost: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  isSystem: boolean; // For announcements like "Player X joined"
  timestamp: number;
}

export interface GameState {
    players: Player[];
    phase: GamePhase;
    dayNumber: number;
    activePlayerId: string | null;
    nightActions: NightAction[];
    announcement: string;
    vampireAction: 'KILL' | 'CONVERT';
    jesterWasLynched: boolean;
    jesterKillTargetId: string | null;
    turnStartTime?: number;
}

export interface GameRoom {
  id: string; // The 3-digit code
  hostId: string;
  status: 'lobby' | 'in-game' | 'finished';
  isPublic: boolean;
  lobbyPlayers: Record<string, LobbyPlayer>;
  gameState?: GameState;
  chat?: Record<string, ChatMessage>;
  dayVotes?: Record<string, string>; // Key: voterId, Value: targetId
}