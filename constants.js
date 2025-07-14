import { Role, Faction } from './types.js';

export const VAMPIRE_ROLES = [Role.VAMPIRE_JOVEN, Role.VAMPIRE_VIEJO, Role.VAMPIRE];

export const ROLE_DETAILS: { [key in Role]: { faction: Faction, hasGun?: boolean, description: string } } = {
  [Role.MAFIA]: { faction: Faction.MAFIA, hasGun: true, description: "Elige a quién eliminar." },
  [Role.VETERAN]: { faction: Faction.TOWN, hasGun: true, description: "Ponte en alerta para protegerte y matar a tus visitantes." },
  [Role.DOCTOR]: { faction: Faction.TOWN, description: "Elige a quién proteger de la muerte." },
  [Role.JESTER]: { faction: Faction.NEUTRAL, description: "Tu objetivo es que te linchen. Si lo consigues, ganas y puedes matar a alguien." },
  [Role.VAMPIRE]: { faction: Faction.VAMPIRE, hasGun: true, description: "Un vampiro recién convertido. Espera tu ascenso." },
  [Role.VAMPIRE_VIEJO]: { faction: Faction.VAMPIRE, hasGun: true, description: "Junto a tu facción, alternas entre convertir y matar." },
  [Role.VAMPIRE_JOVEN]: { faction: Faction.VAMPIRE, hasGun: true, description: "Junto a tu facción, alternas entre convertir y matar." },
  [Role.WITCH]: { faction: Faction.NEUTRAL, description: "Puedes revivir a un jugador una vez por partida." },
  [Role.ESCORT]: { faction: Faction.TOWN, description: "Elige a quién bloquear su habilidad esta noche." },
  [Role.BODYGUARD]: { faction: Faction.TOWN, hasGun: true, description: "Elige a quién proteger. Mueres en su lugar si es atacado." },
  [Role.SHERIFF]: { faction: Faction.TOWN, description: "Investiga si un jugador tiene 'arma'." },
  [Role.TOWNSPEOPLE]: { faction: Faction.TOWN, description: "Descubre y elimina a las facciones enemigas." },
};


export const ROLES_BY_PLAYER_COUNT: { [count: number]: Role[] } = {
    1: [Role.JESTER],
    2: [Role.MAFIA, Role.SHERIFF],
    3: [Role.MAFIA, Role.SHERIFF, Role.DOCTOR],
    4: [Role.MAFIA, Role.SHERIFF, Role.DOCTOR, Role.ESCORT],
    5: [Role.MAFIA, Role.SHERIFF, Role.DOCTOR, Role.ESCORT, Role.VETERAN],
    6: [Role.MAFIA, Role.VAMPIRE_VIEJO, Role.SHERIFF, Role.DOCTOR, Role.ESCORT, Role.VETERAN],
    7: [Role.MAFIA, Role.VAMPIRE_VIEJO, Role.SHERIFF, Role.DOCTOR, Role.ESCORT, Role.BODYGUARD, Role.VETERAN],
    8: [Role.MAFIA, Role.MAFIA, Role.VAMPIRE_VIEJO, Role.SHERIFF, Role.DOCTOR, Role.ESCORT, Role.BODYGUARD, Role.VETERAN],
    9: [Role.MAFIA, Role.MAFIA, Role.VAMPIRE_VIEJO, Role.SHERIFF, Role.DOCTOR, Role.ESCORT, Role.BODYGUARD, Role.VETERAN, Role.WITCH],
    10: [Role.MAFIA, Role.MAFIA, Role.VAMPIRE_VIEJO, Role.VAMPIRE_JOVEN, Role.SHERIFF, Role.DOCTOR, Role.ESCORT, Role.BODYGUARD, Role.WITCH, Role.JESTER],
};

export const NIGHT_ACTION_ORDER: Role[] = [
    Role.ESCORT,
    Role.VETERAN,
    Role.DOCTOR,
    Role.BODYGUARD,
    Role.SHERIFF,
    Role.MAFIA,
    Role.VAMPIRE_VIEJO, // This acts as the trigger for the vampire faction turn
    Role.WITCH,
    Role.JESTER, // For post-lynch kill
];