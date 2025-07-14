import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-2xl animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-bold text-red-500" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          Pueblo Duerme
        </h1>
        <p className="mt-4 text-xl md:text-2xl text-gray-300">
          El moderador digital para tus partidas de Mafia y roles ocultos.
        </p>
        <p className="mt-8 text-lg text-gray-400 max-w-lg mx-auto">
          ¡Deja que la app se encargue de las reglas y el orden de los turnos para que todos puedan jugar! Configura tu partida, asigna roles y que comience la noche...
        </p>
        <button
          onClick={onStart}
          className="mt-12 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg"
        >
          Comenzar a Jugar
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
