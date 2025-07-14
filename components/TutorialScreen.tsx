
import React from 'react';
import { ROLE_DETAILS } from '../constants.ts';
import { Role, Faction } from '../types.ts';

interface TutorialScreenProps {
  onBack: () => void;
}

const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBack }) => {
  const rolesByFaction: { [key in Faction]: Role[] } = {
    [Faction.TOWN]: [],
    [Faction.MAFIA]: [],
    [Faction.VAMPIRE]: [],
    [Faction.NEUTRAL]: [],
  };

  const displayableRoles = Object.keys(ROLE_DETAILS) as Role[];
  displayableRoles.forEach(role => {
    const details = ROLE_DETAILS[role];
    if (details.faction) {
      rolesByFaction[details.faction].push(role);
    }
  });

  const renderRole = (role: Role) => {
    const details = ROLE_DETAILS[role];
    return (
      <div key={role} className="bg-gray-700/50 p-4 rounded-lg">
        <h4 className="text-xl font-bold text-red-400">{role}</h4>
        <p className="text-gray-300 mt-1">{details.description}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-red-500 mb-6">Tutorial del Juego</h1>

        <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-8">
          <section>
            <h2 className="text-3xl font-semibold text-yellow-400 mb-3 border-b-2 border-yellow-500 pb-2">Mecánicas Básicas</h2>
            <div className="space-y-6 text-gray-200">
              <div>
                <h3 className="text-xl font-bold">Objetivo</h3>
                <p>El juego se divide en facciones con distintos objetivos. ¡Tu facción determina cómo ganas!</p>
                <ul className="list-disc list-inside mt-2 pl-4">
                  <li><span className="font-bold text-green-400">Pueblo (Town):</span> Deben identificar y eliminar a todos los miembros de la Mafia y los Vampiros.</li>
                  <li><span className="font-bold text-red-500">Mafia:</span> Deben eliminar a las demás facciones hasta que su número sea igual o mayor a la mitad de los jugadores vivos.</li>
                  <li><span className="font-bold text-purple-400">Vampiros:</span> Su objetivo es convertir a otros o matar hasta ser la mayoría del pueblo.</li>
                  <li><span className="font-bold text-gray-400">Neutrales:</span> Cada rol Neutral tiene un objetivo único y personal para ganar.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold">Fases del Juego</h3>
                <p>El juego alterna entre Noche y Día.</p>
                 <ul className="list-disc list-inside mt-2 pl-4">
                  <li><span className="font-bold">Noche:</span> Los jugadores con habilidades nocturnas (Mafia, Médico, etc.) despiertan y realizan sus acciones en secreto. El moderador (esta app) les indicará su turno.</li>
                  <li><span className="font-bold">Día:</span> El moderador anuncia quiénes murieron durante la noche. Los jugadores vivos discuten y debaten sobre quiénes podrían ser los culpables. Al final del día, el pueblo puede votar para linchar a un jugador sospechoso.</li>
                </ul>
              </div>
               <div>
                <h3 className="text-xl font-bold">El Rol del Moderador (¡Tú!)</h3>
                <p className="mt-1">Esta aplicación está diseñada para que uno de los participantes actúe como moderador. Tu papel es crucial:</p>
                <ul className="list-disc list-inside mt-2 pl-4 space-y-1">
                    <li><span className="font-bold">Durante la Noche:</span> Sigue las indicaciones de la app y anuncia en voz alta a qué rol le toca actuar (ej. "Mafia, abrid los ojos. ¿A quién queréis eliminar?"). Después, registra en secreto la acción del jugador en la app.</li>
                    <li><span className="font-bold">Durante el Día:</span> Lee en voz alta los anuncios que muestra la aplicación, como las muertes ocurridas durante la noche.</li>
                    <li><span className="font-bold">Votaciones:</span> Guía el proceso de votación. Cuando el pueblo decida a quién linchar, registra la decisión en la app para ver el resultado.</li>
                </ul>
                <p className="mt-2">Tu función es ser el puente entre el juego digital y la interacción social en la mesa.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-yellow-400 mb-4 border-b-2 border-yellow-500 pb-2">Roles y Habilidades</h2>
            
            <div className="mt-6">
                <h3 className="text-2xl font-bold text-green-400 mb-3">Facción: Pueblo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolesByFaction[Faction.TOWN].map(renderRole)}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-2xl font-bold text-red-500 mb-3">Facción: Mafia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolesByFaction[Faction.MAFIA].map(renderRole)}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-2xl font-bold text-purple-400 mb-3">Facción: Vampiros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolesByFaction[Faction.VAMPIRE].map(renderRole)}
                </div>
            </div>
            
            <div className="mt-6">
                <h3 className="text-2xl font-bold text-gray-400 mb-3">Facción: Neutral</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rolesByFaction[Faction.NEUTRAL].map(renderRole)}
                </div>
            </div>

          </section>
        </div>
        
        <div className="mt-8 text-center">
            <button 
                onClick={onBack} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                Volver
            </button>
        </div>

      </div>
    </div>
  );
};

export default TutorialScreen;