import React from 'react';

interface MainMenuScreenProps {
  onSelectMode: (mode: 'local' | 'online') => void;
  onTutorial: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onSelectMode, onTutorial }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-5xl font-bold text-red-500 mb-8">Pueblo Duerme</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('local')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg text-xl transition-transform transform hover:scale-105"
          >
            Juego Local (Moderador)
          </button>
          <button
            onClick={() => onSelectMode('online')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-xl transition-transform transform hover:scale-105"
          >
            Multijugador Online
          </button>
        </div>

        <div className="mt-8">
            <button onClick={onTutorial} className="text-red-400 hover:text-red-300 underline transition-colors">
                ¿Cómo jugar? (Tutorial)
            </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;