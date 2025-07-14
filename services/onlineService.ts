
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off, push, serverTimestamp, runTransaction } from 'firebase/database';
import { firebaseConfig } from './firebaseConfig.ts';
import { GameRoom, LobbyPlayer, ChatMessage, Role, GameState, Player, NightAction, GamePhase, PlayerStatus } from '../types.ts';
import { assignRoles } from './gameLogic.ts'; // Assuming gameLogic can run on client

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const generateRoomCode = (): string => Math.floor(100 + Math.random() * 900).toString();

// --- Room Management ---

export const createPrivateRoom = async (hostPlayer: LobbyPlayer): Promise<string> => {
    const roomCode = generateRoomCode();
    const roomRef = ref(db, `rooms/${roomCode}`);
    const newRoom: GameRoom = {
        id: roomCode,
        hostId: hostPlayer.uid,
        status: 'lobby',
        isPublic: false,
        lobbyPlayers: { [hostPlayer.uid]: hostPlayer }
    };
    await set(roomRef, newRoom);
    return roomCode;
};

export const joinRoom = async (roomCode: string, player: LobbyPlayer): Promise<GameRoom | null> => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
        throw new Error("La sala no existe.");
    }
    const room = snapshot.val() as GameRoom;
    if (Object.keys(room.lobbyPlayers).length >= 10) {
        throw new Error("La sala está llena.");
    }
    if (room.status !== 'lobby') {
        throw new Error("La partida ya ha comenzado.");
    }
    
    const playerRef = ref(db, `rooms/${roomCode}/lobbyPlayers/${player.uid}`);
    await set(playerRef, player);
    const chatRef = push(ref(db, `rooms/${roomCode}/chat`));
    const joinMessage: ChatMessage = { id: chatRef.key!, senderName: player.name, text: 'se ha unido a la sala.', isSystem: true, timestamp: serverTimestamp() as any };
    await set(chatRef, joinMessage);

    const updatedSnapshot = await get(roomRef);
    return updatedSnapshot.val();
};

export const findPublicRoom = async (player: LobbyPlayer): Promise<string> => {
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);
    if (snapshot.exists()) {
        const rooms = snapshot.val() as Record<string, GameRoom>;
        const availableRooms = Object.values(rooms).filter(
            r => r.isPublic && r.status === 'lobby' && Object.keys(r.lobbyPlayers).length < 10
        );

        if (availableRooms.length > 0) {
            // Join the first available room that has 7 or more players to prioritize filling games
            const priorityRoom = availableRooms.find(r => Object.keys(r.lobbyPlayers).length >= 7);
            const roomToJoin = priorityRoom || availableRooms[0];
            await joinRoom(roomToJoin.id, player);
            return roomToJoin.id;
        }
    }
    // No available public rooms, create a new one
    const roomCode = generateRoomCode();
    const roomRef = ref(db, `rooms/${roomCode}`);
    const newRoom: GameRoom = {
        id: roomCode,
        hostId: player.uid,
        status: 'lobby',
        isPublic: true,
        lobbyPlayers: { [player.uid]: player }
    };
    await set(roomRef, newRoom);
    return roomCode;
};


export const listenToRoom = (roomCode: string, callback: (room: GameRoom) => void) => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });
    return () => off(roomRef);
};

// --- Game Actions (Host-driven) ---

export const startGame = async (roomCode: string, roles: Role[]) => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    
    await runTransaction(roomRef, (currentRoom: GameRoom | null) => {
        if (currentRoom && currentRoom.status === 'lobby') {
            const playerNames = Object.values(currentRoom.lobbyPlayers).map(p => p.name);
            const playerUids = Object.values(currentRoom.lobbyPlayers).map(p => p.uid);

            const assignedPlayers = assignRoles(playerNames, roles).map((p, i) => ({...p, id: playerUids[i]}));

            const initialState: GameState = {
                players: assignedPlayers,
                phase: GamePhase.NIGHT,
                dayNumber: 1,
                activePlayerId: null, // This will be set by the game loop logic
                nightActions: [],
                announcement: 'La partida ha comenzado. Cae la noche...',
                vampireAction: 'CONVERT',
                jesterWasLynched: false,
                jesterKillTargetId: null,
                turnStartTime: Date.now()
            };

            currentRoom.status = 'in-game';
            currentRoom.gameState = initialState;
            
            const chatRef = push(ref(db, `rooms/${roomCode}/chat`));
            const startMessage: ChatMessage = { id: chatRef.key!, senderName: 'Sistema', text: 'La partida ha comenzado.', isSystem: true, timestamp: serverTimestamp() as any };
            if(!currentRoom.chat) currentRoom.chat = {};
            currentRoom.chat[chatRef.key!] = startMessage;

            return currentRoom;
        }
        return currentRoom; // Abort transaction
    });
};


// --- Player Actions ---

export const sendChatMessage = async (roomCode: string, senderName: string, text: string) => {
    const chatRef = ref(db, `rooms/${roomCode}/chat`);
    const newMessageRef = push(chatRef);
    const message: ChatMessage = {
        id: newMessageRef.key!,
        senderName,
        text,
        isSystem: false,
        timestamp: serverTimestamp() as any,
    };
    await set(newMessageRef, message);
};

export const submitNightAction = async (roomCode: string, action: NightAction) => {
    const actionRef = ref(db, `rooms/${roomCode}/gameState/nightActions`);
    await runTransaction(actionRef, (currentActions: NightAction[] | null) => {
        if (currentActions === null) return [action];
        // Prevent duplicate actions from the same person
        if (!currentActions.some(a => a.actorId === action.actorId)) {
            currentActions.push(action);
        }
        return currentActions;
    });
};

export const submitDayVote = async (roomCode: string, voterId: string, targetId: string) => {
    const voteRef = ref(db, `rooms/${roomCode}/dayVotes/${voterId}`);
    await set(voteRef, targetId);
};


export const updateGameState = async (roomCode: string, newState: GameState) => {
     const stateRef = ref(db, `rooms/${roomCode}/gameState`);
     await set(stateRef, newState);
}